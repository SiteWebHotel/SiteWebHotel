import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { roomTypeSchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

async function getRoomType(id: string) {
  if (id === "new") return null;
  return prisma.roomType.findUnique({
    where: { id },
    include: { amenities: { select: { amenityId: true } } },
  });
}

async function saveRoomType(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    shortDescription: (formData.get("shortDescription") as string) || undefined,
    basePrice: Number(formData.get("basePrice")),
    maxOccupancy: Number(formData.get("maxOccupancy")),
    bedType: (formData.get("bedType") as string) || undefined,
    surfaceArea: formData.get("surfaceArea")
      ? Number(formData.get("surfaceArea"))
      : undefined,
    displayOrder: Number(formData.get("displayOrder") || 0),
    isActive: formData.get("isActive") === "on",
  };

  const parsed = roomTypeSchema.safeParse(data);
  if (!parsed.success) throw new Error("Données invalides");

  const selectedAmenityIds = formData.getAll("amenities") as string[];

  if (id && id !== "new") {
    await prisma.$transaction([
      prisma.roomType.update({ where: { id }, data: parsed.data }),
      prisma.roomTypeAmenity.deleteMany({ where: { roomTypeId: id } }),
      ...(selectedAmenityIds.length > 0
        ? [
            prisma.roomTypeAmenity.createMany({
              data: selectedAmenityIds.map((amenityId) => ({
                roomTypeId: id,
                amenityId,
              })),
            }),
          ]
        : []),
    ]);
  } else {
    const created = await prisma.roomType.create({ data: parsed.data });
    if (selectedAmenityIds.length > 0) {
      await prisma.roomTypeAmenity.createMany({
        data: selectedAmenityIds.map((amenityId) => ({
          roomTypeId: created.id,
          amenityId,
        })),
      });
    }
  }

  redirect("/admin/room-types");
}

export default async function RoomTypeEditPage({ params }: Props) {
  const { id } = await params;
  const [rt, allAmenities] = await Promise.all([
    getRoomType(id),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (id !== "new" && !rt) notFound();

  const isNew = id === "new";
  const linkedAmenityIds = new Set(
    rt?.amenities?.map((a) => a.amenityId) ?? []
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/room-types"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Types de chambres
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-stone-800">
            {isNew ? "Nouveau type de chambre" : `Modifier : ${rt!.name}`}
          </h1>
        </CardHeader>
        <CardContent>
          <form action={saveRoomType} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="name"
                name="name"
                label="Nom"
                defaultValue={rt?.name}
                required
              />
              <Input
                id="slug"
                name="slug"
                label="Slug (URL)"
                defaultValue={rt?.slug}
                required
                placeholder="chambre-double"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Description complète
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                defaultValue={rt?.description}
                required
              />
            </div>
            <Input
              id="shortDescription"
              name="shortDescription"
              label="Description courte"
              defaultValue={rt?.shortDescription || ""}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="basePrice"
                name="basePrice"
                label="Prix de base (€/nuit)"
                type="number"
                step="0.01"
                defaultValue={rt?.basePrice}
                required
              />
              <Input
                id="maxOccupancy"
                name="maxOccupancy"
                label="Capacité max"
                type="number"
                min={1}
                defaultValue={rt?.maxOccupancy}
                required
              />
              <Input
                id="surfaceArea"
                name="surfaceArea"
                label="Surface (m²)"
                type="number"
                step="0.1"
                defaultValue={rt?.surfaceArea || ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="bedType"
                name="bedType"
                label="Type de lit"
                defaultValue={rt?.bedType || ""}
                placeholder="Lit double 160cm"
              />
              <Input
                id="displayOrder"
                name="displayOrder"
                label="Ordre d'affichage"
                type="number"
                defaultValue={rt?.displayOrder ?? 0}
              />
            </div>

            {/* Équipements */}
            {allAmenities.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-stone-700">
                  Équipements
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {allAmenities.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        name="amenities"
                        value={a.id}
                        defaultChecked={linkedAmenityIds.has(a.id)}
                        className="rounded border-stone-300"
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={rt?.isActive ?? true}
                className="rounded border-stone-300"
              />
              Actif (visible sur le site)
            </label>
            <div className="flex gap-3">
              <Button type="submit">{isNew ? "Créer" : "Enregistrer"}</Button>
              <Link href="/admin/room-types">
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
