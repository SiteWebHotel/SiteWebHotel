import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Réserver",
  description:
    "Réservez votre chambre à l'Hôtel du Commerce à Bellegarde. Vérifiez les disponibilités et réservez en ligne.",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function ReservationPage({ searchParams }: Props) {
  const { type } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">
        Réserver votre séjour
      </h1>
      <p className="mt-3 text-stone-600">
        Sélectionnez vos dates et le nombre de personnes pour voir les chambres
        disponibles.
      </p>
      <div className="mt-8">
        <BookingFlow initialRoomTypeSlug={type ?? null} />
      </div>
    </div>
  );
}
