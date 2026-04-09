import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { z } from "zod/v4";

interface Props {
  params: Promise<{ id: string }>;
}

const roomFormSchema = z.object({
  number: z.string().min(1, "Numéro requis"),
  floor: z.number().int().optional(),
  roomTypeId: z.string().min(1, "Type de chambre requis"),
  status: z.enum(["ACTIVE", "MAINTENANCE", "RETIRED"]),
  notes: z.string().optional(),
});

async function getRoom(id: string) {
  if (id === "new") return null;
  return prisma.room.findUnique({ where: { id } });
}

async function saveRoom(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const data = {
    number: formData.get("number") as string,
    floor: formData.get("floor") ? Number(formData.get("floor")) : undefined,
    roomTypeId: formData.get("roomTypeId") as string,
    status: (formData.get("status") as string) || "ACTIVE",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = roomFormSchema.safeParse(data);
  if (!parsed.success) throw new Error("Données invalides");

  if (id && id !== "new") {
    await prisma.room.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.room.create({ data: parsed.data });
  }

  redirect("/admin/rooms");
}

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "En maintenance" },
  { value: "RETIRED", label: "Retirée" },
];

export default async function RoomEditPage({ params }: Props) {
  const { id } = await params;
  const [room, roomTypes] = await Promise.all([
    getRoom(id),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (id !== "new" && !room) notFound();
  const isNew = id === "new";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/rooms"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Chambres
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-stone-800">
            {isNew ? "Nouvelle chambre" : `Modifier chambre ${room!.number}`}
          </h1>
        </CardHeader>
        <CardContent>
          <form action={saveRoom} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="number"
                name="number"
                label="Numéro de chambre"
                defaultValue={room?.number}
                required
              />
              <Input
                id="floor"
                name="floor"
                label="Étage"
                type="number"
                defaultValue={room?.floor ?? ""}
              />
              <div>
                <label
                  htmlFor="status"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                  defaultValue={room?.status ?? "ACTIVE"}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="roomTypeId"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Type de chambre
              </label>
              <select
                id="roomTypeId"
                name="roomTypeId"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                defaultValue={room?.roomTypeId}
                required
              >
                <option value="">Sélectionner...</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Notes internes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                defaultValue={room?.notes || ""}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">{isNew ? "Créer" : "Enregistrer"}</Button>
              <Link href="/admin/rooms">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
