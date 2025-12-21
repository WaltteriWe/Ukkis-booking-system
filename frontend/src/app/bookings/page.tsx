"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createBooking,
  sendConfirmationEmail,
  getPackages,
  getDepartures,
  createDeparture,
  confirmPayment,
} from "@/lib/api";
import "react-day-picker/dist/style.css";
import type { CreateBookingRequest } from "@/lib/api";
import { colors } from "@/lib/constants";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { DepartureSelector } from "@/components/DepartureSelector";
import StripeCheckout from "@/components/StripeCheckout";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useDepartures } from "@/hooks/useDepartures";
import Image from "next/image";

// Helper to get full image URL (backend serves images)
const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  // If already absolute URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // If relative URL starting with /uploads, prepend backend base URL
  if (url.startsWith("/uploads")) {
    // Backend runs on port 3001
    return `http://localhost:3001${url}`;
  }
  return url;
};

const darkModeStyles = {
  bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : colors.white),
  bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
  textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
  textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
  border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
  accent: (isDark: boolean) => (isDark ? "#10b981" : "#101651"),
  inputBg: (isDark: boolean) => (isDark ? "#1e293b" : "#ffffff"),
  inputBorder: (isDark: boolean) => (isDark ? "#475569" : "#d1d5db"),
};

// (TabNavigation UI removed - using top navigation links instead)

type Tour = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  isActive: boolean;
};

type Addon = { id: string; title: string; desc: string; price: number };

type Departure = {
  id: number;
  packageId: number;
  departureTime: string;
  reserved: number;
  capacity: number;
  isActive: boolean;
};

