import Stripe from "stripe";
import { PrismaClient } from "../../generated/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret) : undefined;
const prisma = new PrismaClient();

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  if (!stripe) {
    throw {
      status: 500,
      error: "StripeNotConfigured",
      message: "Missing STRIPE_SECRET_KEY",
    };
  }

  if (!webhookSecret) {
    throw {
      status: 500,
      error: "WebhookNotConfigured",
      message: "Missing STRIPE_WEBHOOK_SECRET",
    };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw {
      status: 400,
      error: "WebhookSignatureVerificationFailed",
      message: err.message,
    };
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "payment_intent.canceled":
      await handlePaymentIntentCanceled(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "payment_intent.processing":
      await handlePaymentIntentProcessing(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { received: true };
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // Fetch full payment intent with charges expanded
  const fullPaymentIntent = await stripe!.paymentIntents.retrieve(
    paymentIntent.id,
    {
      expand: ["charges.data.payment_method_details"],
    }
  );

  // Update booking status
  await prisma.booking.updateMany({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "succeeded",
      status: "confirmed",
      paymentMethod:
        (fullPaymentIntent as any).charges?.data[0]?.payment_method_details
          ?.type || null,
    },
  });

  // You can also send confirmation email here
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  await prisma.booking.updateMany({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "failed",
      status: "failed",
    },
  });
}

async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Payment canceled: ${paymentIntent.id}`);

  await prisma.booking.updateMany({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "canceled",
      status: "canceled",
    },
  });
}

async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Payment processing: ${paymentIntent.id}`);

  await prisma.booking.updateMany({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: "processing",
    },
  });
}
