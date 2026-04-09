import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { amenitySchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function addAmenity(formData: FormData) {
  "use server";
  const data = {
    name: formData.get("name") as string,
    icon: (formData.get("icon") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
  };
  const parsed = amenitySchema.safeParse(data);
  if (!parsed.success) throw new Error("Données invalides");
  await prisma.amenity.create({ data: parsed.data });
  redirect("/admin/amenities");
}

async function deleteAmenity(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.amenity.delete({ where: { id } });
  redirect("/admin/amenities");
}

export default async function AmenitiesPage() {
  const amenities = await prisma.amenity.findMany({
    include: { _count: { select: { roomTypes: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Équipements</h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-stone-800">
            Ajouter un équipement
          </h2>
        </CardHeader>
        <CardContent>
          <form action={addAmenity} className="flex flex-wrap items-end gap-3">
            <Input id="name" name="name" label="Nom" required />
            <Input id="icon" name="icon" label="Icône (optionnel)" />
            <Input
              id="category"
              name="category"
              label="Catégorie (optionnel)"
            />
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-2">
        {amenities.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-4 py-3"
          >
            <div>
              <span className="font-medium text-stone-800">{a.name}</span>
              {a.category && (
                <span className="ml-2 text-xs text-stone-400">
                  ({a.category})
                </span>
              )}
              <span className="ml-2 text-xs text-stone-400">
                · {a._count.roomTypes} type{a._count.roomTypes > 1 ? "s" : ""}
              </span>
            </div>
            <form action={deleteAmenity}>
              <input type="hidden" name="id" value={a.id} />
              <Button type="submit" variant="ghost" size="sm">
                Supprimer
              </Button>
            </form>
          </div>
        ))}
        {amenities.length === 0 && (
          <p className="py-8 text-center text-stone-400">
            Aucun équipement configuré
          </p>
        )}
      </div>
    </div>
  );
}
