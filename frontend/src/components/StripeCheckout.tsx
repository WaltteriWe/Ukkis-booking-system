"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (!stripe || !elements) {
        setErrorMessage("Payment system not initialized");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred");
        onError?.(error.message || "An error occurred");
      } else if (paymentIntent?.status === "succeeded") {
        console.log("✅ Payment successful!");
        onSuccess?.(paymentIntent.id);
      } else {
        setErrorMessage("Payment processing. Please wait...");
      }
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || "An unexpected error occurred");
      onError?.(error.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export default function StripeCheckout({
  clientSecret,
  onSuccess,
  onError,
  onCancel,
}: StripeCheckoutProps) {
  const router = useRouter();

  if (!clientSecret) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded">
        Error: Payment session not initialized
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
      },
    },
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>

      <div className="flex gap-3">
        <button
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
          className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50 transition"
        >
          Back to Booking
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 px-6 py-3 rounded-lg border-2 border-orange-300 font-semibold hover:bg-orange-50 transition text-orange-600"
        >
          Home
        </button>
      </div>
    </div>
  );
}
