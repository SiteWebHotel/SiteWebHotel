import { z } from "zod/v4";

export const searchAvailabilitySchema = z
  .object({
    arrivalDate: z.iso.date({ message: "Date d'arrivée invalide" }),
    departureDate: z.iso.date({ message: "Date de départ invalide" }),
    guestCount: z
      .number({ message: "Nombre de personnes invalide" })
      .int()
      .min(1, "Au moins 1 personne")
      .max(10, "Maximum 10 personnes"),
  })
  .refine(
    (data) => new Date(data.departureDate) > new Date(data.arrivalDate),
    {
      message: "La date de départ doit être après la date d'arrivée",
      path: ["departureDate"],
    }
  )
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(data.arrivalDate) >= today;
    },
    {
      message: "La date d'arrivée ne peut pas être dans le passé",
      path: ["arrivalDate"],
    }
  );

export const bookingGuestSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  email: z.email("Email invalide"),
  phone: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export const createBookingSchema = z.object({
  arrivalDate: z.iso.date(),
  departureDate: z.iso.date(),
  guestCount: z.number().int().min(1).max(10),
  roomTypeId: z.string().min(1),
  guest: bookingGuestSchema,
});

export type SearchAvailabilityInput = z.infer<typeof searchAvailabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingGuestInput = z.infer<typeof bookingGuestSchema>;
