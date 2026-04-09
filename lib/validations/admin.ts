import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export const roomTypeSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
  description: z.string().min(1, "Description requise"),
  shortDescription: z.string().max(300).optional(),
  basePrice: z.number().positive("Le prix doit être positif"),
  maxOccupancy: z.number().int().min(1).max(20),
  bedType: z.string().optional(),
  surfaceArea: z.number().positive().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const roomSchema = z.object({
  number: z.string().min(1, "Numéro requis"),
  floor: z.number().int().optional(),
  roomTypeId: z.string().min(1, "Type de chambre requis"),
  notes: z.string().optional(),
});

export const amenitySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  icon: z.string().optional(),
  category: z.string().optional(),
});

export const availabilityBlockSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  reason: z.enum(["MAINTENANCE", "OWNER_USE", "SEASONAL_CLOSURE", "OTHER"]),
  notes: z.string().optional(),
  roomId: z.string().min(1),
});

export const hotelSettingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
  email: z.email(),
  website: z.string().optional(),
  checkInTime: z.string().min(1),
  checkOutTime: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  receptionHours: z.string().optional(),
  accessDescription: z.string().optional(),
  parkingInfo: z.string().optional(),
  googleMapsUrl: z.string().url("URL Google Maps invalide").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type AmenityInput = z.infer<typeof amenitySchema>;
export type AvailabilityBlockInput = z.infer<typeof availabilityBlockSchema>;
export type HotelSettingsInput = z.infer<typeof hotelSettingsSchema>;