const GEAR_SIZES = {
  overalls: ["XS", "S", "M", "L", "XL", "XXL"],
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
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const {
    packageDepartures,
    selectedDeparture,
    loading: departuresLoading,
    error: departuresError,
    handlePackageSelect,
    setSelectedDeparture,
  } = useDepartures();

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
        overalls: string;
        boots: string;
        gloves: string;
        helmet: string;
      }
    >
  >({});
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedDepartureData, setSelectedDepartureData] = useState<any>(null);

  const handleSelectTour = (tour: Tour) => {
    setSelectedTour(tour);
    handlePackageSelect(tour.id);
    setSelectedPackage(tour.id);
  };

  const toggleAddon = (id: string) =>
    setAddons((a) => ({ ...a, [id]: !a[id] }));

  const handleDepartureSelect = useCallback((departure: any) => {
    if (departure) {
      setSelectedDeparture(departure.id);
      setSelectedDepartureData(departure);
      setTime(format(new Date(departure.departureTime), "HH:mm"));
    }
  }, []);

  // Initialize gear sizes for new participants
  const initializeGearSizes = (numParticipants: number) => {
    setParticipantGearSizes((prevSizes) => {
      const newSizes = { ...prevSizes };
      for (let i = 1; i <= numParticipants; i++) {
        if (!newSizes[i]) {
          newSizes[i] = {
            name: "",
            overalls: "",
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
        !gearSizes.overalls ||
        !gearSizes.boots ||
        !gearSizes.gloves ||
        !gearSizes.helmet
      ) {
        return false;
      }
    }
    return true;
  };

  // Create payment intent and show Stripe form
  const handleProceedToPayment = async () => {
    try {
      // First, create the booking
      const gearSizesForApi: Record<string, any> = {};
      Object.entries(participantGearSizes).forEach(([key, value]) => {
        gearSizesForApi[key] = value;
      });

      const bookingRequest = {
        packageId: selectedTour!.id,
        departureId: selectedDeparture || undefined,
        participants: participants,
        totalPrice: total,
        guestEmail: customerInfo.email,
        guestName: customerInfo.name,
        phone: customerInfo.phone,
        notes: `Date: ${date}, Time: ${time}. Add-ons: ${selectedAddons.map((a) => a.title).join(", ")}`,
        participantGearSizes: gearSizesForApi,
      };

      const createdBooking = await createBooking(
        bookingRequest as CreateBookingRequest
      );

      // Now create payment intent with the booking ID
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            currency: "eur",
            bookingId: createdBooking.id,
            customer: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
            booking: {
              tour: selectedTour!.name,
              date: date,
              time: time,
              participants: participants,
            },
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { client_secret } = await paymentResponse.json();
      setClientSecret(client_secret);
      setCurrentBookingId(createdBooking.id);
      setShowPayment(true);
    } catch (error) {
      console.error("❌ Payment setup failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Payment setup failed: ${errorMsg}`);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      console.log("✅ Payment successful! Payment Intent:", paymentIntentId);

      // Confirm the payment on the backend (fallback for when webhooks don't work locally)
      try {
        await confirmPayment(paymentIntentId);
        console.log("✅ Payment confirmed on backend");
      } catch (confirmError) {
        console.error("Failed to confirm payment:", confirmError);
        // Don't throw - payment still succeeded on Stripe
      }

      setShowPayment(false);
      setBookingComplete(true);
    } catch (error) {
      console.error("❌ Post-payment process failed:", error);
    }
  };

  // Load tours from database
  useEffect(() => {
    async function loadTours() {
      try {
        setLoading(true);
        const response = await getPackages();
        console.log("API Response:", response);

        let packagesArray = [];
        if (Array.isArray(response)) {
          packagesArray = response;
        } else if (response.items) {
          packagesArray = response.items;
        } else {
          packagesArray = [];
        }

        console.log("Packages array:", packagesArray);
        console.log(
          "Package details:",
          packagesArray.map((p) => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive,
          }))
        );

        // Filter for active packages
        const activeTours = packagesArray.filter(
          (pkg: any) => pkg.isActive === true
        );
        console.log("Active tours:", activeTours);

        // If no active packages, show all packages as fallback
        if (activeTours.length === 0 && packagesArray.length > 0) {
          console.log("No active packages found, showing all packages");
          setTours(packagesArray);
          setSelectedTour(packagesArray[0]);
        } else {
          setTours(activeTours);
          if (activeTours.length > 0 && !selectedTour) {
            setSelectedTour(activeTours[0]);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load tours:", err);
        setError("Failed to load tours. Using demo data.");
        // Use demo data as fallback
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

  // ✅ Calculate total with participant-scaled add-ons
  const addonsCost = selectedAddons.reduce(
    (sum, a) => sum + a.price * participants,
    0
  );
  const total = (selectedTour?.basePrice ?? 0) * participants + addonsCost;

  // ✅ Get max capacity from selected departure (departure capacity is the source of truth)
  const maxCapacity = selectedDepartureData
    ? selectedDepartureData.capacity - (selectedDepartureData.reserved || 0)
    : 1;

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
    <div
      style={{
        backgroundColor: darkMode ? "transparent" : colors.beige,
        background: darkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
          : colors.beige,
      }}
      className="min-h-screen rounded-lg"
    >
      <header
        className={`text-white py-12 ${darkMode ? "shadow-lg" : ""}`}
        style={{
          backgroundColor: "transparent",
          boxShadow: darkMode
            ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(0, 255, 200, 0.05)"
            : "none",
        }}
      >
        {/* Remove TabNavigation component */}

        {/* Keep only the Safari Tours section - remove the activeTab check */}
        <section className="max-w-6xl mx-auto px-4">
          {/* Stepper - only show for safari */}
          <div className="mb-10">
            <div className="grid grid-cols-3 gap-6">
              {[
                { n: 1, label: t("selectYourTour") },
                { n: 2, label: t("customize") },
                { n: 3, label: t("confirm") },
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
                    <div
                      className="text-sm font-semibold"
                      style={{
                        color: darkMode ? "#10b981" : "#101651",
                      }}
                    >
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

          {/* STEP 1: SELECT TOUR */}
          {step === 1 && (
            <section>
              <h1
                className="text-4xl font-extrabold"
                style={{ color: darkModeStyles.accent(darkMode) }}
              >
                {t("chooseYourAdventure")}
              </h1>
              <p
                className="mt-2 text-lg"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t("selectFromPremiumCollection")}
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-[#ffb64d] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p
                      style={{ color: darkModeStyles.textSecondary(darkMode) }}
                    >
                      {t("loadingTours")}
                    </p>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-red-500 mb-2">⚠️ {error}</p>
                    <p
                      style={{ color: darkModeStyles.textSecondary(darkMode) }}
                    >
                      {t("showingDemoTours")}
                    </p>
                  </div>
                ) : null}

                {tours.map((tour) => {
                  const active = selectedTour?.id === tour.id;
                  return (
                    <button
                      type="button"
                      key={tour.id}
                      onClick={() => handleSelectTour(tour)}
                      className={
                        "group relative text-left rounded-3xl border bg-white shadow-sm transition hover:shadow " +
                        (active
                          ? "border-[#ffb64d] ring-2 ring-[#ffb64d]/40"
                          : "border-gray-200")
                      }
                      style={{
                        backgroundColor: darkModeStyles.bgPrimary(darkMode),
                        borderColor: darkModeStyles.border(darkMode),
                      }}
                    >
                      <div className=" overflow-hidden rounded-t-3xl flex justify-center items-center bg-gray-100">
                        <Image
                          src={getImageUrl(tour.imageUrl) || "/images/placeholderTour.jpg"}
                          alt={tour.name}
                          width={400}
                          height={300}
                          className="h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h3
                          className="text-xl font-bold hover:underline"
                          style={{
                            color: darkModeStyles.textPrimary(darkMode),
                          }}
                        >
                          {t(`tour_${tour.slug}_name`) !==
                          `tour_${tour.slug}_name`
                            ? t(`tour_${tour.slug}_name`)
                            : tour.name}
                        </h3>
                        {tour.description && (
                          <p
                            className="mt-2 text-sm line-clamp-2"
                            style={{
                              color: darkModeStyles.textSecondary(darkMode),
                            }}
                          >
                            {t(`tour_${tour.slug}_desc`) !==
                            `tour_${tour.slug}_desc`
                              ? t(`tour_${tour.slug}_desc`)
                              : tour.description}
                          </p>
                        )}
                        <ul
                          className="mt-3 space-y-1"
                          style={{
                            color: darkModeStyles.textSecondary(darkMode),
                          }}
                        >
                          <li>
                            🕒 {Math.floor(tour.durationMin / 60)}h{" "}
                            {tour.durationMin % 60}min
                          </li>
                          <li>
                            ⭐ {t("difficulty")}: {tour.difficulty}
                          </li>
                        </ul>
                        <div className="mt-4 text-2xl font-extrabold text-[#ff8c3a]">
                          €{tour.basePrice}
                          <span
                            className="text-base font-semibold"
                            style={{
                              color: darkModeStyles.textSecondary(darkMode),
                            }}
                          >
                            /{t("person")}
                          </span>
                        </div>
                      </div>
                      {active && (
                        <span className="absolute left-4 top-4 rounded-full bg-[#ffb64d] px-3 py-1 text-sm font-semibold text-white shadow">
                          {t("selectedTour")}
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
                  {t("continue")}
                </button>
              </div>
            </section>
          )}

          {/* STEP 2: CUSTOMIZE */}
          {step === 2 && (
            <section className="grid gap-10 md:grid-cols-2 max-w-6xl mx-auto px-4 pb-10">
              <div
                className="rounded-lg p-8"
                style={{
                  backgroundColor: darkModeStyles.bgPrimary(darkMode),
                  color: darkModeStyles.textPrimary(darkMode),
                }}
              >
                <h2
                  className="text-3xl font-extrabold"
                  style={{ color: darkModeStyles.accent(darkMode) }}
                >
                  {t("customizeYourExperience")}
                </h2>
                <p
                  className="mt-1"
                  style={{ color: darkModeStyles.textSecondary(darkMode) }}
                >
                  {t("personalizeYourAdventure")}
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: darkModeStyles.textPrimary(darkMode) }}
                    >
                      {t("chooseDate")}
                    </label>
                    <AvailabilityCalendar
                      packageId={selectedTour!.id}
                      selectedDate={date ? new Date(date) : undefined}
                      onDateSelect={(newDate) => {
                        if (newDate) {
                          setDate(format(newDate, "yyyy-MM-dd"));
                        }
                      }}
                    />

                    {/* ✅ New: Show departures for selected date */}
                    {date && (
                      <div className="mt-6">
                        <DepartureSelector
                          packageId={selectedTour!.id}
                          selectedDate={date ? new Date(date) : undefined}
                          onSelectDeparture={handleDepartureSelect}
                          selectedDeparture={
                            selectedDeparture
                              ? packageDepartures.find(
                                  (d) => d.id === selectedDeparture
                                ) || null
                              : null
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold"
                      style={{ color: darkModeStyles.textPrimary(darkMode) }}
                    >
                      {t("numberOfParticipants")}
                    </label>

                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() =>
                          setParticipants((p) => Math.max(1, p - 1))
                        }
                        className="h-10 w-10 rounded-xl border"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                      >
                        –
                      </button>
                      <div
                        className="w-10 text-center text-xl font-bold"
                        style={{ color: darkModeStyles.textPrimary(darkMode) }}
                      >
                        {participants}
                      </div>
                      <button
                        onClick={() =>
                          setParticipants((p) => Math.min(maxCapacity, p + 1))
                        }
                        className="h-10 w-10 rounded-xl border disabled:opacity-50"
                        disabled={participants >= maxCapacity}
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                      >
                        +
                      </button>
                    </div>

                    {participants >= maxCapacity && (
                      <p className="mt-2 text-sm text-orange-600">
                        ⚠️ ({t("maxCapacityReached")} {t("participantsWarning")}{" "}
                        {maxCapacity})
                      </p>
                    )}
                  </div>

                  {/* Gear Size Selection */}
                  <div className="mt-6">
                    <h4
                      className="text-lg font-semibold mb-4"
                      style={{ color: darkModeStyles.textPrimary(darkMode) }}
                    >
                      {t("sizeDisclaimer")}
                    </h4>
                    <div className="space-y-6">
                      {Array.from({ length: participants }, (_, i) => (
                        <div
                          key={i + 1}
                          className="p-4 border rounded-lg"
                          style={{
                            backgroundColor:
                              darkModeStyles.bgSecondary(darkMode),
                            borderColor: darkModeStyles.border(darkMode),
                          }}
                        >
                          <div className="mb-4">
                            <label
                              className="block text-sm font-medium mb-2"
                              style={{
                                color: darkModeStyles.textPrimary(darkMode),
                              }}
                            >
                              {t("participant")} {i + 1} {t("name")}:
                            </label>
                            <input
                              type="text"
                              value={participantGearSizes[i + 1]?.name || ""}
                              onChange={(e) =>
                                updateParticipantName(i + 1, e.target.value)
                              }
                              placeholder={`${t("enterNameFor")} ${t("participant").toLowerCase()} ${i + 1}`}
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                              style={{
                                backgroundColor:
                                  darkModeStyles.inputBg(darkMode),
                                borderColor:
                                  darkModeStyles.inputBorder(darkMode),
                                color: darkModeStyles.textPrimary(darkMode),
                              }}
                              required
                            />
                          </div>

                          <h6
                            className="text-sm font-medium mb-3"
                            style={{
                              color: darkModeStyles.textSecondary(darkMode),
                            }}
                          >
                            {t("gearSizes")}:
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Overall Size */}
                            <div>
                              <label
                                className="block text-sm font-medium mb-1"
                                style={{
                                  color: darkModeStyles.textSecondary(darkMode),
                                }}
                              >
                                {t("overalls")}
                              </label>
                              <select
                                value={
                                  participantGearSizes[i + 1]?.overalls || ""
                                }
                                onChange={(e) =>
                                  updateGearSize(
                                    i + 1,
                                    "overalls",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{
                                  backgroundColor:
                                    darkModeStyles.inputBg(darkMode),
                                  borderColor:
                                    darkModeStyles.inputBorder(darkMode),
                                  color: darkModeStyles.textPrimary(darkMode),
                                }}
                                required
                              >
                                <option value="">Select size</option>
                                {GEAR_SIZES.overalls.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Boots Size */}
                            <div>
                              <label
                                className="block text-sm font-medium mb-1"
                                style={{
                                  color: darkModeStyles.textSecondary(darkMode),
                                }}
                              >
                                {t("boots")}
                              </label>
                              <select
                                value={participantGearSizes[i + 1]?.boots || ""}
                                onChange={(e) =>
                                  updateGearSize(i + 1, "boots", e.target.value)
                                }
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{
                                  backgroundColor:
                                    darkModeStyles.inputBg(darkMode),
                                  borderColor:
                                    darkModeStyles.inputBorder(darkMode),
                                  color: darkModeStyles.textPrimary(darkMode),
                                }}
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
                              <label
                                className="block text-sm font-medium mb-1"
                                style={{
                                  color: darkModeStyles.textSecondary(darkMode),
                                }}
                              >
                                {t("gloves")}
                              </label>
                              <select
                                value={
                                  participantGearSizes[i + 1]?.gloves || ""
                                }
                                onChange={(e) =>
                                  updateGearSize(
                                    i + 1,
                                    "gloves",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{
                                  backgroundColor:
                                    darkModeStyles.inputBg(darkMode),
                                  borderColor:
                                    darkModeStyles.inputBorder(darkMode),
                                  color: darkModeStyles.textPrimary(darkMode),
                                }}
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
                              <label
                                className="block text-sm font-medium mb-1"
                                style={{
                                  color: darkModeStyles.textSecondary(darkMode),
                                }}
                              >
                                {t("helmet")}
                              </label>
                              <select
                                value={
                                  participantGearSizes[i + 1]?.helmet || ""
                                }
                                onChange={(e) =>
                                  updateGearSize(
                                    i + 1,
                                    "helmet",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                style={{
                                  backgroundColor:
                                    darkModeStyles.inputBg(darkMode),
                                  borderColor:
                                    darkModeStyles.inputBorder(darkMode),
                                  color: darkModeStyles.textPrimary(darkMode),
                                }}
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

              {/* Right Column - Add-ons & Summary */}
              <div
                className="rounded-lg p-8"
                style={{
                  backgroundColor: darkModeStyles.bgPrimary(darkMode),
                  color: darkModeStyles.textPrimary(darkMode),
                }}
              >
                <h2
                  className="text-3xl font-extrabold"
                  style={{ color: darkModeStyles.accent(darkMode) }}
                >
                  {t("addonsAndSummary")}
                </h2>
                <p
                  className="mt-1"
                  style={{ color: darkModeStyles.textSecondary(darkMode) }}
                >
                  {t("enhanceYourExperience")}
                </p>

                {/* Add-ons Section */}
                <div className="mt-6 space-y-4">
                  {ADDONS.map((addon) => (
                    <div
                      key={addon.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all`}
                      style={{
                        backgroundColor: addons[addon.id]
                          ? darkMode
                            ? "#1e3a8a"
                            : "#e6f7ff"
                          : darkModeStyles.bgSecondary(darkMode),
                        borderColor: addons[addon.id]
                          ? "#0070f3"
                          : darkModeStyles.border(darkMode),
                      }}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <h4
                        className="font-semibold"
                        style={{ color: darkModeStyles.textPrimary(darkMode) }}
                      >
                        {t(`addon_${addon.id}_title`)}
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: darkModeStyles.textSecondary(darkMode),
                        }}
                      >
                        {t(`addon_${addon.id}_desc`)}
                      </p>
                      <div
                        className="text-lg font-bold"
                        style={{ color: "#0070f3" }}
                      >
                        €{addon.price}
                        {participants > 1 &&
                          ` × ${participants} = €${addon.price * participants}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div
                  className="rounded-lg p-6 mt-6"
                  style={{
                    backgroundColor: darkModeStyles.bgSecondary(darkMode),
                  }}
                >
                  <div className="space-y-2 text-sm mb-4">
                    <div
                      className="flex justify-between"
                      style={{ color: darkModeStyles.textSecondary(darkMode) }}
                    >
                      <span>Tour ({participants}×):</span>
                      <span>
                        €{(selectedTour?.basePrice ?? 0) * participants}
                      </span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div
                        className="flex justify-between"
                        style={{
                          color: darkModeStyles.textSecondary(darkMode),
                        }}
                      >
                        <span>Add-ons ({participants}×):</span>
                        <span>€{addonsCost}</span>
                      </div>
                    )}
                    <div
                      className="border-t pt-2 flex justify-between text-xl font-bold"
                      style={{
                        borderColor: darkModeStyles.border(darkMode),
                        color: darkModeStyles.textPrimary(darkMode),
                      }}
                    >
                      <span>{t("total")}:</span>
                      <span style={{ color: "#0070f3" }}>€{total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-md border font-semibold transition"
                    style={{
                      borderColor: darkModeStyles.border(darkMode),
                      backgroundColor: darkModeStyles.bgSecondary(darkMode),
                      color: darkModeStyles.textPrimary(darkMode),
                    }}
                  >
                    ← {t("back")}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-md text-white font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#0070f3" }}
                  >
                    {t("confirmAndContinue")} →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 3 && (
            <section
              className="max-w-4xl mx-auto px-4 pb-10"
              style={{ color: darkModeStyles.textPrimary(darkMode) }}
            >
              <h2
                className="text-3xl font-extrabold"
                style={{ color: darkModeStyles.accent(darkMode) }}
              >
                {t("confirmYourBooking")}
              </h2>
              <p
                className="mt-1"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t("reviewBookingDetails")}
              </p>

              {/* Contact Information */}
              <div className="mt-8">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkModeStyles.textPrimary(darkMode) }}
                >
                  {t("contactInformation")}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t("fullName")}
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="border rounded-lg px-4 py-2"
                    style={{
                      backgroundColor: darkModeStyles.inputBg(darkMode),
                      borderColor: darkModeStyles.inputBorder(darkMode),
                      color: darkModeStyles.textPrimary(darkMode),
                    }}
                    required
                  />
                  <input
                    type="email"
                    placeholder={t("emailAddress")}
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="border rounded-lg px-4 py-2"
                    style={{
                      backgroundColor: darkModeStyles.inputBg(darkMode),
                      borderColor: darkModeStyles.inputBorder(darkMode),
                      color: darkModeStyles.textPrimary(darkMode),
                    }}
                    required
                  />
                  <input
                    type="tel"
                    placeholder={t("phoneNumber")}
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="border rounded-lg px-4 py-2"
                    style={{
                      backgroundColor: darkModeStyles.inputBg(darkMode),
                      borderColor: darkModeStyles.inputBorder(darkMode),
                      color: darkModeStyles.textPrimary(darkMode),
                    }}
                  />
                </div>
              </div>

              {/* Participant Gear Sizes */}
              <div className="mt-8">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkModeStyles.textPrimary(darkMode) }}
                >
                  Participant Details
                </h3>
                {Array.from({ length: participants }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-4 mb-4 border"
                    style={{
                      backgroundColor: darkModeStyles.bgSecondary(darkMode),
                      borderColor: darkModeStyles.border(darkMode),
                    }}
                  >
                    <h4
                      className="font-medium mb-3"
                      style={{ color: darkModeStyles.textPrimary(darkMode) }}
                    >
                      Participant {index + 1}
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={participantGearSizes[index + 1]?.name || ""}
                        onChange={(e) =>
                          updateParticipantName(index + 1, e.target.value)
                        }
                        className="border rounded px-3 py-2"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                        required
                      />
                      <select
                        value={participantGearSizes[index + 1]?.overalls || ""}
                        onChange={(e) =>
                          updateGearSize(index + 1, "overalls", e.target.value)
                        }
                        className="border rounded px-3 py-2"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                        required
                      >
                        <option value="">Overalls Size</option>
                        {GEAR_SIZES.overalls.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <select
                        value={participantGearSizes[index + 1]?.boots || ""}
                        onChange={(e) =>
                          updateGearSize(index + 1, "boots", e.target.value)
                        }
                        className="border rounded px-3 py-2"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                        required
                      >
                        <option value="">Boot Size</option>
                        {GEAR_SIZES.boots.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <select
                        value={participantGearSizes[index + 1]?.gloves || ""}
                        onChange={(e) =>
                          updateGearSize(index + 1, "gloves", e.target.value)
                        }
                        className="border rounded px-3 py-2"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                        required
                      >
                        <option value="">Glove Size</option>
                        {GEAR_SIZES.gloves.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <select
                        value={participantGearSizes[index + 1]?.helmet || ""}
                        onChange={(e) =>
                          updateGearSize(index + 1, "helmet", e.target.value)
                        }
                        className="border rounded px-3 py-2"
                        style={{
                          backgroundColor: darkModeStyles.inputBg(darkMode),
                          borderColor: darkModeStyles.inputBorder(darkMode),
                          color: darkModeStyles.textPrimary(darkMode),
                        }}
                        required
                      >
                        <option value="">Helmet Size</option>
                        {GEAR_SIZES.helmet.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add-ons Summary */}
              <div className="mt-8">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkModeStyles.textPrimary(darkMode) }}
                >
                  {t("optionalAddons")}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ADDONS.map((addon) => (
                    <div
                      key={addon.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all`}
                      style={{
                        backgroundColor: addons[addon.id]
                          ? darkMode
                            ? "#1e3a8a"
                            : "#e6f7ff"
                          : darkModeStyles.bgSecondary(darkMode),
                        borderColor: addons[addon.id]
                          ? "#0070f3"
                          : darkModeStyles.border(darkMode),
                      }}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <h4
                        className="font-semibold"
                        style={{ color: darkModeStyles.textPrimary(darkMode) }}
                      >
                        {t(`addon_${addon.id}_title`)}
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: darkModeStyles.textSecondary(darkMode),
                        }}
                      >
                        {t(`addon_${addon.id}_desc`)}
                      </p>
                      <div
                        className="text-lg font-bold"
                        style={{ color: "#0070f3" }}
                      >
                        +€{addon.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Submit */}
              <div
                className="rounded-lg p-6 mt-6"
                style={{
                  backgroundColor: darkModeStyles.bgSecondary(darkMode),
                }}
              >
                <div
                  className="flex justify-between items-center text-xl font-bold"
                  style={{ color: darkModeStyles.textPrimary(darkMode) }}
                >
                  <span>{t("total")}:</span>
                  <span style={{ color: "#0070f3" }}>€{total}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-md border font-semibold transition"
                  style={{
                    borderColor: darkModeStyles.border(darkMode),
                    backgroundColor: darkModeStyles.bgSecondary(darkMode),
                    color: darkModeStyles.textPrimary(darkMode),
                  }}
                >
                  ← {t("back")}
                </button>
                <button
                  onClick={() => {
                    if (!customerInfo.name || !customerInfo.email) {
                      alert("Please fill in your contact information");
                      return;
                    }
                    if (!date || !time) {
                      alert("Please select a date and time from the calendar");
                      return;
                    }
                    if (!validateGearSizes()) {
                      alert(
                        "Please complete all participant details and gear sizes"
                      );
                      return;
                    }

                    console.log(
                      "Opening payment with date:",
                      date,
                      "time:",
                      time
                    );
                    handleProceedToPayment();
                  }}
                  className="w-full rounded-lg bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90"
                >
                  {t("confirmBooking")}
                </button>
              </div>

              {/* Payment Modal */}
              {showPayment && clientSecret && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div
                    className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
                    style={{
                      backgroundColor: darkModeStyles.bgPrimary(darkMode),
                    }}
                  >
                    <h3
                      className="text-2xl font-bold mb-6"
                      style={{ color: darkModeStyles.textPrimary(darkMode) }}
                    >
                      Complete Your Payment
                    </h3>
                    <StripeCheckout
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={(error) => {
                        console.error("Payment error:", error);
                        alert(`Payment failed: ${error}`);
                        setShowPayment(false);
                      }}
                      onCancel={() => setShowPayment(false)}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </section>
      </header>
    </div>
  );
}

// YOUR EXISTING HELPER COMPONENTS - UNCHANGED
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm text-[#3b4463]">
      <span>{label}</span>
      <span className="font-semibold text-[#101651]">{value}</span>
    </div>
  );
}
