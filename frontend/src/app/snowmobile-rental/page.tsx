"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import {
  getAvailableSnowmobiles,
  createSnowmobileRental,
  sendConfirmationEmail,
} from "@/lib/api";
import { colors } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";

export default function SnowmobileRentalPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [availableSnowmobiles, setAvailableSnowmobiles] = useState<any[]>([]);
  const [selectedSnowmobile, setSelectedSnowmobile] = useState<number | null>(
    null
  );
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const HOURLY_RATE = 50; // €50 per hour

  async function checkAvailability() {
    if (!selectedDate || !startTime || !endTime) {
      alert("Please select date, start time and end time");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startDateTime = `${dateStr}T${startTime}:00`;
    const endDateTime = `${dateStr}T${endTime}:00`;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const available = await getAvailableSnowmobiles(
        start.toISOString(),
        end.toISOString()
      );
      setAvailableSnowmobiles(available);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Failed to check availability");
    } finally {
      setLoading(false);
    }
  }

  function calculateTotal() {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const hours = endHour + endMin / 60 - (startHour + startMin / 60);
    return Math.ceil(hours) * HOURLY_RATE;
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSnowmobile || !selectedDate) {
      alert("Please select a snowmobile and date");
      return;
    }

    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const startDateTime = `${dateStr}T${startTime}:00`;
      const endDateTime = `${dateStr}T${endTime}:00`;

      const startTimeISO = new Date(startDateTime).toISOString();
      const endTimeISO = new Date(endDateTime).toISOString();

      const rental = await createSnowmobileRental({
        snowmobileId: selectedSnowmobile,
        guestEmail,
        guestName,
        phone,
        startTime: startTimeISO,
        endTime: endTimeISO,
        totalPrice: calculateTotal(),
        notes: `Private snowmobile rental`,
      });

      try {
        await sendConfirmationEmail({
          email: guestEmail,
          name: guestName,
          tour: `Snowmobile Rental - ${availableSnowmobiles.find((sm) => sm.id === selectedSnowmobile)?.name || "Snowmobile"}`,
          date: format(selectedDate, "MMMM d, yyyy"),
          time: `${startTime} - ${endTime}`,
          participants: 1,
          total: calculateTotal(),
          bookingId: rental.id.toString(),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      alert("Booking confirmed! Check your email for details.");
      setStep(1);
      setSelectedDate(undefined);
      setStartTime("10:00");
      setEndTime("12:00");
      setSelectedSnowmobile(null);
      setGuestName("");
      setGuestEmail("");
      setPhone("");
    } catch (error) {
      console.error(error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <header
        className="text-white py-12"
        style={{ backgroundColor: colors.navy }}
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
            style={{ backgroundColor: colors.white }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t("checkAvailabilityButton")}
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.darkGray }}
                >
                  {t("selectDateLabel")}
                </label>
                <div className="border rounded-lg p-4 bg-white">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="mx-auto"
                  />
                </div>
                {selectedDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    {t("selectedDate")}: {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkGray }}
                  >
                    {t("startTimeLabel")}
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{ color: colors.darkGray }}
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
                    style={{ color: colors.darkGray }}
                  >
                    {t("endTimeLabel")}
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    style={{ color: colors.darkGray }}
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

              {selectedDate && startTime && endTime && (
                <div
                  className="p-4 rounded-md"
                  style={{ backgroundColor: `${colors.teal}20` }}
                >
                  <p className="text-sm" style={{ color: colors.darkGray }}>
                    {t("durationLabel")}:{" "}
                    {Math.ceil(calculateTotal() / HOURLY_RATE)} {t("hours")}
                  </p>
                  <p
                    className="text-lg font-bold mt-2"
                    style={{ color: colors.navy }}
                  >
                    {t("estimatedTotal")}: €{calculateTotal()}
                  </p>
                </div>
              )}

              <button
                onClick={checkAvailability}
                disabled={loading || !selectedDate}
                className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.navy }}
              >
                {loading ? t("checking") : t("checkAvailabilityButton")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 hover:underline"
              style={{ color: colors.teal }}
            >
              {t("backToTimeSelection")}
            </button>

            {availableSnowmobiles.length === 0 ? (
              <div
                className="rounded-lg shadow-md p-8 text-center"
                style={{ backgroundColor: colors.white }}
              >
                <p className="text-xl" style={{ color: colors.darkGray }}>
                  {t("noSnowmobilesAvailable")}
                </p>
                <p
                  className="text-sm mt-2"
                  style={{ color: colors.darkGray, opacity: 0.7 }}
                >
                  {t("tryDifferentTime")}
                </p>
              </div>
            ) : (
              <>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: colors.navy }}
                >
                  {t("selectASnowmobile")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                  {availableSnowmobiles.map((snowmobile) => (
                    <div
                      key={snowmobile.id}
                      onClick={() => setSelectedSnowmobile(snowmobile.id)}
                      className={`rounded-lg shadow-md p-6 cursor-pointer transition ${
                        selectedSnowmobile === snowmobile.id
                          ? "ring-4"
                          : "hover:shadow-lg"
                      }`}
                      style={{
                        backgroundColor: colors.white,
                        ringColor:
                          selectedSnowmobile === snowmobile.id
                            ? colors.teal
                            : "transparent",
                      }}
                    >
                      <h3
                        className="text-lg font-bold"
                        style={{ color: colors.navy }}
                      >
                        {snowmobile.name}
                      </h3>
                      {snowmobile.model && (
                        <p
                          className="text-sm"
                          style={{ color: colors.darkGray }}
                        >
                          {snowmobile.model}
                        </p>
                      )}
                      {snowmobile.year && (
                        <p
                          className="text-sm"
                          style={{ color: colors.darkGray, opacity: 0.7 }}
                        >
                          {t("year")}: {snowmobile.year}
                        </p>
                      )}
                      {snowmobile.licensePlate && (
                        <p
                          className="text-xs mt-2"
                          style={{ color: colors.darkGray, opacity: 0.5 }}
                        >
                          {t("plate")}: {snowmobile.licensePlate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {selectedSnowmobile && (
                  <form
                    onSubmit={handleBooking}
                    className="rounded-lg shadow-md p-8"
                    style={{ backgroundColor: colors.white }}
                  >
                    <h3
                      className="text-xl font-bold mb-6"
                      style={{ color: colors.navy }}
                    >
                      {t("yourDetails")}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.darkGray }}
                        >
                          {t("name")} {t("required")}
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.darkGray }}
                        >
                          {t("email")} {t("required")}
                        </label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.darkGray }}
                        >
                          {t("phone")}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div
                        className="p-4 rounded-md"
                        style={{ backgroundColor: `${colors.teal}20` }}
                      >
                        <p
                          className="text-lg font-bold"
                          style={{ color: colors.navy }}
                        >
                          {t("total")}: €{calculateTotal()}
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
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
