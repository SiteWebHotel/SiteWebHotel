import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function RoomTypesPage() {
  const roomTypes = await prisma.roomType.findMany({
    include: { _count: { select: { rooms: true } } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">
          Types de chambres
        </h1>
        <Link href="/admin/room-types/new">
          <Button>Ajouter</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {roomTypes.map((rt) => (
          <Card key={rt.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-800">{rt.name}</h3>
                <p className="mt-0.5 text-sm text-stone-500">
                  {rt.maxOccupancy} pers. max · {rt._count.rooms} chambre
                  {rt._count.rooms > 1 ? "s" : ""} ·{" "}
                  {formatPrice(rt.basePrice)}/nuit
                  {!rt.isActive && (
                    <span className="ml-2 text-red-500">Inactif</span>
                  )}
                </p>
              </div>
              <Link href={`/admin/room-types/${rt.id}`}>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </Link>
            </div>
          </Card>
        ))}
        {roomTypes.length === 0 && (
          <p className="py-8 text-center text-stone-400">
            Aucun type de chambre configuré
          </p>
        )}
      </div>
    </div>
  );
}
