import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { getHotelSettings } from "@/server/hotel-service";

async function getFeaturedRoomTypes() {
  return prisma.roomType.findMany({
    where: { isActive: true },
    include: {
      photos: { orderBy: { displayOrder: "asc" }, take: 1 },
      amenities: { include: { amenity: true } },
    },
    orderBy: { displayOrder: "asc" },
    take: 3,
  });
}

export default async function HomePage() {
  const [roomTypes, settings] = await Promise.all([
    getFeaturedRoomTypes(),
    getHotelSettings(),
  ]);

  return (
    <>
      <JsonLd hotel={settings} />

      {/* Hero */}
      <section className="relative bg-stone-100 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800 md:text-4xl lg:text-5xl">
            Bienvenue à l&apos;{settings.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
            {settings.description}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/reservation">
              <Button size="lg">Vérifier les disponibilités</Button>
            </Link>
            <Link href="/chambres">
              <Button variant="outline" size="lg">
                Voir nos chambres
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Chambres en vedette */}
      {roomTypes.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-stone-800">
              Nos chambres
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/chambres/${rt.slug}`}
                  className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-stone-200">
                    {rt.photos[0] && (
                      <Image
                        src={rt.photos[0].url}
                        alt={rt.photos[0].alt || rt.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-stone-800 group-hover:text-stone-600">
                      {rt.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {rt.maxOccupancy} pers.
                      </span>
                      {rt.surfaceArea && <span>{rt.surfaceArea} m²</span>}
                    </div>
                    {rt.shortDescription && (
                      <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                        {rt.shortDescription}
                      </p>
                    )}
                    <p className="mt-3 text-lg font-semibold text-stone-800">
                      {formatPrice(rt.basePrice)}{" "}
                      <span className="text-sm font-normal text-stone-500">
                        / nuit
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/chambres">
                <Button variant="outline">Voir toutes les chambres</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Réservation */}
      <section className="bg-stone-800 py-16 text-center text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Réservez votre séjour</h2>
          <p className="mt-3 text-stone-300">
            Réservation simple et rapide. Meilleur tarif garanti en direct.
          </p>
          <Link href="/reservation" className="mt-6 inline-block">
            <Button variant="inverse" size="lg">
              Réserver maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Infos pratiques */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-stone-800">
            Informations pratiques
          </h2>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
              <div>
                <h3 className="font-medium text-stone-800">Adresse</h3>
                <p className="text-sm text-stone-600">
                  {settings.address}
                  <br />
                  {settings.postalCode} {settings.city}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
              <div>
                <h3 className="font-medium text-stone-800">Téléphone</h3>
                <p className="text-sm text-stone-600">{settings.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
              <div>
                <h3 className="font-medium text-stone-800">
                  Arrivée / Départ
                </h3>
                <p className="text-sm text-stone-600">
                  Arrivée à partir de {settings.checkInTime}
                  <br />
                  Départ avant {settings.checkOutTime}
                </p>
              </div>
            </div>
            {settings.receptionHours && (
              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
                <div>
                  <h3 className="font-medium text-stone-800">Accueil</h3>
                  <p className="text-sm text-stone-600">
                    Réception : {settings.receptionHours}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
