"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  createBooking,
  sendConfirmationEmail,
  getPackages,
  getDepartures,
  createDeparture,
} from "@/lib/api";
import type { CreateBookingRequest } from "@/lib/api";

type Tour = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  capacity?: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  active: boolean;
};

type Addon = { id: string; title: string; desc: string; price: number }

// Gear size options
const GEAR_SIZES = {
  jacket: ["XS", "S", "M", "L", "XL", "XXL"],
  pants: ["XS", "S", "M", "L", "XL", "XXL"],
  boots: [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
  ],
  gloves: ["XS", "S", "M", "L", "XL"],
  helmet: ["XS", "S", "M", "L", "XL"],
};

const TOURS: Tour[] = [
  {
    id: 1,
    slug: "snowmobile",
    name: "snowmobile safari",
    description: "Explore the Arctic wilderness with our expert guides.",
    basePrice: 120,
    durationMin: 240, // 4 hours
    capacity: 8,
    difficulty: "Moderate",
    imageUrl: "/images/atv.jpg",
    active: true,
  },
  {
    id: 2,
    slug: "enduro",
    name: "Enduro bike tour",
    description:
      "Experience the thrill of off-road biking in the beautiful Finnish wilderness.",
    basePrice: 85,
    durationMin: 150, // 2.5 hours
    capacity: 12,
    difficulty: "Easy",
    imageUrl: "/images/enduro-bike.jpg",
    active: true,
  },
  {
    id: 3,
    slug: "extreme",
    name: "ATV Extreme safari",
    description: "For thrill-seekers looking for an advanced challenge.",
    basePrice: 180,
    durationMin: 360, // 6 hours
    capacity: 6,
    difficulty: "Advanced",
    imageUrl: "/images/snowmobile.jpg",
    active: true,
  },
];

const ADDONS: Addon[] = [
  {
    id: "photo",
    title: "Professional Photography",
    desc: "High-quality photos of your adventure",
    price: 35,
  },
  {
    id: "meal",
    title: "Hot Meal & Drinks",
    desc: "Traditional Lapland lunch by campfire",
    price: 25,
  },
  {
    id: "pickup",
    title: "Hotel Pickup & Drop-off",
    desc: "Convenient transportation service",
    price: 15,
  },
];

