import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/hotel-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/chambres`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/reservation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const roomTypePages: MetadataRoute.Sitemap = roomTypes.map((rt) => ({
    url: `${SITE_URL}/chambres/${rt.slug}`,
    lastModified: rt.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...roomTypePages];
}
