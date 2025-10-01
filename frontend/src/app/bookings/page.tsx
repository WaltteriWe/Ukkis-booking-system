"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import BookingSteps from "@/components/BookingSteps";
import TourSelection from "@/components/TourSelection";
import CustomizeSection from "@/components/CustomizeSection";
import ConfirmPaymentSection from "@/components/ConfirmPaymentSection";

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
      <BookingSteps step={step} />

     {/* CONTENT */}
<main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
  {/* STEP 1: SELECT TOUR */}
  {step === 1 && (
    <TourSelection
      tours={TOURS}
      selectedId={selectedTour?.id ?? null}
      onSelect={(id) => {
        const t = TOURS.find((x) => x.id === id);
        if (t) setSelectedTour(t);
      }}
      onContinue={() => setStep(2)}
    />
  )}

  {/* STEP 2: CUSTOMIZE */}
  {step === 2 && (
    <CustomizeSection
      date={date}
      time={time}
      participants={participants}
      total={total}
      addons={addons}
      addonList={ADDONS}
      onChangeDate={setDate}
      onChangeTime={setTime}
      onChangeParticipants={setParticipants}
      onToggleAddon={toggleAddon}
      onContinue={() => setStep(3)}
    />
  )}

  {/* STEP 3: CONFIRM & PAYMENT */}
  {step === 3 && (
    <ConfirmPaymentSection
      selectedTour={
        selectedTour ? { title: selectedTour.title, price: selectedTour.price } : null
      }
      date={date}
      time={time}
      participants={participants}
      selectedAddons={selectedAddons.map((a) => ({
        id: a.id,
        title: a.title,
        price: a.price,
      }))}
      total={total}
      showPayment={showPayment}
      onBack={() => (showPayment ? setShowPayment(false) : setStep(2))}
      onProceedToPayment={() => {
        if (!customerInfo.name || !customerInfo.email) {
          alert("Please fill in your contact information");
          return;
        }
        setShowPayment(true);
      }}
      onPaymentSuccess={() => setBookingComplete(true)}
      customerInfo={customerInfo}
      onChangeCustomer={(patch) =>
        setCustomerInfo((c) => ({ ...c, ...patch }))
      }
      stripePromise={stripePromise}
    />
  )}
</main>
</div> );
}
