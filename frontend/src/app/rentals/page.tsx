"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import {
  getAvailableSnowmobiles,
  createSnowmobileRental,
  sendConfirmationEmail,
  getSnowmobiles,
} from "@/lib/api";
import { colors } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import StripeCheckout from "@/components/StripeCheckout";

export default function SnowmobileRentalPage() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [snowmobileModels, setSnowmobileModels] = useState<any[]>([]);
  const [availableSnowmobiles, setAvailableSnowmobiles] = useState<any[]>([]);
  const [selectedSnowmobile, setSelectedSnowmobile] = useState<number | null>(
    null
  );
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [rentalId, setRentalId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // ✅ Load snowmobile models on mount (only once)
  useEffect(() => {
    async function loadSnowmobiles() {
      try {
        const models = await getSnowmobiles();
        setSnowmobileModels(models);
      } catch (error) {
        console.error("Failed to load snowmobiles:", error);
      } finally {
        setPageLoading(false);
      }
    }

    loadSnowmobiles();
  }, []);

  // ✅ Check availability when snowmobile, date, or time changes
  useEffect(() => {
    async function checkSnowmobileAvailability() {
      if (!selectedSnowmobile || !selectedDate || !startTime || !endTime) {
        setAvailableSnowmobiles([]);
        return;
      }

      setCheckingAvailability(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const startDateTime = `${dateStr}T${startTime}:00`;
        const endDateTime = `${dateStr}T${endTime}:00`;

        const start = new Date(startDateTime);
        const end = new Date(endDateTime);

        if (end <= start) {
          setAvailableSnowmobiles([]);
          return;
        }

        // ✅ Check BOTH rental bookings AND admin assignments
        const [rentalBookings, adminAssignments] = await Promise.all([
          fetch(
            `/api/snowmobile-rentals?snowmobileId=${selectedSnowmobile}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`
          )
            .then((r) => r.json())
            .then((data) => data.rentals || [])
            .catch(() => []),
          fetch(
            `/api/departures?startTime=${dateStr}T${startTime}:00&endTime=${dateStr}T${endTime}:00`
          )
            .then((r) => r.json())
            .then(
              (data) =>
                data.departures?.flatMap(
                  (d: any) => d.assignedSnowmobiles || []
                ) || []
            )
            .catch(() => []),
        ]);

        // ✅ Available if no rental bookings AND not assigned to admin departure
        const isAvailable =
          rentalBookings.length === 0 &&
          !adminAssignments.includes(selectedSnowmobile);

        if (isAvailable) {
          setAvailableSnowmobiles([
            snowmobileModels.find((sm) => sm.id === selectedSnowmobile),
          ]);
        } else {
          setAvailableSnowmobiles([]);
        }
      } catch (error) {
        console.error(error);
        setAvailableSnowmobiles([]);
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkSnowmobileAvailability();
  }, [selectedSnowmobile, selectedDate, startTime, endTime, snowmobileModels]);

  // ✅ Memoize calculateTotal with hourly rate from admin panel
  const calculateTotal = useCallback(() => {
    if (!startTime || !endTime || !selectedSnowmobile) return 0;

    const selectedModel = snowmobileModels.find(
      (sm) => sm.id === selectedSnowmobile
    );
    if (!selectedModel) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const hours = endHour + endMin / 60 - (startHour + startMin / 60);

    // ✅ Use hourly rate from admin panel, or fallback to pricing tiers
    const hourlyRate = selectedModel.hourlyRate || 0;
    if (hourlyRate > 0) {
      return Math.ceil(hours) * hourlyRate;
    }

    // ✅ Fallback to tier-based pricing
    const durationKey =
      hours <= 2
        ? "2h"
        : hours <= 4
          ? "4h"
          : hours <= 6
            ? "6h"
            : hours <= 8
              ? "8h"
              : "vrk";

    const tierPrice = selectedModel.pricing?.[durationKey];
    if (tierPrice && tierPrice > 0) {
      return tierPrice;
    }

    // ✅ Final fallback: default hourly rate of €50/hour
    return Math.ceil(hours) * 50;
  }, [startTime, endTime, selectedSnowmobile, snowmobileModels]);

  // ✅ Memoize total so it doesn't recalculate unless dependencies change
  const total = useMemo(() => calculateTotal(), [calculateTotal]);

  // ✅ Memoize time hours calculation with null check
  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    return endHour + endMin / 60 - (startHour + startMin / 60);
  }, [startTime, endTime]);

  // ✅ Memoize handleBooking function
  const handleBooking = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedSnowmobile || !selectedDate) {
        alert("Please select a snowmobile and date");
        return;
      }

      if (total <= 0) {
        alert(
          "Invalid price. Please check the snowmobile pricing configuration."
        );
        return;
      }

      setLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const startDateTime = `${dateStr}T${startTime}:00`;
        const endDateTime = `${dateStr}T${endTime}:00`;

        const startTimeISO = new Date(startDateTime).toISOString();
        const endTimeISO = new Date(endDateTime).toISOString();

        // Create rental first
        const rental = await createSnowmobileRental({
          snowmobileId: selectedSnowmobile,
          guestEmail,
          guestName,
          phone,
          startTime: startTimeISO,
          endTime: endTimeISO,
          totalPrice: total,
          notes: `Private snowmobile rental`,
        });

        setRentalId(rental.id);

        // Create payment intent
        const selectedModel = snowmobileModels.find(
          (sm) => sm.id === selectedSnowmobile
        );

        const paymentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/create-payment-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: Math.round(total * 100), // Convert to cents
              currency: "eur",
              rentalId: rental.id,
              customer: {
                name: guestName,
                email: guestEmail,
                phone: phone,
              },
              booking: {
                tour: `${t("snowmobileRental")} - ${selectedModel?.name || "Snowmobile"}`,
                date: format(selectedDate, "MMMM d, yyyy"),
                time: `${startTime} - ${endTime}`,
                participants: 1,
              },
            }),
          }
        );

        if (!paymentResponse.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { client_secret } = await paymentResponse.json();
        setClientSecret(client_secret);
        setShowPayment(true);
      } catch (error) {
        console.error("❌ Payment setup failed:", error);
        alert("Payment setup failed. Please try again.");
        setLoading(false);
      }
    },
    [
      selectedSnowmobile,
      selectedDate,
      startTime,
      endTime,
      guestEmail,
      guestName,
      phone,
      total,
      snowmobileModels,
      t,
    ]
  );

  const handlePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      try {
        const selectedModel = snowmobileModels.find(
          (sm) => sm.id === selectedSnowmobile
        );

        // Send confirmation email
        await sendConfirmationEmail({
          email: guestEmail,
          name: guestName,
          tour: `${t("snowmobileRental")} - ${selectedModel?.name || "Snowmobile"}`,
          date: selectedDate ? format(selectedDate, "MMMM d, yyyy") : "",
          time: `${startTime} - ${endTime}`,
          participants: 1,
          total: total,
          bookingId: rentalId?.toString() || "",
        });

        alert("✅ Payment successful! Check your email for confirmation.");

        // Reset form
        setShowPayment(false);
        setStep(1);
        setSelectedDate(undefined);
        setStartTime("08:00");
        setEndTime("10:00");
        setSelectedSnowmobile(null);
        setGuestName("");
        setGuestEmail("");
        setPhone("");
        setClientSecret(null);
        setRentalId(null);
        setLoading(false);
      } catch (error) {
        console.error("Failed to send confirmation:", error);
        alert("Payment successful but failed to send confirmation email.");
        setLoading(false);
      }
    },
    [
      guestEmail,
      guestName,
      selectedDate,
      startTime,
      endTime,
      total,
      rentalId,
      snowmobileModels,
      selectedSnowmobile,
      t,
    ]
  );

  const handlePaymentError = useCallback((error: string) => {
    console.error("Payment error:", error);
    alert(`Payment failed: ${error}`);
    setLoading(false);
  }, []);

  const handlePaymentCancel = useCallback(() => {
    setShowPayment(false);
    setClientSecret(null);
    setLoading(false);
  }, []);

  if (pageLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
            : colors.beige,
        }}
      >
        <p style={{ color: darkMode ? "white" : colors.darkGray }}>
          {t("loading")}...
        </p>
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
      className="min-h-screen"
    >
      <header
        className={`text-white py-12 ${darkMode ? "shadow-lg" : ""}`}
        style={{
          backgroundColor: darkMode ? colors.navy : colors.navy,
          boxShadow: darkMode
            ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1)"
            : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            {t("snowmobileRentalPageTitle")}
          </h1>
          <p className="text-lg text-gray-300">
            {t("snowmobileRentalPageSubtitle")}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {step === 1 && (
          <div
            className="rounded-lg shadow-md p-8"
            style={{
              backgroundColor: darkMode ? "#1a1a2e" : colors.white,
              color: darkMode ? "white" : colors.darkGray,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              {t("selectASnowmobile")}
            </h2>

            {/* ✅ Snowmobile Selection with Availability Check */}
            <div className="mb-8">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {snowmobileModels.map((snowmobile) => (
                  <div
                    key={snowmobile.id}
                    onClick={() => setSelectedSnowmobile(snowmobile.id)}
                    className={`rounded-lg p-4 cursor-pointer transition border-2 ${
                      selectedSnowmobile === snowmobile.id
                        ? "ring-2"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: darkMode ? "#16243a" : colors.white,
                      borderColor:
                        selectedSnowmobile === snowmobile.id
                          ? colors.teal
                          : darkMode
                            ? "#2d1a3a"
                            : "#ddd",
                      ringColor:
                        selectedSnowmobile === snowmobile.id
                          ? `${colors.teal}40`
                          : "transparent",
                    }}
                  >
                    <h4
                      className="font-semibold"
                      style={{
                        color: darkMode ? "#10b981" : colors.navy,
                      }}
                    >
                      {snowmobile.name}
                    </h4>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: darkMode ? "#a0a0a0" : colors.darkGray,
                      }}
                    >
                      {snowmobile.model}
                    </p>
                    {snowmobile.featureKeys &&
                      snowmobile.featureKeys.length > 0 && (
                        <ul
                          className="text-xs mt-2 space-y-1"
                          style={{
                            color: darkMode ? "#cbd5e1" : colors.darkGray,
                          }}
                        >
                          {snowmobile.featureKeys
                            .slice(0, 2)
                            .map((key: string) => (
                              <li key={key}>• {t(key)}</li>
                            ))}
                        </ul>
                      )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("selectDateLabel")}
                </label>
                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                  }}
                >
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="mx-auto"
                  />
                </div>
                {selectedDate && (
                  <p
                    className="text-sm mt-2"
                    style={{ color: darkMode ? "#a0a0a0" : "#666" }}
                  >
                    {t("selectedDate")}: {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: darkMode ? "white" : colors.darkGray }}
                  >
                    {t("startTimeLabel")}
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#16243a" : "white",
                      color: darkMode ? "white" : colors.darkGray,
                      borderColor: darkMode ? "#2d1a3a" : "#ccc",
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <option
                        key={hour}
                        value={`${hour.toString().padStart(2, "0")}:00`}
                      >
                        {`${hour.toString().padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: darkMode ? "white" : colors.darkGray }}
                  >
                    {t("endTimeLabel")}
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#16243a" : "white",
                      color: darkMode ? "white" : colors.darkGray,
                      borderColor: darkMode ? "#2d1a3a" : "#ccc",
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <option
                        key={hour}
                        value={`${hour.toString().padStart(2, "0")}:00`}
                      >
                        {`${hour.toString().padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Availability Status */}
              {selectedSnowmobile && selectedDate && (
                <div
                  className="p-4 rounded-md"
                  style={{
                    backgroundColor:
                      availableSnowmobiles.length > 0
                        ? darkMode
                          ? "#2d1a3a"
                          : `${colors.teal}20`
                        : darkMode
                          ? "#3a2d2d"
                          : "#ff4d4d20",
                  }}
                >
                  {checkingAvailability ? (
                    <p
                      style={{
                        color: darkMode ? "#cbd5e1" : colors.darkGray,
                      }}
                    >
                      {t("checkingAvailability")}...
                    </p>
                  ) : availableSnowmobiles.length > 0 ? (
                    <>
                      <p
                        className="text-sm"
                        style={{ color: darkMode ? "white" : colors.darkGray }}
                      >
                        {t("durationLabel")}: {Math.ceil(hours)} {t("hours")}
                      </p>
                      <p
                        className="text-lg font-bold mt-2"
                        style={{
                          color: darkMode ? "#10b981" : colors.navy,
                        }}
                      >
                        {t("estimatedTotal")}: €{total}
                      </p>
                      <p
                        className="text-sm mt-2"
                        style={{
                          color: darkMode ? "#10b981" : colors.teal,
                          fontWeight: "600",
                        }}
                      >
                        ✓ {t("availableNow")}
                      </p>
                    </>
                  ) : (
                    <p
                      style={{
                        color: darkMode ? "#ff6b6b" : "#d32f2f",
                        fontWeight: "600",
                      }}
                    >
                      ✗ {t("notAvailable")}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={
                  loading ||
                  !selectedSnowmobile ||
                  !selectedDate ||
                  availableSnowmobiles.length === 0 ||
                  checkingAvailability
                }
                className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.navy }}
              >
                {loading
                  ? t("processing")
                  : availableSnowmobiles.length === 0 &&
                      selectedSnowmobile &&
                      selectedDate
                    ? t("notAvailable")
                    : t("continueToBooking")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 hover:underline"
              style={{ color: darkMode ? "#10b981" : colors.teal }}
            >
              ← {t("backToSelection")}
            </button>

            <form
              onSubmit={handleBooking}
              className="rounded-lg shadow-md p-8"
              style={{
                backgroundColor: darkMode ? "#1a1a2e" : colors.white,
              }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{
                  color: darkMode ? "#10b981" : colors.navy,
                }}
              >
                {t("yourDetails")}
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: darkMode ? "white" : colors.darkGray,
                    }}
                  >
                    {t("name")} {t("required")}
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#16243a" : "white",
                      color: darkMode ? "white" : colors.darkGray,
                      borderColor: darkMode ? "#2d1a3a" : "#ccc",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: darkMode ? "white" : colors.darkGray,
                    }}
                  >
                    {t("email")} {t("required")}
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#16243a" : "white",
                      color: darkMode ? "white" : colors.darkGray,
                      borderColor: darkMode ? "#2d1a3a" : "#ccc",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: darkMode ? "white" : colors.darkGray,
                    }}
                  >
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#16243a" : "white",
                      color: darkMode ? "white" : colors.darkGray,
                      borderColor: darkMode ? "#2d1a3a" : "#ccc",
                    }}
                  />
                </div>

                <div
                  className="p-4 rounded-md"
                  style={{
                    backgroundColor: darkMode ? "#2d1a3a" : `${colors.teal}20`,
                  }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{
                      color: darkMode ? "#10b981" : colors.navy,
                    }}
                  >
                    {t("total")}: €{total}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.navy }}
                >
                  {loading ? t("processing") : t("confirmBooking")}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Stripe Payment Modal */}
      {showPayment && clientSecret && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handlePaymentCancel}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{
              backgroundColor: darkMode ? "#16243a" : "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-bold"
                style={{ color: darkMode ? "white" : colors.navy }}
              >
                {t("payment")}
              </h2>
              <button
                onClick={handlePaymentCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
