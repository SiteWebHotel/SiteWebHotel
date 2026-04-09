import { redirect } from "next/navigation";
import { hotelSettingsSchema } from "@/lib/validations/admin";
import { updateHotelSettings, getHotelSettings } from "@/server/hotel-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Textarea({
  id,
  name,
  label,
  rows = 3,
  defaultValue,
  required,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  rows?: number;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-stone-700"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
        defaultValue={defaultValue || ""}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

async function saveSettings(formData: FormData) {
  "use server";

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    postalCode: formData.get("postalCode") as string,
    country: formData.get("country") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    website: (formData.get("website") as string) || undefined,
    checkInTime: formData.get("checkInTime") as string,
    checkOutTime: formData.get("checkOutTime") as string,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : undefined,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : undefined,
    receptionHours: (formData.get("receptionHours") as string) || undefined,
    accessDescription:
      (formData.get("accessDescription") as string) || undefined,
    parkingInfo: (formData.get("parkingInfo") as string) || undefined,
    googleMapsUrl: (formData.get("googleMapsUrl") as string) || undefined,
  };

  const parsed = hotelSettingsSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Données invalides");

  await updateHotelSettings(parsed.data);
  redirect("/admin/settings");
}

export default async function SettingsPage() {
  const settings = await getHotelSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">
        Paramètres de l&apos;hôtel
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Ces informations sont utilisées sur le site public, la page contact et
        pour le SEO local.
      </p>

      <form action={saveSettings} className="mt-6 space-y-8">
        {/* Identité */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-800">Identité</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              name="name"
              label="Nom de l'hôtel"
              defaultValue={settings.name}
              required
            />
            <Textarea
              id="description"
              name="description"
              label="Description"
              defaultValue={settings.description}
              required
            />
            <Input
              id="website"
              name="website"
              label="Site web"
              defaultValue={settings.website || ""}
            />
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-800">Coordonnées</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="address"
                name="address"
                label="Adresse"
                defaultValue={settings.address}
                required
              />
              <Input
                id="city"
                name="city"
                label="Ville"
                defaultValue={settings.city}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="postalCode"
                name="postalCode"
                label="Code postal"
                defaultValue={settings.postalCode}
                required
              />
              <Input
                id="country"
                name="country"
                label="Pays"
                defaultValue={settings.country}
                required
              />
              <Input
                id="phone"
                name="phone"
                label="Téléphone"
                defaultValue={settings.phone}
                required
              />
            </div>
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              defaultValue={settings.email}
              required
            />
          </CardContent>
        </Card>

        {/* Horaires */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-800">Horaires</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="checkInTime"
                name="checkInTime"
                label="Heure d'arrivée"
                defaultValue={settings.checkInTime}
                required
                placeholder="15:00"
              />
              <Input
                id="checkOutTime"
                name="checkOutTime"
                label="Heure de départ"
                defaultValue={settings.checkOutTime}
                required
                placeholder="11:00"
              />
              <Input
                id="receptionHours"
                name="receptionHours"
                label="Horaires de réception"
                defaultValue={settings.receptionHours || ""}
                placeholder="8h – 21h"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accès et localisation */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-800">
              Accès et localisation
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="accessDescription"
              name="accessDescription"
              label="Description de l'accès"
              rows={4}
              defaultValue={settings.accessDescription}
              placeholder="Comment venir à l'hôtel (en voiture, en train, transports…)"
            />
            <Textarea
              id="parkingInfo"
              name="parkingInfo"
              label="Informations parking"
              rows={3}
              defaultValue={settings.parkingInfo}
              placeholder="Type de parking, capacité, tarifs, distance…"
            />
            <Input
              id="googleMapsUrl"
              name="googleMapsUrl"
              label="Lien Google Maps"
              defaultValue={settings.googleMapsUrl || ""}
              placeholder="https://maps.google.com/..."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="latitude"
                name="latitude"
                label="Latitude"
                type="number"
                step="any"
                defaultValue={settings.latitude ?? ""}
              />
              <Input
                id="longitude"
                name="longitude"
                label="Longitude"
                type="number"
                step="any"
                defaultValue={settings.longitude ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
