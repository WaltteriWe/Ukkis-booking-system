"use client";

import { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js"; // vain tyyppi

// === Tyypit (sama muoto kuin sivullasi) ===
export type Addon = { id: string; title: string; price: number };
export type Tour  = { title: string; price: number };

type ConfirmPaymentProps = {
  // booking data
  selectedTour: Tour | null;
  date: string;
  time: string;
  participants: number;
  selectedAddons: Addon[];
  total: number;

  // flow
  showPayment: boolean;
  onBack: () => void;
  onProceedToPayment: () => void;
  onPaymentSuccess: () => void;

  // contact info
  customerInfo: { name: string; email: string; phone: string };
  onChangeCustomer: (patch: Partial<{ name: string; email: string; phone: string }>) => void;

  // stripe
  stripePromise: Promise<Stripe | null> | null;
};

export default function ConfirmPaymentSection({
  selectedTour, date, time, participants, selectedAddons, total,
  showPayment, onBack, onProceedToPayment, onPaymentSuccess,
  customerInfo, onChangeCustomer, stripePromise,
}: ConfirmPaymentProps) {
  return (
    <section className="max-w-4xl">
      <h2 className="text-3xl font-extrabold text-[#101651]">
        {!showPayment ? "Confirm Your Booking" : "Complete Payment"}
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: summary + contact */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-[#101651] mb-4">Booking Details</h3>
            <div className="space-y-3">
              <Row label="Tour" value={selectedTour?.title ?? "-"} />
              <Row label="Date" value={date || "-"} />
              <Row label="Start time" value={time} />
              <Row label="Participants" value={participants} />
              <Row
                label="Add-ons"
                value={selectedAddons.length ? selectedAddons.map((a) => a.title).join(", ") : "None"}
              />
              <div className="border-t pt-3">
                <Row label="Total Amount" value={`€${total}`} />
              </div>
            </div>
          </div>

          {!showPayment && (
            <div className="rounded-2xl bg-white p-6 shadow">
              <h3 className="text-lg font-bold text-[#101651] mb-4">Contact Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  value={customerInfo.name}
                  onChange={(e) => onChangeCustomer({ name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  value={customerInfo.email}
                  onChange={(e) => onChangeCustomer({ email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  value={customerInfo.phone}
                  onChange={(e) => onChangeCustomer({ phone: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: payment column */}
        <div>
          {showPayment ? (
            stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripeCheckout total={total} onSuccess={onPaymentSuccess} />
              </Elements>
            ) : (
              <DemoPayment total={total} onSuccess={onPaymentSuccess} />
            )
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow">
              <h3 className="text-lg font-bold text-[#101651] mb-4">Payment Summary</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#3b4463]">
                    Tour ({participants} person{participants > 1 ? "s" : ""})
                  </span>
                  <span>€{(selectedTour?.price ?? 0) * participants}</span>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-[#3b4463]">{addon.title}</span>
                    <span>€{addon.price}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span className="text-[#101651]">Total</span>
                  <span className="text-[#ff8c3a]">€{total}</span>
                </div>
              </div>

              <div className="text-sm text-[#3b4463] space-y-1">
                <p>✓ Secure demo payment system</p>
                <p>✓ Full refund if cancelled 24h before</p>
                <p>✓ Instant confirmation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-[#101651] hover:bg-gray-50"
        >
          Back
        </button>

        {!showPayment && (
          <button
            onClick={onProceedToPayment}
            className="rounded-full bg-gradient-to-r from-[#33c38b] to-[#0ea676] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
          >
            Proceed to Payment →
          </button>
        )}
      </div>
    </section>
  );
}

/* ====== apukomponentit ====== */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3 last:border-0">
      <span className="text-[#3b4463]">{label}</span>
      <span className="font-semibold text-[#101651]">{value}</span>
    </div>
  );
}

function DemoPayment({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [processing, setProcessing] = useState(false);

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#101651]">Demo Payment</h3>
      </div>

      <button
        disabled={processing}
        onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); onSuccess(); }, 2000); }}
        className={`w-full rounded-full px-6 py-4 text-white font-semibold text-lg shadow transition-all ${
          processing ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#33c38b] to-[#0ea676] hover:opacity-95"
        }`}
      >
        {processing ? "Processing Payment..." : `Pay €${total} Securely`}
      </button>

      <div className="mt-2 text-center text-sm text-gray-500">🔒 Demo mode - No real payment processed</div>
    </div>
  );
}

function StripeCheckout({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    // TODO: kytke oikeaan Stripe-maksuun (createPaymentIntent tms.)
    setTimeout(() => { setProcessing(false); onSuccess(); }, 2000);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#101651]">Secure Payment with Stripe</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#101651] mb-2">Card Details</label>
          <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#ffb64d]">
            <CardElement
              options={{
                style: { base: { fontSize: "16px", color: "#101651", "::placeholder": { color: "#9CA3AF" } } },
              }}
            />
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <span className="text-[#3b4463]">Total Amount</span>
            <span className="text-2xl font-bold text-[#101651]">€{total}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full rounded-full px-6 py-4 text-white font-semibold text-lg shadow transition-all ${
            !stripe || processing ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#33c38b] to-[#0ea676] hover:opacity-95"
          }`}
        >
          {processing ? "Processing Payment..." : `Pay €${total} with Stripe`}
        </button>
      </form>
    </div>
  );
}
