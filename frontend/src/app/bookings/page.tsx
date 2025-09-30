"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Korjaa Stripe-alustus
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key'
);

// Jos haluat vain demon ilman Stripe-avainta:
// const stripePromise = null;

type Tour = {
  id: string;
  title: string;
  duration: string;
  capacity: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  price: number; // €/person
  image: string; // käytä public/ -polkuja esim. /images/tour-1.jpg
};

type Addon = { id: string; title: string; desc: string; price: number };

const TOURS: Tour[] = [
  {
    id: "wilderness",
    title: "Arctic Wilderness Safari",
    duration: "4 hours",
    capacity: "Max 8 people",
    difficulty: "Moderate",
    price: 120,
    image: "/images/atv.jpg", // ATV kuva ensimmäiseksi
  },
  {
    id: "family",
    title: "Family Adventure",
    duration: "2.5 hours",
    capacity: "Max 12 people",
    difficulty: "Easy",
    price: 85,
    image: "/images/enduro-bike.jpg", // Enduro bike kuva
  },
  {
    id: "extreme",
    title: "Extreme Arctic",
    duration: "6 hours",
    capacity: "Max 6 people",
    difficulty: "Advanced",
    price: 180,
    image: "/images/snowmobile.jpg", // Snowmobile kuva
  },
];

const ADDONS: Addon[] = [
  { id: "photo", title: "Professional Photography", desc: "High-quality photos of your adventure", price: 35 },
  { id: "meal", title: "Hot Meal & Drinks", desc: "Traditional Lapland lunch by campfire", price: 25 },
  { id: "pickup", title: "Hotel Pickup & Drop-off", desc: "Convenient transportation service", price: 15 },
];

