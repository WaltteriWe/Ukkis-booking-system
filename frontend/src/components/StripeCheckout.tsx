"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isMock?: boolean;
}

function CheckoutForm({ onSuccess, onError, isMock }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Mock payment for development
      if (isMock) {
        console.log("🧪 Mock payment mode - simulating payment success");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing
        onSuccess?.();
        return;
      }

      if (!stripe || !elements) {
        setErrorMessage("Payment system not initialized");
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/confirmation`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred");
        onError?.(error.message || "An error occurred");
      } else {
        onSuccess?.();
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
      {isMock ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>🧪 Development Mode</strong>
          </p>
          <p className="text-sm text-yellow-700">
            Stripe is not configured. This is a mock payment for testing
            purposes. Click &quot;Complete Test Payment&quot; to simulate a
            successful payment.
          </p>
        </div>
      ) : (
        <PaymentElement />
      )}

      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={(!isMock && !stripe) || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {isProcessing
          ? "Processing..."
          : isMock
            ? "Complete Test Payment"
            : "Pay Now"}
      </button>
    </form>
  );
}

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCheckout({
  clientSecret,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  // Check if this is a mock payment (development mode)
  const isMock = clientSecret?.startsWith("pi_mock_");

  if (!clientSecret) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded">
        Error: Payment session not initialized
      </div>
    );
  }

  // For mock payments, don't use Stripe Elements
  if (isMock) {
    return (
      <div className="max-w-md mx-auto">
        <CheckoutForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
          isMock={true}
        />
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
    <div className="max-w-md mx-auto">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
          isMock={false}
        />
      </Elements>
    </div>
  );
}
