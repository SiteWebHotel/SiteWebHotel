import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Car, Navigation, ExternalLink } from "lucide-react";
import { getHotelSettings } from "@/server/hotel-service";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHotelSettings();
  return {
    title: "Contact",
    description: `Contactez ${settings.name} à ${settings.city}. Téléphone, email, adresse et horaires d'accueil.`,
  };
}

export default async function ContactPage() {
  const settings = await getHotelSettings();

  const fullAddress = `${settings.address}, ${settings.postalCode} ${settings.city}, ${settings.country}`;

  const mapsEmbedUrl = settings.googleMapsUrl
    ? settings.googleMapsUrl
    : `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  const mapsLinkUrl = settings.googleMapsUrl
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">Nous contacter</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        N&apos;hésitez pas à nous contacter pour toute question sur votre
        séjour, une demande particulière ou une réservation.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Coordonnées */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
            <div>
              <h2 className="font-semibold text-stone-800">Adresse</h2>
              <p className="mt-1 text-stone-600">
                {settings.address}
                <br />
                {settings.postalCode} {settings.city}, {settings.country}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
            <div>
              <h2 className="font-semibold text-stone-800">Téléphone</h2>
              <p className="mt-1 text-stone-600">
                <a
                  href={`tel:${settings.phone}`}
                  className="hover:text-stone-800"
                >
                  {settings.phone}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
            <div>
              <h2 className="font-semibold text-stone-800">Email</h2>
              <p className="mt-1 text-stone-600">
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-stone-800"
                >
                  {settings.email}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-stone-500" />
            <div>
              <h2 className="font-semibold text-stone-800">Horaires</h2>
              <p className="mt-1 text-stone-600">
                {settings.receptionHours && (
                  <>
                    Réception : {settings.receptionHours}
                    <br />
                  </>
                )}
                Arrivée à partir de {settings.checkInTime}
                <br />
                Départ avant {settings.checkOutTime}
              </p>
            </div>
          </div>

          <a
            href={mapsLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="mt-2 gap-2">
              <Navigation className="h-4 w-4" />
              Voir l&apos;itinéraire
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <iframe
            title={`Carte – ${settings.name}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="h-80 w-full lg:h-full lg:min-h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      {/* Accès et informations pratiques */}
      {(settings.accessDescription || settings.parkingInfo) && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-stone-800">
            Accès et informations pratiques
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {settings.accessDescription && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-stone-600" />
                  <h3 className="font-semibold text-stone-800">Accès</h3>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {settings.accessDescription}
                </p>
              </div>
            )}

            {settings.parkingInfo && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Car className="h-5 w-5 text-stone-600" />
                  <h3 className="font-semibold text-stone-800">Parking</h3>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {settings.parkingInfo}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
