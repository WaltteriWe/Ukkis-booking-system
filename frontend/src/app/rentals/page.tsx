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
import OnSitePaymentModal from "@/components/OnSitePaymentModal";
import SnowmobileModal from "@/components/SnowmobileModal";

interface SelectedSnowmobileItem {
  snowmobileId: number;
  quantity: number;
}

const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads")) {
    return `http://localhost:3001${url}`;
  }
  return url;
};

export default function SnowmobileRentalPage() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [snowmobileModels, setSnowmobileModels] = useState<any[]>([]);
  const [availableSnowmobiles, setAvailableSnowmobiles] = useState<any[]>([]);
  const [selectedSnowmobiles, setSelectedSnowmobiles] = useState<
    SelectedSnowmobileItem[]
  >([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [rentalId, setRentalId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedSnowmobileForModal, setSelectedSnowmobileForModal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Load snowmobile models on mount (only once)
  useEffect(() => {
    async function loadSnowmobiles() {
      try {
        const models = await getSnowmobiles();
        setSnowmobileModels(models);
        setAvailableSnowmobiles(models); // Initialize all as available
      } catch (error) {
        console.error("Failed to load snowmobiles:", error);
      } finally {
        setPageLoading(false);
      }
    }

    loadSnowmobiles();
  }, []);

  // ✅ Check availability when date or time changes
  useEffect(() => {
    async function checkSnowmobileAvailability() {
      if (!selectedDate || !startTime || !endTime) {
        setAvailableSnowmobiles(snowmobileModels);
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

        const available = await getAvailableSnowmobiles(
          start.toISOString(),
          end.toISOString()
        );

        setAvailableSnowmobiles(available);
      } catch (error) {
        console.error("Failed to check availability:", error);
        setAvailableSnowmobiles(snowmobileModels);
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkSnowmobileAvailability();
  }, [selectedDate, startTime, endTime, snowmobileModels]);

  // ✅ Toggle snowmobile selection
  const toggleSnowmobileSelection = (snowmobileId: number) => {
    setSelectedSnowmobiles((prev) => {
      const existing = prev.find((item) => item.snowmobileId === snowmobileId);
      if (existing) {
        return prev.filter((item) => item.snowmobileId !== snowmobileId);
      }
      return [...prev, { snowmobileId, quantity: 1 }];
    });
  };

  // ✅ Update quantity for selected snowmobile
  const updateSnowmobileQuantity = (snowmobileId: number, quantity: number) => {
    if (quantity <= 0) {
      toggleSnowmobileSelection(snowmobileId);
      return;
    }
    setSelectedSnowmobiles((prev) =>
      prev.map((item) =>
        item.snowmobileId === snowmobileId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // ✅ Check if all selected snowmobiles are available
  const allSelectedSnowmobilesAvailable = useMemo(() => {
    if (!selectedDate || !startTime || !endTime || selectedSnowmobiles.length === 0) {
      return true;
    }
    return selectedSnowmobiles.every((selected) =>
      availableSnowmobiles.some((available) => available.id === selected.snowmobileId)
    );
  }, [selectedSnowmobiles, availableSnowmobiles, selectedDate, startTime, endTime]);

  // ✅ Open modal for snowmobile details
  const openSnowmobileModal = (snowmobile: any) => {
    setSelectedSnowmobileForModal(snowmobile);
    setIsModalOpen(true);
  };

  // ✅ Memoize calculateTotal with hourly rate from admin panel
  const calculateTotal = useCallback(() => {
    if (!startTime || !endTime || selectedSnowmobiles.length === 0) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const hours = endHour + endMin / 60 - (startHour + startMin / 60);

    let total = 0;

    selectedSnowmobiles.forEach((item) => {
      const selectedModel = snowmobileModels.find(
        (sm) => sm.id === item.snowmobileId
      );
      if (!selectedModel) return;

      // ✅ Use hourly rate from admin panel, or fallback to pricing tiers
      const hourlyRate = selectedModel.hourlyRate || 0;
      let modelPrice = 0;

      if (hourlyRate > 0) {
        // ✅ Use exact hours for more accurate pricing (not ceiling)
        modelPrice = hours * hourlyRate;
      } else {
        // ✅ Fallback to tier-based pricing
        // Select tier based on which duration bracket the rental falls into
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
          modelPrice = tierPrice;
        } else {
          // ✅ Final fallback: default hourly rate of €50/hour with exact hours
          modelPrice = hours * 50;
        }
      }

      total += modelPrice * item.quantity;
    });

    return total;
  }, [startTime, endTime, selectedSnowmobiles, snowmobileModels]);

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

      if (selectedSnowmobiles.length === 0 || !selectedDate) {
        alert("Please select at least one snowmobile and date");
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

        // Create rental first with all selected snowmobiles
        const rental = await createSnowmobileRental({
          snowmobiles: selectedSnowmobiles,
          guestEmail,
          guestName,
          phone,
          startTime: startTimeISO,
          endTime: endTimeISO,
          totalPrice: total,
          notes: `Private snowmobile rental - ${selectedSnowmobiles.reduce((acc, item) => acc + item.quantity, 0)} units`,
        });

        setRentalId(rental.id);
        setShowPayment(true);
        setLoading(false);
      } catch (error) {
        console.error("❌ Rental creation failed:", error);
        alert("Rental creation failed. Please try again.");
        setLoading(false);
      }
    },
    [
      selectedSnowmobiles,
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
    async () => {
      try {
        const bookingDetails = selectedSnowmobiles
          .map((item) => {
            const model = snowmobileModels.find(
              (sm) => sm.id === item.snowmobileId
            );
            return `${model?.name || "Snowmobile"} x${item.quantity}`;
          })
          .join(", ");

        // Send confirmation email
        await sendConfirmationEmail({
          email: guestEmail,
          name: guestName,
          tour: `${t("snowmobileRental")} - ${bookingDetails}`,
          date: selectedDate ? format(selectedDate, "MMMM d, yyyy") : "",
          time: `${startTime} - ${endTime}`,
          participants: selectedSnowmobiles.reduce(
            (acc, item) => acc + item.quantity,
            0
          ),
          total: total,
          bookingId: rentalId?.toString() || "",
        });

        alert("✅ Booking confirmed! Check your email for confirmation.");

        // Reset form
        setShowPayment(false);
        setStep(1);
        setSelectedDate(undefined);
        setStartTime("08:00");
        setEndTime("10:00");
        setSelectedSnowmobiles([]);
        setGuestName("");
        setGuestEmail("");
        setPhone("");

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
      selectedSnowmobiles,
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
      className="min-h-screen rounded-lg"
    >
      <header
        className={`text-white py-12 rounded-lg ${darkMode ? "shadow-lg" : ""}`}
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

            {/* ✅ Multiple Snowmobile Selection with Availability Check */}
            <div className="mb-8">
              {checkingAvailability && (
                <p className="text-center mb-4" style={{ color: darkMode ? "#10b981" : colors.navy }}>
                  {t("checkingAvailability") || "Checking availability..."}
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {snowmobileModels.map((snowmobile) => {
                  const selectedItem = selectedSnowmobiles.find(
                    (item) => item.snowmobileId === snowmobile.id
                  );
                  const isSelected = !!selectedItem;
                  
                  const isAvailable = 
                    !selectedDate || 
                    !startTime || 
                    !endTime || 
                    checkingAvailability ||
                    availableSnowmobiles.some((available) => available.id === snowmobile.id);

                  return (
                    <div
                      key={snowmobile.id}
                      onClick={() => {
                        if (isAvailable) {
                          toggleSnowmobileSelection(snowmobile.id);
                        }
                      }}
                      className={`rounded-lg p-4 transition border-2 ${
                        isSelected ? "ring-2" : "hover:shadow-md"
                      } ${!isAvailable ? "opacity-50" : ""} ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                      style={{
                        backgroundColor: darkMode ? "#16243a" : colors.white,
                        borderColor:
                          isSelected
                            ? colors.teal
                            : darkMode
                              ? "#2d1a3a"
                              : "#ddd",
                        ringColor: isSelected ? `${colors.teal}40` : "transparent",
                      }}
                    >
                      {/* ✅ Image Thumbnail with Info Button */}
                      {snowmobile.imageUrl && (
                        <div className="relative mb-4 rounded-lg overflow-hidden h-40 bg-gray-200 group">
                          <img
                            src={getImageUrl(snowmobile.imageUrl)}
                            alt={snowmobile.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSnowmobileModal(snowmobile);
                            }}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                            }}
                            title={t("viewDetails")}
                          >
                            <span
                              className="text-white text-3xl"
                              style={{ color: colors.teal }}
                            >
                              ℹ️
                            </span>
                          </button>
                        </div>
                      )}

                      <div>
                        <h4
                          className="font-semibold"
                          style={{
                            color: darkMode ? "#10b981" : colors.navy,
                          }}
                        >
                          {snowmobile.name}
                          {!isAvailable && (
                            <span className="ml-2 text-xs text-red-500 font-normal">
                              ({t("unavailable") || "Unavailable"})
                            </span>
                          )}
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

                      {/* ✅ Quantity Selector for Selected Snowmobiles */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-gray-400" onClick={(e) => e.stopPropagation()}>
                          <label
                            className="text-xs font-medium block mb-2"
                            style={{
                              color: darkMode ? "white" : colors.darkGray,
                            }}
                          >
                            {t("quantity")} (Max: {snowmobile.quantity || 1})
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSnowmobileQuantity(
                                  snowmobile.id,
                                  Math.max(1, selectedItem.quantity - 1)
                                );
                              }}
                              disabled={selectedItem.quantity <= 1}
                              className="px-3 py-2 rounded disabled:opacity-50 font-bold text-lg"
                              style={{
                                backgroundColor: darkMode ? "#2d1a3a" : "#eee",
                                color: darkMode ? "white" : colors.darkGray,
                              }}
                            >
                              −
                            </button>
                            <input
                              type="text"
                              value={selectedItem.quantity}
                              readOnly
                              className="w-16 text-center border rounded"
                              style={{
                                backgroundColor: darkMode ? "#16243a" : "white",
                                color: darkMode ? "white" : colors.darkGray,
                                borderColor: darkMode ? "#2d1a3a" : "#ccc",
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSnowmobileQuantity(
                                  snowmobile.id,
                                  Math.min(
                                    selectedItem.quantity + 1,
                                    snowmobile.quantity || 1
                                  )
                                );
                              }}
                              disabled={
                                selectedItem.quantity >= (snowmobile.quantity || 1)
                              }
                              className="px-3 py-2 rounded disabled:opacity-50 font-bold text-lg"
                              style={{
                                backgroundColor: darkMode ? "#2d1a3a" : "#eee",
                                color: darkMode ? "white" : colors.darkGray,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

              {/* Pricing Tier Information */}
              {selectedSnowmobiles.length > 0 && (
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "#f9fafb",
                    borderColor: darkMode ? "#2d1a3a" : "#e5e7eb",
                  }}
                >
                  <h3
                    className="font-semibold mb-3 text-sm"
                    style={{ color: darkMode ? "white" : colors.darkGray }}
                  >
                    {t("pricingInformation") || "Pricing Information"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedSnowmobiles.map((item) => {
                      const model = snowmobileModels.find((sm) => sm.id === item.snowmobileId);
                      if (!model) return null;

                      if (model.hourlyRate && model.hourlyRate > 0) {
                        return (
                          <div
                            key={item.snowmobileId}
                            className="pb-2 border-b"
                            style={{
                              borderColor: darkMode ? "#2d1a3a" : "#e5e7eb",
                            }}
                          >
                            <p
                              className="font-medium"
                              style={{ color: darkMode ? "white" : colors.darkGray }}
                            >
                              {model.name}
                            </p>
                            <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                              Hourly rate: €{model.hourlyRate}/hour
                            </p>
                          </div>
                        );
                      }

                      if (model.pricing) {
                        return (
                          <div
                            key={item.snowmobileId}
                            className="pb-2 border-b"
                            style={{
                              borderColor: darkMode ? "#2d1a3a" : "#e5e7eb",
                            }}
                          >
                            <p
                              className="font-medium mb-2"
                              style={{ color: darkMode ? "white" : colors.darkGray }}
                            >
                              {model.name}
                            </p>
                            <div className="space-y-1 text-xs">
                              {model.pricing["2h"] > 0 && (
                                <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                                  2h: €{model.pricing["2h"]} (Start: 09:00-18:00)
                                </p>
                              )}
                              {model.pricing["4h"] > 0 && (
                                <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                                  4h: €{model.pricing["4h"]} (Start: 09:00-16:00)
                                </p>
                              )}
                              {model.pricing["6h"] > 0 && (
                                <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                                  6h: €{model.pricing["6h"]} (Start: 09:00-14:00)
                                </p>
                              )}
                              {model.pricing["8h"] > 0 && (
                                <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                                  8h: €{model.pricing["8h"]} (Start: 09:00-12:00)
                                </p>
                              )}
                              {model.pricing["vrk"] > 0 && (
                                <p style={{ color: darkMode ? "#a0a0a0" : "#666" }}>
                                  Full day: €{model.pricing["vrk"]} (Start: 09:00-10:00)
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* ✅ Availability Status */}
              {selectedSnowmobiles.length > 0 && selectedDate && (
                <div
                  className="p-4 rounded-md"
                  style={{
                    backgroundColor:
                      allSelectedSnowmobilesAvailable
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
                  ) : allSelectedSnowmobilesAvailable ? (
                    <>
                      <p
                        className="text-sm"
                        style={{ color: darkMode ? "white" : colors.darkGray }}
                      >
                        {t("durationLabel")}: {hours.toFixed(1)} {t("hours")}
                      </p>
                      <p
                        className="text-lg font-bold mt-2"
                        style={{
                          color: darkMode ? "#10b981" : colors.navy,
                        }}
                      >
                        {t("estimatedTotal")}: €{total.toFixed(2)}
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
                  selectedSnowmobiles.length === 0 ||
                  !selectedDate ||
                  !allSelectedSnowmobilesAvailable ||
                  checkingAvailability
                }
                className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.navy }}
              >
                {loading
                  ? t("processing")
                  : !allSelectedSnowmobilesAvailable &&
                      selectedSnowmobiles.length > 0 &&
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

              {/* ✅ Selected Snowmobiles Summary */}
              <div
                className="mb-6 p-4 rounded-md"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{
                    color: darkMode ? "#10b981" : colors.navy,
                  }}
                >
                  {t("selectedItems")}
                </h4>
                {selectedSnowmobiles.map((item) => {
                  const model = snowmobileModels.find(
                    (sm) => sm.id === item.snowmobileId
                  );
                  return (
                    <div
                      key={item.snowmobileId}
                      className="flex justify-between items-center mb-2"
                      style={{
                        color: darkMode ? "#cbd5e1" : colors.darkGray,
                      }}
                    >
                      <span>{model?.name}</span>
                      <span className="font-semibold">x{item.quantity}</span>
                    </div>
                  );
                })}
              </div>

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
                    {t("total")}: €{total.toFixed(2)}
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

      {/* ✅ Snowmobile Details Modal */}
      <SnowmobileModal
        snowmobile={selectedSnowmobileForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Payment Modal */}
      {showPayment && (
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
            <OnSitePaymentModal
              onConfirm={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
