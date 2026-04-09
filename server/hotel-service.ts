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

export async function updateHotelSettings(
  data: Partial<{
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
  }>
) {
  return prisma.hotelSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: {
      id: "singleton",
      ...HOTEL_DEFAULTS,
      ...data,
    },
  });
}