export default function Bookings() {
  // stepper (1: select, 2: customize, 3: confirm)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Tours from database
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("10:00");
  const [participants, setParticipants] = useState<number>(2);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [participantGearSizes, setParticipantGearSizes] = useState<
    Record<
      number,
      {
        name: string;
        jacket: string;
        pants: string;
        boots: string;
        gloves: string;
        helmet: string;
      }
    >
  >({});
  const [showPayment, setShowPayment] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const toggleAddon = (id: string) =>
    setAddons((a) => ({ ...a, [id]: !a[id] }));

  // Initialize gear sizes for new participants
  const initializeGearSizes = (numParticipants: number) => {
    setParticipantGearSizes((prevSizes) => {
      const newSizes = { ...prevSizes };
      for (let i = 1; i <= numParticipants; i++) {
        if (!newSizes[i]) {
          newSizes[i] = {
            name: "",
            jacket: "",
            pants: "",
            boots: "",
            gloves: "",
            helmet: "",
          };
        }
      }
      // Remove gear sizes for participants that no longer exist
      Object.keys(newSizes).forEach((key) => {
        const participantNum = parseInt(key);
        if (participantNum > numParticipants) {
          delete newSizes[participantNum];
        }
      });
      return newSizes;
    });
  };

  // Update gear size for a specific participant
  const updateGearSize = (
    participantIndex: number,
    gearType: string,
    size: string
  ) => {
    setParticipantGearSizes((prev) => ({
      ...prev,
      [participantIndex]: {
        ...prev[participantIndex],
        [gearType]: size,
      },
    }));
  };

  // Update participant name
  const updateParticipantName = (participantIndex: number, name: string) => {
    setParticipantGearSizes((prev) => ({
      ...prev,
      [participantIndex]: {
        ...prev[participantIndex],
        name: name,
      },
    }));
  };

  // Initialize gear sizes when participants change
  useEffect(() => {
    initializeGearSizes(participants);
  }, [participants]);

  // Validate that all participants have selected all gear sizes and entered names
  const validateGearSizes = () => {
    for (let i = 1; i <= participants; i++) {
      const gearSizes = participantGearSizes[i];
      if (
        !gearSizes ||
        !gearSizes.name ||
        !gearSizes.jacket ||
        !gearSizes.pants ||
        !gearSizes.boots ||
        !gearSizes.gloves ||
        !gearSizes.helmet
      ) {
        return false;
      }
    }
    return true;
  };

  // Load tours from database
  useEffect(() => {
    async function loadTours() {
      try {
        setLoading(true);
        const response = await getPackages(true); // Only active packages
        setTours(response.items);

        // Set first tour as default selected
        if (response.items.length > 0 && !selectedTour) {
          setSelectedTour(response.items[0]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to load tours:", err);
        setError("Failed to load tours. Using demo data.");
        // Fallback to demo data
        setTours(TOURS);
        setSelectedTour(TOURS[0]);
      } finally {
        setLoading(false);
      }
    }

    loadTours();
  }, []);

  const selectedAddons = Object.entries(addons)
    .filter(([, v]) => v)
    .map(([k]) => ADDONS.find((x) => x.id === k)!)
    .filter(Boolean);

  const total =
    (selectedTour?.basePrice ?? 0) * participants +
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
                <span>{selectedTour?.name}</span>
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
                    (step >= (s.n as 1 | 2 | 3)
                      ? "bg-[#ffb64d]"
                      : "bg-gray-300")
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
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-[#ffb64d] border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading tours...</p>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500 mb-2">⚠️ {error}</p>
                  <p className="text-gray-500">Showing demo tours instead</p>
                </div>
              ) : null}

              {tours.map((t) => {
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
                        src={t.imageUrl || "/images/atv.jpg"}
                        alt={t.name}
                        className="h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#101651] hover:underline">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {t.description}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1 text-[#3b4463]">
                        <li>
                          🕒 {Math.floor(t.durationMin / 60)}h{" "}
                          {t.durationMin % 60}min
                        </li>
                        <li>👥 Max {t.capacity || 8} people</li>
                        <li>⭐ Difficulty: {t.difficulty}</li>
                      </ul>
                      <div className="mt-4 text-2xl font-extrabold text-[#ff8c3a]">
                        €{t.basePrice}
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

                {/* Gear Size Selection for Each Participant */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#101651] mb-4">
                    Gear Sizes for Each Participant
                  </h4>
                  <div className="space-y-6">
                    {Array.from({ length: participants }, (_, i) => (
                      <div
                        key={i + 1}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        {/* Participant Name Input */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[#101651] mb-2">
                            Participant {i + 1} Name:
                          </label>
                          <input
                            type="text"
                            value={participantGearSizes[i + 1]?.name || ""}
                            onChange={(e) =>
                              updateParticipantName(i + 1, e.target.value)
                            }
                            placeholder={`Enter name for participant ${i + 1}`}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                            required
                          />
                        </div>

                        <h6 className="text-sm font-medium text-gray-600 mb-3">
                          Gear Sizes:
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* Jacket Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jacket
                            </label>
                            <select
                              value={participantGearSizes[i + 1]?.jacket || ""}
                              onChange={(e) =>
                                updateGearSize(i + 1, "jacket", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select size</option>
                              {GEAR_SIZES.jacket.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Pants Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pants
                            </label>
                            <select
                              value={participantGearSizes[i + 1]?.pants || ""}
                              onChange={(e) =>
                                updateGearSize(i + 1, "pants", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select size</option>
                              {GEAR_SIZES.pants.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Boots Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Boots
                            </label>
                            <select
                              value={participantGearSizes[i + 1]?.boots || ""}
                              onChange={(e) =>
                                updateGearSize(i + 1, "boots", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select size</option>
                              {GEAR_SIZES.boots.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Gloves Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gloves
                            </label>
                            <select
                              value={participantGearSizes[i + 1]?.gloves || ""}
                              onChange={(e) =>
                                updateGearSize(i + 1, "gloves", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select size</option>
                              {GEAR_SIZES.gloves.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Helmet Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Helmet
                            </label>
                            <select
                              value={participantGearSizes[i + 1]?.helmet || ""}
                              onChange={(e) =>
                                updateGearSize(i + 1, "helmet", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select size</option>
                              {GEAR_SIZES.helmet.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        <div className="font-semibold text-[#101651]">
                          {a.title}
                        </div>
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
                  <span className="font-semibold text-[#101651]">
                    Estimated Total
                  </span>
                  <span className="text-2xl font-extrabold text-[#ff8c3a]">
                    €{total}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    if (!validateGearSizes()) {
                      alert(
                        "Please enter names and select all gear sizes for all participants before continuing."
                      );
                      return;
                    }
                    setStep(3);
                  }}
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
                    <Row label="Tour" value={selectedTour?.name ?? "-"} />
                    <Row label="Date" value={date || "-"} />
                    <Row label="Start time" value={time} />
                    <Row label="Participants" value={participants} />

                    {/* Gear Sizes Summary */}
                    <div className="space-y-2">
                      <span className="text-[#3b4463] font-medium">
                        Gear Sizes:
                      </span>
                      {Object.entries(participantGearSizes).map(
                        ([participantNum, sizes]) => (
                          <div
                            key={participantNum}
                            className="text-sm text-[#3b4463] ml-4"
                          >
                            <strong>
                              {sizes.name || `Participant ${participantNum}`}:
                            </strong>
                            <div className="ml-2">
                              Jacket: {sizes.jacket || "Not selected"}, Pants:{" "}
                              {sizes.pants || "Not selected"}, Boots:{" "}
                              {sizes.boots || "Not selected"}, Gloves:{" "}
                              {sizes.gloves || "Not selected"}, Helmet:{" "}
                              {sizes.helmet || "Not selected"}
                            </div>
                          </div>
                        )
                      )}
                    </div>

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
                          setCustomerInfo({
                            ...customerInfo,
                            name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment */}
              <div>
                {showPayment ? (
                  // Demo payment (Stripe disabled)
                  <DemoPayment
                    total={total}
                    onSuccess={() => setBookingComplete(true)}
                    bookingData={{
                      selectedTour,
                      customerInfo,
                      date,
                      time,
                      participants,
                      gearSizes: participantGearSizes,
                    }}
                  />
                ) : (
                  <div className="rounded-2xl bg-white p-6 shadow">
                    <h3 className="text-lg font-bold text-[#101651] mb-4">
                      Payment Summary
                    </h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-[#3b4463]">
                          Tour ({participants} person
                          {participants > 1 ? "s" : ""})
                        </span>
                        <span>
                          €{(selectedTour?.basePrice ?? 0) * participants}
                        </span>
                      </div>
                      {selectedAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex justify-between text-sm"
                        >
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
                onClick={() =>
                  showPayment ? setShowPayment(false) : setStep(2)
                }
                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-[#101651] hover:bg-gray-50"
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
function DemoPayment({
  total,
  onSuccess,
  bookingData,
}: {
  total: number;
  onSuccess: () => void;
  bookingData: {
    selectedTour: Tour | null;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    date: string;
    time: string;
    participants: number;
    gearSizes: Record<
      number,
      {
        name: string;
        jacket: string;
        pants: string;
        boots: string;
        gloves: string;
        helmet: string;
      }
    >;
  };
}) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Format gear sizes for notes
      const gearSizesText = Object.entries(bookingData.gearSizes)
        .map(([participantNum, sizes]) => {
          const participantName =
            sizes.name || `Participant ${participantNum}`;
          return `${participantName}: Jacket ${sizes.jacket}, Pants ${sizes.pants}, Boots ${sizes.boots}, Gloves ${sizes.gloves}, Helmet ${sizes.helmet}`;
        })
        .join("; ");

      // Convert gear sizes for database (number keys to string keys)
      const gearSizesForDatabase: Record<string, {
        name: string;
        jacket: string;
        pants: string;
        boots: string;
        gloves: string;
        helmet: string;
      }> = {};

      Object.entries(bookingData.gearSizes).forEach(([key, value]) => {
        gearSizesForDatabase[key.toString()] = {
          name: value.name,
          jacket: value.jacket,
          pants: value.pants,
          boots: value.boots,
          gloves: value.gloves,
          helmet: value.helmet,
        };
      });

      // Use the actual selected tour ID or fallback to first available
      const packageId = bookingData.selectedTour?.id || 1;
      
      let departureId: number;
      
      try {
        // Try to find existing departure for this package with available capacity
        const existingDepartures = await getDepartures({
          packageId: packageId,
          onlyAvailable: true
        });
        
        if (existingDepartures.length > 0) {
          // Use first available departure for this package
          departureId = existingDepartures[0].id;
          console.log(`Using existing departure ${departureId} with ${existingDepartures[0].available} available spots`);
        } else {
          // Create new departure for the selected date/time
          const departureDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
          const newDeparture = await createDeparture({
            packageId: packageId,
            departureTime: departureDateTime.toISOString(),
            capacity: bookingData.selectedTour?.capacity || 8
          });
          departureId = newDeparture.id;
          console.log(`Created new departure ${departureId}`);
        }
      } catch (departureError) {
        console.error("Failed to create/find departure, using fallback:", departureError);
        // Use a known working departure as fallback
        departureId = packageId === 1 ? 1 : 3; // Use departure 1 for package 1, departure 3 for package 2
      }

      // Luo booking backendiin
      const bookingRequest: CreateBookingRequest = {
        packageId: packageId,
        departureId: departureId,
        participants: bookingData.participants,
        guestEmail: bookingData.customerInfo.email,
        guestName: bookingData.customerInfo.name,
        phone: bookingData.customerInfo.phone || undefined,
        notes: `Tour: ${bookingData.selectedTour?.name}, Date: ${bookingData.date}, Time: ${bookingData.time}. Gear Sizes: ${gearSizesText}`,
        participantGearSizes: gearSizesForDatabase,
      };

      const result = await createBooking(bookingRequest);
      console.log("✅ Booking created:", result);

      // Convert number keys to string keys and ensure all required fields are present
      const gearSizesForEmail: Record<string, {
        name: string;
        jacket: string;
        pants: string;
        boots: string;
        gloves: string;
        helmet: string;
      }> = {};

      Object.entries(bookingData.gearSizes).forEach(([key, value]) => {
        gearSizesForEmail[key.toString()] = {
          name: value.name,
          jacket: value.jacket,
          pants: value.pants,
          boots: value.boots,
          gloves: value.gloves,
          helmet: value.helmet,
        };
      });

      // Lähetä vahvistus email
      if (bookingData.customerInfo.email) {
        try {
          await sendConfirmationEmail({
            email: bookingData.customerInfo.email,
            name: bookingData.customerInfo.name,
            tour: bookingData.selectedTour?.name || "Arctic Adventure",
            date: bookingData.date,
            time: bookingData.time,
            total: total,
            bookingId: `UK${result.id || Date.now().toString().slice(-6)}`,
            participantGearSizes: gearSizesForEmail,
          });
          console.log("✅ Confirmation email sent");
        } catch (emailError) {
          console.error("❌ Email sending failed:", emailError);
          // Jatka vaikka email epäonnistuu
        }
      }

      // SMS functionality removed - only using email confirmations

      setProcessing(false);
      onSuccess();
    } catch (error) {
      console.error("❌ Booking failed:", error);
      setProcessing(false);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
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
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#33c38b] to-[#0ea676] hover:opacity-95"
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
