import type { Metadata } from "next";
import Link from "next/link";
import { getHotelSettings } from "@/server/hotel-service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHotelSettings();
  return {
    title: "Politique de confidentialité",
    description: `Politique de confidentialité et protection des données de ${settings.name}.`,
    robots: { index: false },
  };
}

export default async function PrivacyPolicyPage() {
  const settings = await getHotelSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">
        Politique de confidentialité
      </h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-stone-600">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Responsable du traitement
          </h2>
          <p>
            {settings.name}
            <br />
            {settings.address}, {settings.postalCode} {settings.city},{" "}
            {settings.country}
            <br />
            Email : {settings.email}
            <br />
            Téléphone : {settings.phone}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Données collectées
          </h2>
          <p>
            Lors d&apos;une réservation, nous collectons les informations
            suivantes : nom, prénom, adresse email, numéro de téléphone, et
            éventuellement un message ou une demande particulière.
          </p>
          <p className="mt-2">
            Ces données sont strictement nécessaires à la gestion de votre
            réservation et de votre séjour.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Finalités du traitement
          </h2>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Gestion des réservations et du séjour</li>
            <li>Communication relative à votre réservation</li>
            <li>Respect de nos obligations légales et comptables</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Base légale
          </h2>
          <p>
            Le traitement de vos données repose sur l&apos;exécution du contrat
            de réservation (article 6.1.b du RGPD) et, le cas échéant, sur
            notre intérêt légitime à gérer notre activité hôtelière.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Destinataires des données
          </h2>
          <p>
            Vos données personnelles ne sont transmises à aucun tiers à des
            fins commerciales. Elles sont accessibles uniquement au personnel
            de l&apos;hôtel en charge de la gestion des réservations.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Durée de conservation
          </h2>
          <p>
            Les données liées à une réservation sont conservées pendant la
            durée nécessaire à la gestion de votre séjour, puis archivées
            conformément aux obligations légales en vigueur (durée de
            prescription applicable).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Vos droits
          </h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d&apos;opposition</li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, contactez-nous à{" "}
            <a
              href={`mailto:${settings.email}`}
              className="text-stone-800 underline hover:text-stone-600"
            >
              {settings.email}
            </a>
            . Vous pouvez également introduire une réclamation auprès de la
            CNIL (
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-800 underline hover:text-stone-600"
            >
              www.cnil.fr
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Cookies
          </h2>
          <p>
            Ce site utilise uniquement des cookies techniques nécessaires à son
            fonctionnement (session d&apos;authentification pour
            l&apos;administration). Aucun cookie publicitaire, analytique ou de
            traçage n&apos;est déposé.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            Hébergement
          </h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, États-Unis. La base de données est hébergée par
            Neon (Neon Inc.).
          </p>
        </section>

        <div className="border-t border-stone-200 pt-6 text-xs text-stone-400">
          <p>
            Dernière mise à jour de cette politique : avril 2026.
            <br />
            Voir aussi nos{" "}
            <Link
              href="/mentions-legales"
              className="underline hover:text-stone-600"
            >
              mentions légales
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
