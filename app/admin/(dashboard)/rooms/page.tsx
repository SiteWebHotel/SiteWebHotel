import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    include: { roomType: true },
    orderBy: [{ roomType: { displayOrder: "asc" } }, { number: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">
          Chambres physiques
        </h1>
        <Link href="/admin/rooms/new">
          <Button>Ajouter</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Étage</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b border-stone-50 hover:bg-stone-50"
              >
                <td className="px-4 py-3 font-medium">{room.number}</td>
                <td className="px-4 py-3">{room.roomType.name}</td>
                <td className="px-4 py-3">{room.floor ?? "–"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={room.status} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/rooms/${room.id}`}>
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Aucune chambre configurée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
