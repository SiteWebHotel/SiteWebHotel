import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { calculateStayNights } from "@/lib/utils";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
];

/**
 * Find room IDs that are unavailable (booked or blocked) for the given date range.
 * Arrival is inclusive, departure is exclusive.
 */
async function findUnavailableRoomIds(
  arrivalDate: Date,
  departureDate: Date,
  excludeBookingId?: string
): Promise<string[]> {
  const bookedRoomIds = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_BOOKING_STATUSES },
      roomId: { not: null },
      arrivalDate: { lt: departureDate },
      departureDate: { gt: arrivalDate },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { roomId: true },
  });

  const blockedRoomIds = await prisma.availabilityBlock.findMany({
    where: {
      startDate: { lt: departureDate },
      endDate: { gt: arrivalDate },
    },
    select: { roomId: true },
  });

  const ids = new Set<string>();
  for (const b of bookedRoomIds) {
    if (b.roomId) ids.add(b.roomId);
  }
  for (const b of blockedRoomIds) {
    ids.add(b.roomId);
  }
  return Array.from(ids);
}

export async function findAvailableRooms(
  arrivalDate: Date,
  departureDate: Date,
  guestCount: number
) {
  const unavailableIds = await findUnavailableRoomIds(arrivalDate, departureDate);

  return prisma.room.findMany({
    where: {
      id: { notIn: unavailableIds },
      status: "ACTIVE",
      roomType: {
        isActive: true,
        maxOccupancy: { gte: guestCount },
      },
    },
    include: {
      roomType: {
        include: {
          photos: { orderBy: { displayOrder: "asc" }, take: 1 },
          amenities: { include: { amenity: true } },
        },
      },
    },
    orderBy: { roomType: { displayOrder: "asc" } },
  });
}

export async function findAvailableRoomTypes(
  arrivalDate: Date,
  departureDate: Date,
  guestCount: number
) {
  const unavailableIds = await findUnavailableRoomIds(arrivalDate, departureDate);

  const roomTypes = await prisma.roomType.findMany({
    where: {
      isActive: true,
      maxOccupancy: { gte: guestCount },
      rooms: {
        some: {
          status: "ACTIVE",
          id: { notIn: unavailableIds },
        },
      },
    },
    include: {
      photos: { orderBy: { displayOrder: "asc" }, take: 3 },
      amenities: { include: { amenity: true } },
      rooms: {
        where: {
          status: "ACTIVE",
          id: { notIn: unavailableIds },
        },
        select: { id: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return roomTypes.map((rt) => ({
    ...rt,
    availableCount: rt.rooms.length,
  }));
}

export async function calculateBookingTotal(
  roomTypeId: string,
  arrivalDate: Date,
  departureDate: Date
): Promise<{ nights: number; pricePerNight: number; totalPrice: number }> {
  const nights = calculateStayNights(arrivalDate, departureDate);
  if (nights <= 0) throw new Error("Durée de séjour invalide");

  const pricingRule = await prisma.pricingRule.findFirst({
    where: {
      roomTypeId,
      startDate: { lte: arrivalDate },
      endDate: { gte: departureDate },
      OR: [{ minNights: null }, { minNights: { lte: nights } }],
    },
    orderBy: { pricePerNight: "asc" },
  });

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    select: { basePrice: true },
  });

  if (!roomType) throw new Error("Type de chambre introuvable");

  const pricePerNight = pricingRule?.pricePerNight ?? roomType.basePrice;
  const totalPrice = pricePerNight * nights;

  return { nights, pricePerNight, totalPrice };
}

export async function createBooking(params: {
  arrivalDate: Date;
  departureDate: Date;
  guestCount: number;
  roomTypeId: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message?: string;
  };
}) {
  const { arrivalDate, departureDate, guestCount, roomTypeId, guest } = params;

  return prisma.$transaction(async (tx) => {
    const unavailableIds = await tx.booking
      .findMany({
        where: {
          status: { in: ACTIVE_BOOKING_STATUSES },
          roomId: { not: null },
          arrivalDate: { lt: departureDate },
          departureDate: { gt: arrivalDate },
        },
        select: { roomId: true },
      })
      .then((bookings) =>
        bookings.map((b) => b.roomId).filter((id): id is string => id !== null)
      );

    const blockedIds = await tx.availabilityBlock
      .findMany({
        where: {
          startDate: { lt: departureDate },
          endDate: { gt: arrivalDate },
        },
        select: { roomId: true },
      })
      .then((blocks) => blocks.map((b) => b.roomId));

    const allUnavailable = [...new Set([...unavailableIds, ...blockedIds])];

    const availableRoom = await tx.room.findFirst({
      where: {
        roomTypeId,
        status: "ACTIVE",
        id: { notIn: allUnavailable },
        roomType: { maxOccupancy: { gte: guestCount } },
      },
    });

    if (!availableRoom) {
      throw new Error("Aucune chambre disponible pour ces dates et ce type");
    }

    const { nights, totalPrice } = await (async () => {
      const n = calculateStayNights(arrivalDate, departureDate);
      const rt = await tx.roomType.findUnique({
        where: { id: roomTypeId },
        select: { basePrice: true },
      });
      if (!rt) throw new Error("Type de chambre introuvable");

      const rule = await tx.pricingRule.findFirst({
        where: {
          roomTypeId,
          startDate: { lte: arrivalDate },
          endDate: { gte: departureDate },
          OR: [{ minNights: null }, { minNights: { lte: n } }],
        },
        orderBy: { pricePerNight: "asc" },
      });
      const ppn = rule?.pricePerNight ?? rt.basePrice;
      return { nights: n, totalPrice: ppn * n };
    })();

    const booking = await tx.booking.create({
      data: {
        arrivalDate,
        departureDate,
        nights,
        guestCount,
        totalPrice,
        status: "PENDING",
        roomTypeId,
        roomId: availableRoom.id,
        guest: {
          create: {
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone,
            message: guest.message,
          },
        },
      },
      include: {
        roomType: true,
        room: true,
        guest: true,
      },
    });

    return booking;
  });
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) throw new Error("Réservation introuvable");
  if (booking.status === "CANCELLED") throw new Error("Déjà annulée");

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
}

export async function createAvailabilityBlock(params: {
  startDate: Date;
  endDate: Date;
  reason: "MAINTENANCE" | "OWNER_USE" | "SEASONAL_CLOSURE" | "OTHER";
  notes?: string;
  roomId: string;
}) {
  return prisma.availabilityBlock.create({
    data: params,
  });
}

export async function getOccupancyCalendarData(
  startDate: Date,
  endDate: Date
) {
  const [bookings, blocks, rooms] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ACTIVE_BOOKING_STATUSES },
        arrivalDate: { lt: endDate },
        departureDate: { gt: startDate },
      },
      include: { room: true, roomType: true, guest: true },
      orderBy: { arrivalDate: "asc" },
    }),
    prisma.availabilityBlock.findMany({
      where: {
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      include: { room: true },
    }),
    prisma.room.findMany({
      where: { status: "ACTIVE" },
      include: { roomType: true },
      orderBy: [{ roomType: { displayOrder: "asc" } }, { number: "asc" }],
    }),
  ]);

  return { bookings, blocks, rooms };
}
