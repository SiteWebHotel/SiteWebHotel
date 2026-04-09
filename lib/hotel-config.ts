export const HOTEL_DEFAULTS = {
  name: "Hôtel Le Clos Familial",
  address: "12 Rue des Tilleuls",
  city: "Amboise",
  postalCode: "37400",
  country: "France",
  phone: "+33 2 47 00 00 00",
  email: "contact@leclosfamilial.fr",
  website: "https://www.leclosfamilial.fr",
  description:
    "Un hôtel familial au cœur de la Vallée de la Loire, idéalement situé pour découvrir les châteaux et la douceur de vivre tourangelle.",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  receptionHours: null as string | null,
  accessDescription: null as string | null,
  parkingInfo: null as string | null,
  googleMapsUrl: null as string | null,
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.leclosfamilial.fr";
