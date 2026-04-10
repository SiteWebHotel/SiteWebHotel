import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos chambres",
  description:
    "Découvrez les chambres de l'Hôtel du Commerce à Bellegarde. Chambres confortables pour couples, familles et voyageurs.",
};

async function getRoomTypes() {
  return prisma.roomType.findMany({
    where: { isActive: true },
    include: {
      photos: { orderBy: { displayOrder: "asc" }, take: 3 },
      amenities: { include: { amenity: true } },
    },
    orderBy: { displayOrder: "asc" },
  });
}

export default async function RoomsPage() {
  const roomTypes = await getRoomTypes();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">Nos chambres</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Des chambres simples et confortables, pour une nuit ou un séjour plus
        long. Chaque chambre est équipée de tout le nécessaire pour un repos
        agréable.
      </p>

      <div className="mt-10 space-y-8">
        {roomTypes.map((rt) => (
          <div
            key={rt.id}
            className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:flex"
          >
            <div className="relative aspect-[4/3] bg-stone-200 md:aspect-auto md:w-80 md:shrink-0">
              {rt.photos[0] && (
                <Image
                  src={rt.photos[0].url}
                  alt={rt.photos[0].alt || rt.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-800">
                  {rt.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Jusqu&apos;à {rt.maxOccupancy} personne
                    {rt.maxOccupancy > 1 ? "s" : ""}
                  </span>
                  {rt.surfaceArea && <span>{rt.surfaceArea} m²</span>}
                  {rt.bedType && <span>{rt.bedType}</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {rt.shortDescription || rt.description}
                </p>
                {rt.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rt.amenities.map(({ amenity }) => (
                      <span
                        key={amenity.id}
                        className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
                      >
                        {amenity.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-xl font-semibold text-stone-800">
                  {formatPrice(rt.basePrice)}
                  <span className="text-sm font-normal text-stone-500">
                    {" "}
                    / nuit
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link href={`/chambres/${rt.slug}`} className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full min-h-[44px] sm:w-auto">
                      Détails
                    </Button>
                  </Link>
                  <Link href={`/reservation?type=${rt.slug}`} className="flex-1 sm:flex-none">
                    <Button className="w-full min-h-[44px] sm:w-auto">Réserver</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {roomTypes.length === 0 && (
        <p className="mt-10 text-center text-stone-500">
          Aucune chambre disponible pour le moment.
        </p>
      )}
    </div>
  );
}
