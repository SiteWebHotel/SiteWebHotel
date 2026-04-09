import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice, formatDateFr } from "@/lib/utils";
import { z } from "zod/v4";

const pricingRuleSchema = z.object({
  name: z.string().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  pricePerNight: z.number().positive(),
  minNights: z.number().int().min(1).optional(),
  roomTypeId: z.string().min(1),
});

async function addPricingRule(formData: FormData) {
  "use server";
  const raw = {
    name: formData.get("name") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    pricePerNight: Number(formData.get("pricePerNight")),
    minNights: formData.get("minNights")
      ? Number(formData.get("minNights"))
      : undefined,
    roomTypeId: formData.get("roomTypeId") as string,
  };
  const parsed = pricingRuleSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Données invalides");

  await prisma.pricingRule.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });
  redirect("/admin/pricing");
}

async function deletePricingRule(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.pricingRule.delete({ where: { id } });
  redirect("/admin/pricing");
}

export default async function PricingPage() {
  const [rules, roomTypes] = await Promise.all([
    prisma.pricingRule.findMany({
      include: { roomType: true },
      orderBy: [{ startDate: "asc" }],
    }),
    prisma.roomType.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">
        Tarification saisonnière
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Définissez des prix par période qui prennent le pas sur le prix de base
        du type de chambre.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-stone-800">
            Ajouter une règle tarifaire
          </h2>
        </CardHeader>
        <CardContent>
          <form action={addPricingRule} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="name"
                name="name"
                label="Nom de la période"
                required
                placeholder="Haute saison été"
              />
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
                      {rt.name} ({formatPrice(rt.basePrice)}/nuit)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
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
              <Input
                id="pricePerNight"
                name="pricePerNight"
                label="Prix / nuit (€)"
                type="number"
                step="0.01"
                required
              />
              <Input
                id="minNights"
                name="minNights"
                label="Nuits min. (optionnel)"
                type="number"
                min={1}
              />
            </div>
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">Prix / nuit</th>
                <th className="px-4 py-3 font-medium">Nuits min.</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.roomType.name}</td>
                  <td className="px-4 py-3">
                    {formatDateFr(r.startDate)} → {formatDateFr(r.endDate)}
                  </td>
                  <td className="px-4 py-3">{formatPrice(r.pricePerNight)}</td>
                  <td className="px-4 py-3">{r.minNights ?? "–"}</td>
                  <td className="px-4 py-3">
                    <form action={deletePricingRule}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Supprimer
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-stone-400"
                  >
                    Aucune règle tarifaire. Le prix de base de chaque type
                    s&apos;applique.
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
