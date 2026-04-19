"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/booking/date-range-picker";
import { Users, Check, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  searchAvailabilityAction,
  createBookingAction,
} from "@/app/actions/booking-actions";

type Step = "search" | "results" | "details" | "confirm" | "success";

interface RoomTypeResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  bedType: string | null;
  surfaceArea: number | null;
  basePrice: number;
  availableCount: number;
  photos: { url: string; alt: string | null }[];
  amenities: string[];
  pricing: { nights: number; pricePerNight: number; totalPrice: number };
}

interface BookingResult {
  id: string;
  checkoutUrl?: string;
  arrivalDate?: string;
  departureDate?: string;
  nights?: number;
  totalPrice?: number;
  roomTypeName?: string;
  roomNumber?: string;
  guestName?: string;
}

interface BookingFlowProps {
  initialRoomTypeSlug?: string | null;
}

export function BookingFlow({ initialRoomTypeSlug }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("search");
  const [preSelectedSlug] = useState(initialRoomTypeSlug ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [searchParams, setSearchParams] = useState({
    arrivalDate: "",
    departureDate: "",
    guestCount: 2,
  });
  const [results, setResults] = useState<RoomTypeResult[]>([]);
  const [selectedType, setSelectedType] = useState<RoomTypeResult | null>(null);
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const fd = new FormData();
    fd.set("arrivalDate", searchParams.arrivalDate);
    fd.set("departureDate", searchParams.departureDate);
    fd.set("guestCount", String(searchParams.guestCount));

    const res = await searchAvailabilityAction(fd);
    setLoading(false);

    if (!res.success) {
      setError(res.error);
      if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      return;
    }

    const available = res.data as RoomTypeResult[];
    setResults(available);

    if (preSelectedSlug) {
      const match = available.find((rt) => rt.slug === preSelectedSlug);
      if (match) {
        setSelectedType(match);
        setStep("details");
        return;
      }
    }

    setStep("results");
  }

  function handleSelectType(rt: RoomTypeResult) {
    setSelectedType(rt);
    setStep("details");
  }

  function handleGoToConfirm() {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      setError("Veuillez remplir les champs obligatoires");
      return;
    }
    setError(null);
    setStep("confirm");
  }

  async function handleConfirmBooking() {
    if (!selectedType) return;
    setLoading(true);
    setError(null);

    const res = await createBookingAction({
      arrivalDate: searchParams.arrivalDate,
      departureDate: searchParams.departureDate,
      guestCount: searchParams.guestCount,
      roomTypeId: selectedType.id,
      guest: guestInfo,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    const data = res.data as BookingResult;

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    setBookingResult(data);
    setStep("success");
  }

  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <div className="flex gap-1">
        {["Dates", "Chambres", "Coordonnées", "Confirmation"].map((label, i) => {
          const steps: Step[] = ["search", "results", "details", "confirm"];
          const isActive = steps.indexOf(step) >= i || step === "success";
          return (
            <div key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full ${isActive ? "bg-stone-700" : "bg-stone-200"}`}
              />
              <p
                className={`mt-1 hidden text-xs sm:block ${isActive ? "text-stone-700" : "text-stone-400"}`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Étape 1 : Recherche */}
      {step === "search" && (
        <Card>
          <CardContent className="space-y-5 pt-2">
            <DateRangePicker
              arrivalDate={searchParams.arrivalDate}
              departureDate={searchParams.departureDate}
              onArrivalChange={(d) =>
                setSearchParams((s) => ({ ...s, arrivalDate: d }))
              }
              onDepartureChange={(d) =>
                setSearchParams((s) => ({ ...s, departureDate: d }))
              }
              errorArrival={fieldErrors["arrivalDate"]?.[0]}
              errorDeparture={fieldErrors["departureDate"]?.[0]}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="w-full sm:w-40">
                <Input
                  id="guestCount"
                  label="Personnes"
                  type="number"
                  min={1}
                  max={10}
                  value={searchParams.guestCount}
                  onChange={(e) =>
                    setSearchParams((s) => ({
                      ...s,
                      guestCount: parseInt(e.target.value) || 1,
                    }))
                  }
                  error={fieldErrors["guestCount"]?.[0]}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchParams.arrivalDate || !searchParams.departureDate}
                className="w-full min-h-[44px] sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rechercher les disponibilités
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2 : Résultats */}
      {step === "results" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600">
              {results.length} type{results.length > 1 ? "s" : ""} de chambre
              disponible{results.length > 1 ? "s" : ""}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setStep("search")}>
              Modifier les dates
            </Button>
          </div>

          {results.length === 0 && (
            <Card>
              <CardContent>
                <p className="text-center text-stone-500 py-8">
                  Aucune chambre disponible pour ces dates et ce nombre de
                  personnes. Essayez d&apos;autres dates.
                </p>
              </CardContent>
            </Card>
          )}

          {results.map((rt) => (
            <Card key={rt.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">{rt.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {rt.maxOccupancy} pers.
                    </span>
                    {rt.bedType && <span>{rt.bedType}</span>}
                    {rt.surfaceArea && <span>{rt.surfaceArea} m²</span>}
                    <span>{rt.availableCount} disponible{rt.availableCount > 1 ? "s" : ""}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                    {rt.description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right sm:shrink-0">
                  <div>
                    <p className="text-lg font-semibold text-stone-800">
                      {formatPrice(rt.pricing.totalPrice)}
                    </p>
                    <p className="text-xs text-stone-500">
                      {rt.pricing.nights} nuit{rt.pricing.nights > 1 ? "s" : ""} ×{" "}
                      {formatPrice(rt.pricing.pricePerNight)}
                    </p>
                  </div>
                  <Button
                    className="mt-0 min-h-[44px] sm:mt-2"
                    onClick={() => handleSelectType(rt)}
                  >
                    Choisir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Étape 3 : Coordonnées */}
      {step === "details" && selectedType && (
        <Card>
          <CardContent className="space-y-4 pt-2">
            <div className="mb-4 rounded-md bg-stone-50 p-3 text-sm">
              <strong>{selectedType.name}</strong> –{" "}
              {selectedType.pricing.nights} nuit
              {selectedType.pricing.nights > 1 ? "s" : ""} –{" "}
              {formatPrice(selectedType.pricing.totalPrice)}
            </div>

            <h3 className="font-semibold text-stone-800">Vos coordonnées</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="firstName"
                label="Prénom *"
                value={guestInfo.firstName}
                onChange={(e) =>
                  setGuestInfo((g) => ({ ...g, firstName: e.target.value }))
                }
              />
              <Input
                id="lastName"
                label="Nom *"
                value={guestInfo.lastName}
                onChange={(e) =>
                  setGuestInfo((g) => ({ ...g, lastName: e.target.value }))
                }
              />
              <Input
                id="email"
                label="Email *"
                type="email"
                value={guestInfo.email}
                onChange={(e) =>
                  setGuestInfo((g) => ({ ...g, email: e.target.value }))
                }
              />
              <Input
                id="phone"
                label="Téléphone"
                type="tel"
                value={guestInfo.phone}
                onChange={(e) =>
                  setGuestInfo((g) => ({ ...g, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Message ou demande particulière
              </label>
              <textarea
                id="message"
                rows={3}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1"
                value={guestInfo.message}
                onChange={(e) =>
                  setGuestInfo((g) => ({ ...g, message: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setStep("results")} className="min-h-[44px]">
                Retour
              </Button>
              <Button onClick={handleGoToConfirm} className="min-h-[44px]">Continuer</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4 : Confirmation */}
      {step === "confirm" && selectedType && (
        <Card>
          <CardContent className="space-y-4 pt-2">
            <h3 className="font-semibold text-stone-800">
              Récapitulatif de votre réservation
            </h3>
            <div className="space-y-2 rounded-md bg-stone-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Chambre</span>
                <span className="font-medium">{selectedType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Arrivée</span>
                <span>{searchParams.arrivalDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Départ</span>
                <span>{searchParams.departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Durée</span>
                <span>
                  {selectedType.pricing.nights} nuit
                  {selectedType.pricing.nights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Personnes</span>
                <span>{searchParams.guestCount}</span>
              </div>
              <hr className="border-stone-200" />
              <div className="flex justify-between">
                <span className="text-stone-600">Prix par nuit</span>
                <span>{formatPrice(selectedType.pricing.pricePerNight)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(selectedType.pricing.totalPrice)}</span>
              </div>
            </div>
            <div className="rounded-md bg-stone-50 p-4 text-sm">
              <p>
                <strong>
                  {guestInfo.firstName} {guestInfo.lastName}
                </strong>
              </p>
              <p className="text-stone-600">{guestInfo.email}</p>
              {guestInfo.phone && (
                <p className="text-stone-600">{guestInfo.phone}</p>
              )}
            </div>
            <p className="text-xs text-stone-500">
              En confirmant, vous serez redirigé vers notre plateforme de
              paiement sécurisé.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setStep("details")} className="min-h-[44px]">
                Modifier
              </Button>
              <Button onClick={handleConfirmBooking} disabled={loading} className="min-h-[44px]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer et payer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 5 : Succès */}
      {step === "success" && bookingResult && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800">
              Réservation enregistrée
            </h3>
            <p className="mt-2 text-stone-600">
              Merci {bookingResult.guestName} ! Votre demande de réservation a
              bien été prise en compte.
            </p>
            <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-md bg-stone-50 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Référence</span>
                <span className="font-mono text-xs">{bookingResult.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Chambre</span>
                <span>{bookingResult.roomTypeName}</span>
              </div>
              {bookingResult.nights != null && (
                <div className="flex justify-between">
                  <span className="text-stone-600">Séjour</span>
                  <span>
                    {bookingResult.nights} nuit
                    {bookingResult.nights > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {bookingResult.totalPrice != null && (
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(bookingResult.totalPrice)}</span>
                </div>
              )}
            </div>
            <p className="mt-6 text-sm text-stone-500">
              Vous recevrez un email de confirmation. Pour toute question,
              n&apos;hésitez pas à nous contacter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
