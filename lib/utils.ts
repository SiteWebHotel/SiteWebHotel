import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";

export function calculateStayNights(arrival: Date, departure: Date): number {
  return differenceInCalendarDays(departure, arrival);
}

export function formatDateFr(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: fr });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