export default function Bookings() {
  // stepper (1: select, 2: customize, 3: confirm)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(TOURS[0]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("10:00");
  const [participants, setParticipants] = useState<number>(2);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    holderName: "",
  });

  const toggleAddon = (id: string) => setAddons((a) => ({ ...a, [id]: !a[id] }));

  const selectedAddons = Object.entries(addons)
    .filter(([, v]) => v)
    .map(([k]) => ADDONS.find((x) => x.id === k)!)
    .filter(Boolean);

  const total =
    (selectedTour?.price ?? 0) * participants +
    selectedAddons.reduce((sum, a) => sum + a.price, 0);

  // Success screen
  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-[#f7fbf9] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="rounded-full w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#101651] mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-[#3b4463] mb-2">
            Thank you {customerInfo.name}! Your Arctic adventure is booked.
          </p>
          <p className="text-sm text-[#3b4463] mb-8">
            Booking reference: #UK{Date.now().toString().slice(-6)}
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-bold text-[#101651] mb-3">Your Booking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#3b4463]">Tour:</span>
                <span>{selectedTour?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3b4463]">Date:</span>
                <span>{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3b4463]">Time:</span>
                <span>{time}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-[#3b4463]">Total Paid:</span>
                <span className="font-bold text-[#ff8c3a]">€{total}</span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold mr-4"
          >
            Return Home
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-block rounded-full border border-[#ffb64d] text-[#ffb64d] px-6 py-3 font-semibold"
          >
            Print
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      {/* Header + Stepper */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-[#101651]">
            Ukkis <span className="text-[#101651]">Safaris</span>
          </div>

          <a
            href="/booking"
            className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-5 py-2 text-white font-semibold shadow"
          >
            Book Now
          </a>
        </div>

        {/* Stepper */}
        <div className="mx-auto max-w-6xl px-4 pb-6">
          <div className="grid grid-cols-3 gap-6">
            {[
              { n: 1, label: "Select Tour" },
              { n: 2, label: "Customize" },
              { n: 3, label: "Confirm" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <div
                  className={
                    "h-10 w-10 rounded-full grid place-items-center text-white font-bold " +
                    (step >= (s.n as 1 | 2 | 3) ? "bg-[#ffb64d]" : "bg-gray-300")
                  }
                >
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#101651]">
                    {s.label}
                  </div>
                  <div className="mt-1 h-1 w-full rounded bg-gray-200">
                    <div
                      className={
                        "h-1 rounded " +
                        (step > (s.n as 1 | 2 | 3)
                          ? "w-full bg-[#ffb64d]"
                          : step === s.n
                          ? "w-1/3 bg-[#ffb64d]"
                          : "w-0")
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        {/* STEP 1: SELECT TOUR */}
        {step === 1 && (
          <section>
            <h1 className="text-4xl font-extrabold text-[#101651]">
              Choose Your Arctic Adventure
            </h1>
            <p className="mt-2 text-lg text-[#3b4463]">
              Select from our premium collection of Lapland experiences
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TOURS.map((t) => {
                const active = selectedTour?.id === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTour(t)}
                    className={
                      "group relative text-left rounded-3xl border bg-white shadow-sm transition hover:shadow " +
                      (active
                        ? "border-[#ffb64d] ring-2 ring-[#ffb64d]/40"
                        : "border-gray-200")
                    }
                  >
                    <div className="overflow-hidden rounded-t-3xl flex justify-center items-center bg-gray-100">
                      <img
                        src={t.image}
                        alt={t.title}
                        className="h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#101651] hover:underline">
                        {t.title}
                      </h3>
                      <ul className="mt-3 space-y-1 text-[#3b4463]">
                        <li>🕒 {t.duration}</li>
                        <li>👥 {t.capacity}</li>
                        <li>⭐ Difficulty: {t.difficulty}</li>
                      </ul>
                      <div className="mt-4 text-2xl font-extrabold text-[#ff8c3a]">
                        €{t.price}
                        <span className="text-base font-semibold text-[#3b4463]">
                          /person
                        </span>
                      </div>
                    </div>
                    {active && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#ffb64d] px-3 py-1 text-sm font-semibold text-white shadow">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: CUSTOMIZE */}
        {step === 2 && (
          <section className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-[#101651]">
                Customize Your Experience
              </h2>
              <p className="mt-1 text-[#3b4463]">
                Personalize your Arctic adventure
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#101651]">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101651]">
                    Select Start Time
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  >
                    {["09:00", "10:00", "12:00", "14:00"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101651]">
                    Number of Participants
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                      className="h-10 w-10 rounded-xl border border-gray-300 bg-white text-xl"
                    >
                      –
                    </button>
                    <div className="w-10 text-center text-xl font-bold">
                      {participants}
                    </div>
                    <button
                      onClick={() => setParticipants((p) => p + 1)}
                      className="h-10 w-10 rounded-xl border border-gray-300 bg-white text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-[#101651]">
                Add-on Services
              </h3>
              <div className="mt-4 space-y-4">
                {ADDONS.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!addons[a.id]}
                        onChange={() => toggleAddon(a.id)}
                        className="mt-1 h-5 w-5 rounded border-gray-300"
                      />
                      <div>
                        <div className="font-semibold text-[#101651]">{a.title}</div>
                        <div className="text-sm text-[#3b4463]">{a.desc}</div>
                      </div>
                    </div>
                    <div className="shrink-0 font-semibold text-[#ff8c3a]">
                      +€{a.price}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#101651]">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-[#ff8c3a]">€{total}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(3)}
                  className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow"
                >
                  Continue to Booking →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: CONFIRM & PAYMENT */}
        {step === 3 && (
          <section className="max-w-4xl">
            <h2 className="text-3xl font-extrabold text-[#101651]">
              {!showPayment ? "Confirm Your Booking" : "Complete Payment"}
            </h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Left Column - Booking Summary */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow">
                  <h3 className="text-lg font-bold text-[#101651] mb-4">
                    Booking Details
                  </h3>
                  <div className="space-y-3">
                    <Row label="Tour" value={selectedTour?.title ?? "-"} />
                    <Row label="Date" value={date || "-"} />
                    <Row label="Start time" value={time} />
                    <Row label="Participants" value={participants} />
                    <Row
                      label="Add-ons"
                      value={
                        selectedAddons.length
                          ? selectedAddons.map((a) => a.title).join(", ")
                          : "None"
                      }
                    />
                    <div className="border-t pt-3">
                      <Row label="Total Amount" value={`€${total}`} />
                    </div>
                  </div>
                </div>

                {!showPayment && (
                  <div className="rounded-2xl bg-white p-6 shadow">
                    <h3 className="text-lg font-bold text-[#101651] mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, name: e.target.value })
                        }
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment */}
              <div>
                {showPayment ? (
                  // Tarkista onko Stripe käytössä
                  stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <StripeCheckout total={total} onSuccess={() => setBookingComplete(true)} />
                    </Elements>
                  ) : (
                    // Fallback demo-maksu ilman Stripe
                    <DemoPayment total={total} onSuccess={() => setBookingComplete(true)} />
                  )
                ) : (
                  <div className="rounded-2xl bg-white p-6 shadow">
                    <h3 className="text-lg font-bold text-[#101651] mb-4">
                      Payment Summary
                    </h3>
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
                onClick={() => (showPayment ? setShowPayment(false) : setStep(2))}
                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-[#101651] hover:bg-gray-50"
                disabled={processing}
              >
                Back
              </button>

              {!showPayment && (
                <button
                  onClick={() => {
                    if (!customerInfo.name || !customerInfo.email) {
                      alert("Please fill in your contact information");
                      return;
                    }
                    setShowPayment(true);
                  }}
                  className="rounded-full bg-gradient-to-r from-[#33c38b] to-[#0ea676] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
                >
                  Proceed to Payment →
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3 last:border-0">
      <span className="text-[#3b4463]">{label}</span>
      <span className="font-semibold text-[#101651]">{value}</span>
    </div>
  );
}

// Demo-maksu ilman Stripe
function DemoPayment({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simuloi maksu
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Cardholder Name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
        />
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="MM/YY"
            className="rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
          />
          <input
            type="text"
            placeholder="CVV"
            className="rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
          />
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <span className="text-[#3b4463]">Total Amount</span>
            <span className="text-2xl font-bold text-[#101651]">€{total}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className={`w-full rounded-full px-6 py-4 text-white font-semibold text-lg shadow transition-all ${
            processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#33c38b] to-[#0ea676] hover:opacity-95'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay €${total} Securely`
          )}
        </button>

        <div className="text-center text-sm text-gray-500">
          🔒 Demo mode - No real payment processed
        </div>
      </form>
    </div>
  );
}

// StripeCheckout component (vain jos Stripe-avain on asetettu)
function StripeCheckout({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Demo: simuloi onnistunut maksu
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

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
          <label className="block text-sm font-semibold text-[#101651] mb-2">
            Card Details
          </label>
          <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#ffb64d]">
            <CardElement 
              options={{ 
                style: { 
                  base: { 
                    fontSize: "16px",
                    color: '#101651',
                    '::placeholder': { color: '#9CA3AF' }
                  } 
                } 
              }} 
            />
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

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
            !stripe || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#33c38b] to-[#0ea676] hover:opacity-95'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay €${total} with Stripe`
          )}
        </button>
      </form>
    </div>
  );
}
