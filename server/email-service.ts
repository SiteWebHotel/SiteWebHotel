import { Resend } from "resend";
import type { Booking, BookingGuest, RoomType } from "@prisma/client";
import { getHotelSettings } from "@/server/hotel-service";
import { formatDateFr, formatPrice } from "@/lib/utils";

type BookingForEmail = Booking & {
  roomType: RoomType;
  guest: BookingGuest | null;
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends guest confirmation after successful Stripe payment (webhook).
 * Requires RESEND_API_KEY. Optional RESEND_FROM (e.g. "Hôtel <reservations@domaine.fr>").
 * Without verified domain, Resend allows onboarding@resend.dev for testing (limits apply).
 */
export async function sendBookingPaidConfirmationEmail(
  booking: BookingForEmail
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY missing — confirmation email not sent"
    );
    return;
  }

  const guestEmail = booking.guest?.email?.trim();
  if (!guestEmail) {
    console.warn("[email] No guest email on booking", booking.id);
    return;
  }

  const hotel = await getHotelSettings();
  const from =
    process.env.RESEND_FROM?.trim() ||
    `${hotel.name || "Réservation"} <onboarding@resend.dev>`;

  const guestFirst = booking.guest?.firstName ?? "";
  const arrival = formatDateFr(booking.arrivalDate);
  const departure = formatDateFr(booking.departureDate);
  const total = formatPrice(booking.totalPrice);

  const subject = `Confirmation de réservation — ${hotel.name}`;

  const textLines = [
    `Bonjour ${guestFirst},`,
    "",
    `Votre réservation à ${hotel.name} est confirmée et votre paiement a bien été enregistré.`,
    "",
    `Référence : ${booking.id}`,
    `Chambre : ${booking.roomType.name}`,
    `Arrivée : ${arrival}`,
    `Départ : ${departure}`,
    `Durée : ${booking.nights} nuit${booking.nights > 1 ? "s" : ""}`,
    `Personnes : ${booking.guestCount}`,
    `Total payé : ${total}`,
    "",
    hotel.phone ? `Téléphone : ${hotel.phone}` : "",
    hotel.email ? `Email : ${hotel.email}` : "",
    "",
    "Au plaisir de vous accueillir.",
    "",
    hotel.name,
  ].filter(Boolean);

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #292524;">
  <p>Bonjour ${escapeHtml(guestFirst)},</p>
  <p>Votre réservation à <strong>${escapeHtml(hotel.name)}</strong> est confirmée et votre paiement a bien été enregistré.</p>
  <table style="margin: 1.25rem 0; border-collapse: collapse;">
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Référence</td><td><code style="font-size: 0.85rem;">${escapeHtml(booking.id)}</code></td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Chambre</td><td>${escapeHtml(booking.roomType.name)}</td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Arrivée</td><td>${escapeHtml(arrival)}</td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Départ</td><td>${escapeHtml(departure)}</td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Durée</td><td>${booking.nights} nuit${booking.nights > 1 ? "s" : ""}</td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;">Personnes</td><td>${booking.guestCount}</td></tr>
    <tr><td style="padding: 0.25rem 1rem 0.25rem 0; color: #78716c;"><strong>Total payé</strong></td><td><strong>${escapeHtml(total)}</strong></td></tr>
  </table>
  ${hotel.phone ? `<p>Téléphone : ${escapeHtml(hotel.phone)}</p>` : ""}
  ${hotel.email ? `<p>Email : ${escapeHtml(hotel.email)}</p>` : ""}
  <p>Au plaisir de vous accueillir.</p>
  <p>— ${escapeHtml(hotel.name)}</p>
</body>
</html>`.trim();

  const replyTo = hotel.email?.trim() || undefined;
  const bccHotel = hotel.email?.trim() || undefined;

  const { error } = await resend.emails.send({
    from,
    to: guestEmail,
    replyTo: replyTo ? [replyTo] : undefined,
    bcc: bccHotel ? [bccHotel] : undefined,
    subject,
    text: textLines.join("\n"),
    html,
  });

  if (error) {
    console.error("[email] Resend error:", error);
  }
}
