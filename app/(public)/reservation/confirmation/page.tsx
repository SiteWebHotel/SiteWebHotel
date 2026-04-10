import type { Metadata } from "next";
import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { getBookingBySessionId } from "@/server/payment-service";

export const metadata: Metadata = {
  title: "Confirmation de réservation",
  description: "Votre réservation a bien été confirmée.",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-stone-800">
          Lien invalide
        </h1>
        <p className="mt-2 text-stone-600">
          Ce lien de confirmation n&apos;est pas valide. Si vous avez effectué
          un paiement, vous recevrez un email de confirmation.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  const booking = await getBookingBySessionId(session_id);

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-stone-800">
          Réservation en cours de traitement
        </h1>
        <p className="mt-2 text-stone-600">
          Votre paiement est en cours de validation. Vous recevrez un email de
          confirmation sous quelques minutes.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  const arrivalStr = booking.arrivalDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const departureStr = booking.departureDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800">
          Réservation confirmée
        </h1>
        <p className="mt-2 text-stone-600">
          Merci{booking.guest ? ` ${booking.guest.firstName}` : ""} ! Votre
          réservation a bien été enregistrée et votre paiement accepté.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Référence</span>
            <span className="font-mono text-xs text-stone-700">
              {booking.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Chambre</span>
            <span className="font-medium text-stone-800">
              {booking.roomType.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Arrivée</span>
            <span className="text-stone-800">{arrivalStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Départ</span>
            <span className="text-stone-800">{departureStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Durée</span>
            <span className="text-stone-800">
              {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Personnes</span>
            <span className="text-stone-800">{booking.guestCount}</span>
          </div>
          <hr className="border-stone-200" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total payé</span>
            <span className="text-stone-800">
              {formatPrice(booking.totalPrice)}
            </span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-stone-500">
        Un email de confirmation a été envoyé
        {booking.guest?.email ? ` à ${booking.guest.email}` : ""}. Pour toute
        question, n&apos;hésitez pas à nous contacter.
      </p>

      <div className="mt-6 text-center">
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
