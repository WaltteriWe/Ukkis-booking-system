"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendConfirmationEmail } from "@/lib/api";

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [emailSent, setEmailSent] = useState(false);
  const paymentIntent = searchParams.get("payment_intent");
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  );

  useEffect(() => {
    const sendEmail = async () => {
      if (!paymentIntent || !paymentIntentClientSecret) {
        setStatus("error");
        return;
      }

      // Payment was successful
      setStatus("success");

      // Try to send confirmation email
      try {
        const bookingDetailsJson = sessionStorage.getItem("pendingBookingEmail");
        if (bookingDetailsJson) {
          const bookingDetails = JSON.parse(bookingDetailsJson);
          console.log("Sending confirmation email with details:", bookingDetails);
          
          await sendConfirmationEmail(bookingDetails);
          console.log("✅ Confirmation email sent");
          setEmailSent(true);
          
          // Clear the stored data
          sessionStorage.removeItem("pendingBookingEmail");
        } else {
          console.warn("No booking details found in sessionStorage");
        }
      } catch (error) {
        console.error("❌ Failed to send confirmation email:", error);
        // Don't change status - booking is still successful even if email fails
      }
    };

    sendEmail();
  }, [paymentIntent, paymentIntentClientSecret]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">
            There was an issue processing your payment. Please try again.
          </p>
          <Link
            href="/bookings"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Return to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 mb-2">
          Your payment was successful and your booking has been confirmed.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {emailSent 
            ? "A confirmation email has been sent to your email address with all the details."
            : "You will receive a confirmation email shortly with all the details."}
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Return to Home
          </Link>
          <Link
            href="/bookings"
            className="block w-full bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
