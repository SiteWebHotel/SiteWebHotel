import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/hotel-config";

export async function createCheckoutSession(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { roomType: true, guest: true },
  });

  if (!booking) throw new Error("Réservation introuvable");
  if (booking.status !== "PENDING") {
    throw new Error("Cette réservation ne peut plus être payée");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: booking.id,
    customer_email: booking.guest?.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${booking.roomType.name} – ${booking.nights} nuit${booking.nights > 1 ? "s" : ""}`,
            description: `Du ${booking.arrivalDate.toISOString().slice(0, 10)} au ${booking.departureDate.toISOString().slice(0, 10)}`,
          },
          unit_amount: Math.round(booking.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/reservation/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/reservation?cancelled=true`,
    metadata: {
      bookingId: booking.id,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripeSessionId: session.id },
  });

  return session;
}

export async function handleCheckoutCompleted(
  session: import("stripe").Stripe.Checkout.Session
) {
  const bookingId =
    session.metadata?.bookingId ?? session.client_reference_id;
  if (!bookingId) {
    console.error("Webhook: no bookingId in session", session.id);
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    },
  });
}

export async function handlePaymentFailed(
  session: import("stripe").Stripe.Checkout.Session
) {
  const bookingId =
    session.metadata?.bookingId ?? session.client_reference_id;
  if (!bookingId) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

export async function getBookingBySessionId(sessionId: string) {
  return prisma.booking.findUnique({
    where: { stripeSessionId: sessionId },
    include: { roomType: true, guest: true, room: true },
  });
}
