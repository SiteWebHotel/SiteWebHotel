"use server";

import { revalidatePath } from "next/cache";
import {
  searchAvailabilitySchema,
  createBookingSchema,
} from "@/lib/validations/booking";
import {
  findAvailableRoomTypes,
  calculateBookingTotal,
  createBooking,
  updateBookingStatus,
} from "@/server/booking-service";
import { createCheckoutSession } from "@/server/payment-service";
import { BookingStatus } from "@prisma/client";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function searchAvailabilityAction(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    arrivalDate: formData.get("arrivalDate") as string,
    departureDate: formData.get("departureDate") as string,
    guestCount: Number(formData.get("guestCount")),
  };

  const result = searchAvailabilitySchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Vérifiez les champs", fieldErrors };
  }

  try {
    const arrivalDate = new Date(result.data.arrivalDate);
    const departureDate = new Date(result.data.departureDate);

    const roomTypes = await findAvailableRoomTypes(
      arrivalDate,
      departureDate,
      result.data.guestCount
    );

    const roomTypesWithPricing = await Promise.all(
      roomTypes.map(async (rt) => {
        const pricing = await calculateBookingTotal(
          rt.id,
          arrivalDate,
          departureDate
        );
        return {
          id: rt.id,
          name: rt.name,
          slug: rt.slug,
          description: rt.shortDescription || rt.description,
          maxOccupancy: rt.maxOccupancy,
          bedType: rt.bedType,
          surfaceArea: rt.surfaceArea,
          basePrice: rt.basePrice,
          availableCount: rt.availableCount,
          photos: rt.photos.map((p) => ({ url: p.url, alt: p.alt })),
          amenities: rt.amenities.map((a) => a.amenity.name),
          pricing,
        };
      })
    );

    return { success: true, data: roomTypesWithPricing };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur lors de la recherche",
    };
  }
}

export async function createBookingAction(
  input: unknown
): Promise<ActionResult> {
  const result = createBookingSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Vérifiez les champs", fieldErrors };
  }

  try {
    const booking = await createBooking({
      arrivalDate: new Date(result.data.arrivalDate),
      departureDate: new Date(result.data.departureDate),
      guestCount: result.data.guestCount,
      roomTypeId: result.data.roomTypeId,
      guest: result.data.guest,
    });

    const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

    if (stripeEnabled) {
      const session = await createCheckoutSession(booking.id);
      return {
        success: true,
        data: {
          id: booking.id,
          checkoutUrl: session.url,
        },
      };
    }

    return {
      success: true,
      data: {
        id: booking.id,
        arrivalDate: result.data.arrivalDate,
        departureDate: result.data.departureDate,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        roomTypeName: booking.roomType.name,
        roomNumber: booking.room?.number,
        guestName: `${result.data.guest.firstName} ${result.data.guest.lastName}`,
      },
    };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Erreur lors de la création de la réservation",
    };
  }
}

export async function changeBookingStatusAction(
  bookingId: string,
  status: BookingStatus
) {
  await updateBookingStatus(bookingId, status);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}
