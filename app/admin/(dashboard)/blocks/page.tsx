import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { availabilityBlockSchema } from "@/lib/validations/admin";
import { createAvailabilityBlock } from "@/server/booking-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateFr } from "@/lib/utils";

async function addBlock(formData: FormData) {
  "use server";
  const data = {
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    reason: formData.get("reason") as string,
    notes: (formData.get("notes") as string) || undefined,
    roomId: formData.get("roomId") as string,
  };
  const parsed = availabilityBlockSchema.safeParse(data);
  if (!parsed.success) throw new Error("Données invalides");

  await createAvailabilityBlock({
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
    reason: parsed.data.reason,
    notes: parsed.data.notes,
    roomId: parsed.data.roomId,
  });
  redirect("/admin/blocks");
}

async function deleteBlock(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.availabilityBlock.delete({ where: { id } });
  redirect("/admin/blocks");
}

const reasonLabels: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  OWNER_USE: "Usage propriétaire",
  SEASONAL_CLOSURE: "Fermeture saisonnière",
  OTHER: "Autre",
};

export default async function BlocksPage() {
  const [blocks, rooms] = await Promise.all([
    prisma.availabilityBlock.findMany({
      include: { room: { include: { roomType: true } } },
      orderBy: { startDate: "desc" },
      take: 50,
    }),
    prisma.room.findMany({
      include: { roomType: true },
      where: { status: "ACTIVE" },
      orderBy: [{ roomType: { displayOrder: "asc" } }, { number: "asc" }],
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">
        Blocages de disponibilité
      </h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-stone-800">Créer un blocage</h2>
        </CardHeader>
        <CardContent>
          <form action={addBlock} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="startDate"
                name="startDate"
                label="Date début"
                type="date"
                required
              />
              <Input
                id="endDate"
                name="endDate"
                label="Date fin"
                type="date"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="roomId"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Chambre
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.number} – {r.roomType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="reason"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Raison
                </label>
                <select
                  id="reason"
                  name="reason"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  required
                >
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input id="notes" name="notes" label="Notes (optionnel)" />
            <Button type="submit">Créer le blocage</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
              <th className="px-4 py-3 font-medium">Chambre</th>
              <th className="px-4 py-3 font-medium">Début</th>
              <th className="px-4 py-3 font-medium">Fin</th>
              <th className="px-4 py-3 font-medium">Raison</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr
                key={b.id}
                className="border-b border-stone-50 hover:bg-stone-50"
              >
                <td className="px-4 py-3">
                  {b.room.number} – {b.room.roomType.name}
                </td>
                <td className="px-4 py-3">{formatDateFr(b.startDate)}</td>
                <td className="px-4 py-3">{formatDateFr(b.endDate)}</td>
                <td className="px-4 py-3">{reasonLabels[b.reason]}</td>
                <td className="px-4 py-3">
                  <form action={deleteBlock}>
                    <input type="hidden" name="id" value={b.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Supprimer
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {blocks.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-stone-400"
                >
                  Aucun blocage
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
