import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateFr } from "@/lib/utils";
import { updateBookingStatus } from "@/server/booking-service";
import { BookingStatus } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

async function changeStatus(formData: FormData) {
  "use server";
  const id = formData.get("bookingId") as string;
  const status = formData.get("status") as BookingStatus;
  await updateBookingStatus(id, status);
  redirect(`/admin/bookings/${id}`);
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { roomType: true, room: true, guest: true },
  });

  if (!booking) notFound();

  const statuses: BookingStatus[] = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "NO_SHOW",
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    CANCELLED: "Annulée",
    CHECKED_IN: "Arrivée",
    CHECKED_OUT: "Départ",
    NO_SHOW: "No-show",
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/bookings"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Réservations
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-stone-800">
                Réservation
              </h1>
              <StatusBadge status={booking.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Référence</span>
              <span className="font-mono text-xs">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Type de chambre</span>
              <span>{booking.roomType.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Chambre</span>
              <span>{booking.room?.number || "Non assignée"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Arrivée</span>
              <span>{formatDateFr(booking.arrivalDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Départ</span>
              <span>{formatDateFr(booking.departureDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Nuits</span>
              <span>{booking.nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Personnes</span>
              <span>{booking.guestCount}</span>
            </div>
            <hr className="border-stone-100" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
            {booking.notes && (
              <div className="mt-4 rounded bg-stone-50 p-3 text-stone-600">
                <p className="font-medium text-stone-700">Notes :</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {booking.guest && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-stone-800">Client</h2>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">
                  {booking.guest.firstName} {booking.guest.lastName}
                </p>
                <p className="text-stone-600">{booking.guest.email}</p>
                {booking.guest.phone && (
                  <p className="text-stone-600">{booking.guest.phone}</p>
                )}
                {booking.guest.message && (
                  <div className="mt-2 rounded bg-stone-50 p-3 text-stone-600">
                    {booking.guest.message}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-stone-800">Changer le statut</h2>
            </CardHeader>
            <CardContent>
              <form action={changeStatus} className="flex flex-wrap gap-2">
                <input type="hidden" name="bookingId" value={booking.id} />
                {statuses
                  .filter((s) => s !== booking.status)
                  .map((s) => (
                    <Button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      variant={s === "CANCELLED" ? "danger" : "outline"}
                      size="sm"
                    >
                      {statusLabels[s]}
                    </Button>
                  ))}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
