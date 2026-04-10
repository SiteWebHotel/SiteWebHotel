export const HOTEL_DEFAULTS = {
  name: "Hôtel du Commerce",
  address: "",
  city: "Bellegarde",
  postalCode: "",
  country: "France",
  phone: "",
  email: "",
  website: "",
  description: "",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  receptionHours: null as string | null,
  accessDescription: null as string | null,
  parkingInfo: null as string | null,
  googleMapsUrl: null as string | null,
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://hotelducommercebellegarde.vercel.app";
