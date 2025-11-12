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
import { colors } from "@/lib/constants";

// Remove the old Navigation component and replace with TabNavigation
function TabNavigation({ activeTab, setActiveTab }: { activeTab: "safari" | "rental"; setActiveTab: (tab: "safari" | "rental") => void }) {
  return (
    <div className="flex gap-4 mb-8 border-b-2" style={{ borderColor: colors.teal }}>
      <button
        onClick={() => setActiveTab("safari")}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === "safari" ? "border-b-4" : "hover:opacity-80"
        }`}
        style={{
          color: activeTab === "safari" ? colors.navy : colors.darkGray,
          borderColor: activeTab === "safari" ? colors.teal : "transparent",
        }}
      >
        Safari Tours
      </button>
      <button
        onClick={() => setActiveTab("rental")}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === "rental" ? "border-b-4" : "hover:opacity-80"
        }`}
        style={{
          color: activeTab === "rental" ? colors.navy : colors.darkGray,
          borderColor: activeTab === "rental" ? colors.teal : "transparent",
        }}
      >
        Snowmobile Rental
      </button>
    </div>
  );
}

// YOUR EXACT ORIGINAL CODE BELOW
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
  isActive: boolean;
};

type Addon = { id: string; title: string; desc: string; price: number }

const GEAR_SIZES = {
  overalls: ["XS", "S", "M", "L", "XL", "XXL"],
  boots: [
    "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48",
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
    isActive: true,
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
    isActive: true,
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
    isActive: true,
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
  // Add activeTab state at the top
  const [activeTab, setActiveTab] = useState<"safari" | "rental">("safari");
  
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

  // Place this INSIDE the Bookings component, after validateGearSizes (around line 240):

  const handlePaymentSuccess = async () => {
    try {
      // Convert gear sizes to API format
      const gearSizesForApi: Record<string, any> = {};
      Object.entries(participantGearSizes).forEach(([key, value]) => {
        gearSizesForApi[key] = value;
      });

      console.log("Starting booking process...");
      console.log("Customer info:", customerInfo);
      console.log("Selected tour:", selectedTour);

      // Generate booking ID
      const bookingId = `UK${Date.now().toString().slice(-6)}`;

      // Create booking WITHOUT departureId (it's optional now)
      const bookingRequest = {
        packageId: selectedTour!.id,
        // No departureId - it's optional
        participants: participants,
        guestEmail: customerInfo.email,
        guestName: customerInfo.name,
        phone: customerInfo.phone,
        notes: `Date: ${date}, Time: ${time}. Booking ID: ${bookingId}. Add-ons: ${selectedAddons.map(a => a.title).join(', ')}`,
        participantGearSizes: gearSizesForApi,
      };

      console.log("Creating booking with data:", bookingRequest);
      const createdBooking = await createBooking(bookingRequest as CreateBookingRequest);
      console.log("✅ Booking created successfully:", createdBooking);

      // Send confirmation email
      await sendConfirmationEmail({
        email: customerInfo.email,
        name: customerInfo.name,
        tour: selectedTour!.name,
        date: date,
        time: time,
        participants: participants,
        total: total,
        bookingId: bookingId,
        phone: customerInfo.phone || '',
        addons: selectedAddons.map(a => a.title).join(', ') || 'None',
        gearSizes: gearSizesForApi,
      });
      console.log("✅ Confirmation email sent");

      setShowPayment(false);
      setBookingComplete(true);
    } catch (error) {
      console.error("❌ Booking process failed:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Booking failed: ${errorMsg}\n\nPlease check the console for details.`);
      setShowPayment(false);
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
        console.log("Package details:", packagesArray.map(p => ({ id: p.id, name: p.name, isActive: p.isActive })));
        
        // Filter for active packages
        const activeTours = packagesArray.filter((pkg: any) => pkg.isActive === true);
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
     

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Tab Navigation - NEW */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Safari Tours Tab */}
        {activeTab === "safari" && (
          <>
            {/* Stepper - only show for safari */}
            <div className="mb-10">
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
                              {/* Overall Size */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Overalls
                                </label>
                                <select
                                  value={participantGearSizes[i + 1]?.overalls || ""}
                                  onChange={(e) =>
                                    updateGearSize(i + 1, "overalls", e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <h2 className="text-3xl font-extrabold text-[#101651]">
                    Add-Ons and Summary
                  </h2>
                  <p className="mt-1 text-[#3b4463]">
                    Enhance your experience with our optional add-ons
                  </p>

                  {/* Add-ons Section */}
                  <div className="mt-6 space-y-4">
                    {ADDONS.map((addon) => (
                      <div
                        key={addon.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          addons[addon.id]
                            ? "bg-[#e6f7ff] border-[#0070f3]"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleAddon(addon.id)}
                      >
                        <h4 className="font-semibold">{addon.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{addon.desc}</p>
                        <div className="text-lg font-bold" style={{ color: "#0070f3" }}>
                          +€{addon.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Section */}
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span style={{ color: "#0070f3" }}>€{total}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-md border border-gray-300 font-semibold hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 rounded-md text-white font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#0070f3" }}
                    >
                      Confirm & Continue →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
              <section>
                <h2 className="text-3xl font-extrabold text-[#101651]">
                  Confirm Your Booking
                </h2>
                <p className="mt-1 text-[#3b4463]">
                  Please review your booking details and confirm
                </p>

                {/* Contact Information */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="border rounded-lg px-4 py-2"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="border rounded-lg px-4 py-2"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                {/* Participant Gear Sizes */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Participant Details</h3>
                  {Array.from({ length: participants }).map((_, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-3">Participant {index + 1}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <input
                          type="text"
                          placeholder="Name"
                          value={participantGearSizes[index + 1]?.name || ""}
                          onChange={(e) => updateParticipantName(index + 1, e.target.value)}
                          className="border rounded px-3 py-2"
                          required
                        />
                        <select
                          value={participantGearSizes[index + 1]?.overalls || ""}
                          onChange={(e) => updateGearSize(index + 1, "overalls", e.target.value)}
                          className="border rounded px-3 py-2"
                          required
                        >
                          <option value="">Overalls Size</option>
                          {GEAR_SIZES.overalls.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={participantGearSizes[index + 1]?.boots || ""}
                          onChange={(e) => updateGearSize(index + 1, "boots", e.target.value)}
                          className="border rounded px-3 py-2"
                          required
                        >
                          <option value="">Boot Size</option>
                          {GEAR_SIZES.boots.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={participantGearSizes[index + 1]?.gloves || ""}
                          onChange={(e) => updateGearSize(index + 1, "gloves", e.target.value)}
                          className="border rounded px-3 py-2"
                          required
                        >
                          <option value="">Glove Size</option>
                          {GEAR_SIZES.gloves.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={participantGearSizes[index + 1]?.helmet || ""}
                          onChange={(e) => updateGearSize(index + 1, "helmet", e.target.value)}
                          className="border rounded px-3 py-2"
                          required
                        >
                          <option value="">Helmet Size</option>
                          {GEAR_SIZES.helmet.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add-ons Summary */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Optional Add-ons</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ADDONS.map((addon) => (
                      <div
                        key={addon.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          addons[addon.id]
                            ? "bg-[#e6f7ff] border-[#0070f3]"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleAddon(addon.id)}
                      >
                        <h4 className="font-semibold">{addon.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{addon.desc}</p>
                        <div className="text-lg font-bold" style={{ color: "#0070f3" }}>
                          +€{addon.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary & Submit */}
                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span style={{ color: "#0070f3" }}>€{total}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-md border border-gray-300 font-semibold hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (!customerInfo.name || !customerInfo.email) {
                        alert("Please fill in your contact information");
                        return;
                      }
                      if (!validateGearSizes()) {
                        alert("Please complete all participant details and gear sizes");
                        return;
                      }

                      // Show payment modal
                      setShowPayment(true);
                    }}
                    className="flex-1 py-3 rounded-md text-white font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#0070f3" }}
                  >
                    Confirm Booking
                  </button>
                </div>

                {/* Payment Modal */}
                {showPayment && (
                  <DemoPayment 
                    total={total} 
                    onSuccess={handlePaymentSuccess}
                  />
                )}
              </section>
            )}
          </>
        )}

        {/* Snowmobile Rental Tab */}
        {activeTab === "rental" && (
          <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: colors.white }}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.navy }}>
                Rent a Snowmobile for Your Private Adventure
              </h2>
              <p className="mb-6" style={{ color: colors.darkGray }}>
                Explore the Arctic wilderness at your own pace. Our snowmobiles are perfect for
                experienced riders who want the freedom to create their own adventure.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Feature cards */}
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg className="w-6 h-6" style={{ color: colors.teal }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>Flexible Duration</h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>Rent by the hour - perfect for short trips or full-day adventures</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg className="w-6 h-6" style={{ color: colors.teal }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>Quality Equipment</h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>Well-maintained modern snowmobiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg className="w-6 h-6" style={{ color: colors.teal }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>From €50/hour</h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>Competitive pricing for premium snowmobiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg className="w-6 h-6" style={{ color: colors.teal }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>Safety First</h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>All necessary safety gear included</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 p-4 mb-8" style={{ backgroundColor: `${colors.pink}20`, borderColor: colors.pink }}>
                <p className="text-sm" style={{ color: colors.darkGray }}>
                  <strong>Note:</strong> Valid driver's license required. Experience with snowmobiles recommended.
                </p>
              </div>

              <Link
                href="/snowmobile-rental"
                className="inline-block px-8 py-3 rounded-md text-white transition-opacity hover:opacity-90 font-semibold text-lg"
                style={{ backgroundColor: colors.navy }}
              >
                Check Availability & Book
              </Link>
            </div>
          </div>
        )}
      </main>
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

function DemoPayment({ 
  total, 
  onSuccess 
}: { 
  total: number; 
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      alert("Please fill in all card details");
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-[#101651] mb-2">
          Payment Details
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Complete your booking securely
        </p>

        <div className="bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] rounded-xl p-6 mb-6 text-white">
          <div className="text-sm mb-1">Total Amount</div>
          <div className="text-4xl font-bold">€{total}</div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb64d] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb64d] focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb64d] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                maxLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb64d] focus:border-transparent"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 This is a demo payment. No real charges will be made.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50 transition"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay €${total}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
