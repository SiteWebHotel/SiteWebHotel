import type { Metadata } from "next";
import { getHotelSettings } from "@/server/hotel-service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHotelSettings();
  return {
    title: "Mentions légales",
    description: `Mentions légales du site de ${settings.name}.`,
    robots: { index: false },
  };
}

export default async function LegalPage() {
  const settings = await getHotelSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">Mentions légales</h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-stone-600">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Éditeur du site
          </h2>
          <p>
            {settings.name}
            <br />
            {settings.address}
            <br />
            {settings.postalCode} {settings.city}, {settings.country}
            <br />
            Téléphone : {settings.phone}
            <br />
            Email : {settings.email}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Hébergement
          </h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, États-Unis.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images,
            photographies, logo) est la propriété de {settings.name} ou de ses
            partenaires. Toute reproduction sans autorisation préalable est
            interdite.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Données personnelles
          </h2>
          <p>
            Les données collectées lors d&apos;une réservation sont utilisées
            uniquement pour la gestion de votre séjour. Elles ne sont transmises
            à aucun tiers. Conformément au RGPD, vous pouvez exercer vos droits
            d&apos;accès, de rectification et de suppression en nous contactant
            à {settings.email}.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Cookies
          </h2>
          <p>
            Ce site utilise des cookies techniques nécessaires à son bon
            fonctionnement. Aucun cookie publicitaire ou de traçage n&apos;est
            utilisé.
          </p>
        </section>
      </div>
    </div>
  );
}
