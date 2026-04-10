import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Users, Maximize2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getRoomType(slug: string) {
  return prisma.roomType.findUnique({
    where: { slug, isActive: true },
    include: {
      photos: { orderBy: { displayOrder: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rt = await getRoomType(slug);
  if (!rt) return {};

  return {
    title: rt.name,
    description:
      rt.shortDescription ||
      `${rt.name} – Hôtel du Commerce à Bellegarde. ${rt.maxOccupancy} personnes, à partir de ${rt.basePrice}€/nuit.`,
  };
}

export default async function RoomTypePage({ params }: Props) {
  const { slug } = await params;
  const rt = await getRoomType(slug);
  if (!rt) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/chambres" className="hover:text-stone-700">
          Nos chambres
        </Link>
        <span className="mx-2">›</span>
        <span className="text-stone-700">{rt.name}</span>
      </nav>

      {/* Photos */}
      {rt.photos.length > 0 && (
        <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rt.photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-lg bg-stone-200 ${
                i === 0
                  ? "aspect-[4/3] sm:col-span-2 lg:col-span-2 lg:row-span-2"
                  : "aspect-[4/3]"
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.alt || `${rt.name} - photo ${i + 1}`}
                fill
                className="object-cover"
                sizes={i === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Infos principales */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-stone-800">{rt.name}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Jusqu&apos;à {rt.maxOccupancy} personne
              {rt.maxOccupancy > 1 ? "s" : ""}
            </span>
            {rt.surfaceArea && (
              <span className="flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" />
                {rt.surfaceArea} m²
              </span>
            )}
            {rt.bedType && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                {rt.bedType}
              </span>
            )}
          </div>

          <div className="mt-6 whitespace-pre-line text-stone-600 leading-relaxed">
            {rt.description}
          </div>

          {rt.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-stone-800">
                Équipements
              </h2>
              <div className="flex flex-wrap gap-2">
                {rt.amenities.map(({ amenity }) => (
                  <span
                    key={amenity.id}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700"
                  >
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar réservation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-2xl font-bold text-stone-800">
              {formatPrice(rt.basePrice)}
              <span className="text-base font-normal text-stone-500">
                {" "}
                / nuit
              </span>
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Prix de base par nuit. Tarif susceptible de varier selon la saison.
            </p>
            <Link href={`/reservation?type=${rt.slug}`} className="mt-4 block">
              <Button className="w-full" size="lg">
                Réserver cette chambre
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-stone-400">
              Annulation possible selon conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
