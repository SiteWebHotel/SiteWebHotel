import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalRooms,
    totalRoomTypes,
    pendingBookings,
    confirmedBookings,
    todayArrivals,
    todayDepartures,
  ] = await Promise.all([
    prisma.room.count({ where: { status: "ACTIVE" } }),
    prisma.roomType.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({
      where: {
        arrivalDate: today,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.booking.count({
      where: {
        departureDate: today,
        status: "CHECKED_IN",
      },
    }),
  ]);

  return {
    totalRooms,
    totalRoomTypes,
    pendingBookings,
    confirmedBookings,
    todayArrivals,
    todayDepartures,
  };
}

export async function getRecentBookings(limit = 10) {
  return prisma.booking.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      roomType: true,
      room: true,
      guest: true,
    },
  });
}
