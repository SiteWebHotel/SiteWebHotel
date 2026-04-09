import { prisma } from "@/lib/prisma";
import { HOTEL_DEFAULTS } from "@/lib/hotel-config";

export async function getHotelSettings() {
  let settings = await prisma.hotelSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.hotelSettings.create({
      data: {
        id: "singleton",
        ...HOTEL_DEFAULTS,
      },
    });
  }

  return settings;
}

type HotelSettingsUpdate = Partial<{
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  latitude: number;
  longitude: number;
  receptionHours: string;
  accessDescription: string;
  parkingInfo: string;
  googleMapsUrl: string;
}>;

const NULLABLE_FIELDS = [
  "website",
  "receptionHours",
  "accessDescription",
  "parkingInfo",
  "googleMapsUrl",
] as const;

export async function updateHotelSettings(data: HotelSettingsUpdate) {
  const cleanData: Record<string, unknown> = { ...data };
  for (const field of NULLABLE_FIELDS) {
    if (field in cleanData && cleanData[field] === "") {
      cleanData[field] = null;
    }
  }

  return prisma.hotelSettings.upsert({
    where: { id: "singleton" },
    update: cleanData,
    create: {
      id: "singleton",
      ...HOTEL_DEFAULTS,
      ...cleanData,
    },
  });
}
