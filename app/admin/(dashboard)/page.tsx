import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentBookings } from "@/server/admin-service";
import { formatPrice, formatDateFr } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, recentBookings] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(8),
  ]);

  const statCards = [
    { label: "Chambres actives", value: stats.totalRooms },
    { label: "Types de chambres", value: stats.totalRoomTypes },
    { label: "Réservations en attente", value: stats.pendingBookings },
    { label: "Réservations confirmées", value: stats.confirmedBookings },
    { label: "Arrivées aujourd'hui", value: stats.todayArrivals },
    { label: "Départs aujourd'hui", value: stats.todayDepartures },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <p className="text-sm text-stone-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">
                Dernières réservations
              </h2>
              <Link href="/admin/bookings">
                <Button variant="outline" size="sm">
                  Voir toutes les réservations
                </Button>
              </Link>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs text-stone-500">
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Chambre</th>
                  <th className="px-6 py-3 font-medium">Arrivée</th>
                  <th className="px-6 py-3 font-medium">Nuits</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stone-50 hover:bg-stone-50"
                  >
                    <td className="px-6 py-3">
                      {b.guest
                        ? `${b.guest.firstName} ${b.guest.lastName}`
                        : "–"}
                    </td>
                    <td className="px-6 py-3">{b.roomType.name}</td>
                    <td className="px-6 py-3">
                      {formatDateFr(b.arrivalDate)}
                    </td>
                    <td className="px-6 py-3">{b.nights}</td>
                    <td className="px-6 py-3">{formatPrice(b.totalPrice)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-stone-400"
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
    </div>
  );
}
