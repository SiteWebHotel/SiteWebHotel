import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function addPhoto(formData: FormData) {
  "use server";
  const data = {
    url: formData.get("url") as string,
    alt: (formData.get("alt") as string) || undefined,
    roomTypeId: formData.get("roomTypeId") as string,
    displayOrder: Number(formData.get("displayOrder") || 0),
  };
  if (!data.url || !data.roomTypeId) throw new Error("Données manquantes");
  await prisma.roomPhoto.create({ data });
  redirect("/admin/photos");
}

async function deletePhoto(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.roomPhoto.delete({ where: { id } });
  redirect("/admin/photos");
}

export default async function PhotosPage() {
  const [photos, roomTypes] = await Promise.all([
    prisma.roomPhoto.findMany({
      include: { roomType: true },
      orderBy: [{ roomType: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Photos</h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-stone-800">Ajouter une photo</h2>
        </CardHeader>
        <CardContent>
          <form action={addPhoto} className="space-y-4">
            <Input
              id="url"
              name="url"
              label="URL de l'image"
              required
              placeholder="https://..."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input id="alt" name="alt" label="Texte alternatif" />
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
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
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
              <Input
                id="displayOrder"
                name="displayOrder"
                label="Ordre"
                type="number"
                defaultValue={0}
              />
            </div>
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-stone-200">
              <Image
                src={p.url}
                alt={p.alt || "Photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {p.roomType.name}
                </p>
                {p.alt && (
                  <p className="text-xs text-stone-500">{p.alt}</p>
                )}
              </div>
              <form action={deletePhoto}>
                <input type="hidden" name="id" value={p.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Supprimer
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {photos.length === 0 && (
          <p className="col-span-full py-8 text-center text-stone-400">
            Aucune photo
          </p>
        )}
      </div>
    </div>
  );
}
