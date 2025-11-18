import Stripe from "stripe";
import { z } from "zod";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : undefined;

const createPaymentIntentSchema = z.object({
  amount: z.number().int().positive(), // cents
  currency: z.string().min(1),
  bookingId: z.number().int().positive().optional(), // Link to existing booking
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  booking: z.object({
    tour: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    participants: z.number().int().positive(),
  }),
});
export async function createPaymentIntent(body: unknown) {
  if (!stripe) {
    throw {
      status: 500,
      error: "StripeNotConfigured",
      message: "Missing STRIPE_SECRET_KEY in environment",
    };
  }

  const data = createPaymentIntentSchema.parse(body);

  const intent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency: data.currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      bookingId: data.bookingId ? String(data.bookingId) : "",
      tour: data.booking.tour,
      date: data.booking.date,
      time: data.booking.time,
      participants: String(data.booking.participants),
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone ?? "",
    },
    receipt_email: data.customer.email,
  });

  // If bookingId is provided, link the payment intent to the booking
  if (data.bookingId) {
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        paymentIntentId: intent.id,
        paymentStatus: "pending",
      },
    });
  }

  return { client_secret: intent.client_secret, payment_intent_id: intent.id };
}
