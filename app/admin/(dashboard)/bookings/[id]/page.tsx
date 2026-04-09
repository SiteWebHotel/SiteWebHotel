import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatPrice, formatDateFr, cn } from "@/lib/utils";
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
  revalidatePath(`/admin/bookings/${id}`);
  redirect(`/admin/bookings/${id}`);
}

const allStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
];

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  CHECKED_IN: "Arrivée",
  CHECKED_OUT: "Départ",
  NO_SHOW: "Absent",
};

const statusActiveStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300 ring-1 ring-green-300",
  CHECKED_IN: "bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-300",
  CHECKED_OUT: "bg-stone-200 text-stone-800 border-stone-400 ring-1 ring-stone-400",
  CANCELLED: "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-300",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-300 ring-1 ring-orange-300",
};

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { roomType: true, room: true, guest: true },
  });

  if (!booking) notFound();

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
              <h2 className="font-semibold text-stone-800">Statut</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((s) => {
                  const isCurrent = s === booking.status;
                  return (
                    <form key={s} action={changeStatus}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="status" value={s} />
                      <button
                        type="submit"
                        disabled={isCurrent}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          isCurrent
                            ? statusActiveStyles[s]
                            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                        )}
                      >
                        {statusLabels[s]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
