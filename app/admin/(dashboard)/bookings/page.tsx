import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateFr } from "@/lib/utils";

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { roomType: true, room: true, guest: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Réservations</h1>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Chambre</th>
                <th className="px-4 py-3 font-medium">Arrivée</th>
                <th className="px-4 py-3 font-medium">Départ</th>
                <th className="px-4 py-3 font-medium">Nuits</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-4 py-3">
                    {b.guest
                      ? `${b.guest.firstName} ${b.guest.lastName}`
                      : "–"}
                  </td>
                  <td className="px-4 py-3">{b.roomType.name}</td>
                  <td className="px-4 py-3">{b.room?.number || "–"}</td>
                  <td className="px-4 py-3">{formatDateFr(b.arrivalDate)}</td>
                  <td className="px-4 py-3">
                    {formatDateFr(b.departureDate)}
                  </td>
                  <td className="px-4 py-3">{b.nights}</td>
                  <td className="px-4 py-3">{formatPrice(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-stone-400"
                  >
                    Aucune réservation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
