import Stripe from "stripe";
import { PrismaClient } from "../../generated/prisma";
import { sendConfirmationEmail } from "./emailController";

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

  // Find booking and update status
  const booking = await prisma.booking.findFirst({
    where: { paymentIntentId: paymentIntent.id },
    include: {
      guest: true,
      package: true,
      participantGear: true,
    },
  });

  if (!booking) {
    console.warn(`No booking found for payment intent: ${paymentIntent.id}`);
    return;
  }

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

  // Send confirmation email
  try {
    console.log(`Sending confirmation email for booking ${booking.id} to ${booking.guest.email}`);
    
    // Extract date and time from notes or use booking created date
    const noteMatch = booking.notes?.match(/Date: (\d{4}-\d{2}-\d{2}), Time: (\d{2}:\d{2})/);
    const bookingDate = noteMatch?.[1] || new Date(booking.createdAt).toISOString().split('T')[0];
    const bookingTime = noteMatch?.[2] || "09:00";

    // Convert participant gear to the format expected by email
    const gearSizes: Record<string, any> = {};
    if (booking.participantGear && booking.participantGear.length > 0) {
      booking.participantGear.forEach((gear, index) => {
        gearSizes[String(index + 1)] = {
          name: gear.name,
          overalls: gear.overalls,
          boots: gear.boots,
          gloves: gear.gloves,
          helmet: gear.helmet,
        };
      });
    }

    const emailData = {
      email: booking.guest.email,
      name: booking.guest.name,
      tour: booking.package.name,
      date: bookingDate,
      time: bookingTime,
      participants: booking.participants,
      total: Number(booking.totalPrice),
      bookingId: `UK${booking.id}`,
      phone: booking.guest.phone || "",
      addons: booking.notes || "",
      gearSizes: Object.keys(gearSizes).length > 0 ? gearSizes : undefined,
    };

    await sendConfirmationEmail(emailData);
    console.log(`✅ Confirmation email sent for booking ${booking.id}`);
  } catch (error) {
    console.error(`❌ Failed to send confirmation email for booking ${booking.id}:`, error);
    // Don't throw - we still want the payment to be marked as succeeded
  }
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
