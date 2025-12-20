"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { colors } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface Departure {
  id: number;
  packageId: number;
  departureTime: string;
  capacity: number;
  reserved: number;
}

interface DepartureSelectorProps {
  packageId: number;
  selectedDate: Date | undefined;
  onSelectDeparture: (departure: Departure | null) => void;
  selectedDeparture: Departure | null;
}

const darkModeStyles = {
  bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : colors.white),
  bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
  textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
  textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
  border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
  accent: (isDark: boolean) => (isDark ? "#10b981" : "#10b981"),
};

export function DepartureSelector({
  packageId,
  selectedDate,
  onSelectDeparture,
  selectedDeparture,
}: DepartureSelectorProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectDeparture = useCallback((departure: Departure | null) => {
    onSelectDeparture(departure);
  }, [onSelectDeparture]);

  useEffect(() => {
    async function loadDepartures() {
      if (!selectedDate) {
        setDepartures([]);
        return;
      }

      try {
        setLoading(true);
        // Create date range for the selected day (ISO format with time)
        const dateStart = new Date(selectedDate);
        dateStart.setUTCHours(0, 0, 0, 0);
        const dateEnd = new Date(selectedDate);
        dateEnd.setUTCHours(23, 59, 59, 999);
        
        const url = `http://localhost:3001/api/departures?packageId=${packageId}&from=${encodeURIComponent(dateStart.toISOString())}&to=${encodeURIComponent(dateEnd.toISOString())}`;
        console.log("Fetching departures from:", url);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("Departures data:", data);
        console.log("Is array?", Array.isArray(data));
        console.log("Data type:", typeof data);
        
        const departuresToSet = Array.isArray(data) ? data : (data.items || []);
        console.log("Setting departures:", departuresToSet);
        departuresToSet.forEach(dep => {
          console.log(`Departure ${dep.id}: capacity=${dep.capacity}, reserved=${dep.reserved}, available=${dep.capacity - dep.reserved}`);
        });
        
        setDepartures(departuresToSet);
        handleSelectDeparture(null); // Reset selection when date changes
      } catch (error) {
        console.error("Failed to load departures:", error);
        setDepartures([]);
      } finally {
        setLoading(false);
      }
    }

    loadDepartures();
  }, [packageId, selectedDate, handleSelectDeparture]);

  const getAvailabilityColor = (
    reserved: number,
    capacity: number,
    isDark: boolean
  ) => {
    const percentage = (reserved / capacity) * 100;
    if (percentage >= 100) return isDark ? "#475569" : "#d1d5db";
    if (percentage >= 75) return isDark ? `${colors.pink}60` : `${colors.pink}50`;
    return isDark ? `${colors.teal}60` : `${colors.teal}40`;
  };

  const getAvailabilityStatus = (reserved: number, capacity: number) => {
    if (reserved >= capacity) return "Full";
    if (reserved >= capacity * 0.75) return "Limited";
    return "Available";
  };

  if (!selectedDate) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: darkModeStyles.textSecondary(darkMode) }}>
        Loading departures...
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div
        className="p-4 rounded-lg border text-center"
        style={{
          backgroundColor: darkModeStyles.bgSecondary(darkMode),
          borderColor: darkModeStyles.border(darkMode),
          color: darkModeStyles.textSecondary(darkMode),
        }}
      >
        No departures available for {format(selectedDate, "MMMM d, yyyy")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: darkModeStyles.bgSecondary(darkMode),
          borderColor: darkModeStyles.border(darkMode),
        }}
      >
        <p
          className="font-semibold"
          style={{ color: darkModeStyles.textPrimary(darkMode) }}
        >
          {format(selectedDate, "MMMM d, yyyy")}
        </p>
        <p
          className="text-sm"
          style={{ color: darkModeStyles.textSecondary(darkMode) }}
        >
          {departures.reduce((sum, d) => sum + d.reserved, 0)} /{departures.reduce((sum, d) => sum + d.capacity, 0)} {t("spotsBooked")}
        </p>
      </div>

      <h3
        className="font-semibold text-lg"
        style={{ color: darkModeStyles.textPrimary(darkMode) }}
      >
        Select a Departure
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {departures.map((departure) => {
          const remainingSpots = departure.capacity - departure.reserved;
          const isSelected = selectedDeparture?.id === departure.id;
          const isFull = remainingSpots <= 0;
          console.log(`Rendering departure ${departure.id}: capacity=${departure.capacity}, reserved=${departure.reserved}, remaining=${remainingSpots}`);
          const bgColor = getAvailabilityColor(
            departure.reserved,
            departure.capacity,
            darkMode
          );
          const status = getAvailabilityStatus(
            departure.reserved,
            departure.capacity
          );

          return (
            <button
              key={departure.id}
              onClick={() => !isFull && handleSelectDeparture(departure)}
              disabled={isFull}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected ? "ring-2" : "hover:shadow-md"
              } ${isFull ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: darkModeStyles.bgSecondary(darkMode),
                borderColor: isSelected ? colors.teal : darkModeStyles.border(darkMode),
                boxShadow: isSelected ? `0 0 0 2px ${bgColor}` : "none",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-left flex-1">
                  <p
                    className="font-semibold"
                    style={{ color: darkModeStyles.textPrimary(darkMode) }}
                  >
                    {format(new Date(departure.departureTime), "HH:mm")}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: darkModeStyles.textSecondary(darkMode) }}
                  >
                    {remainingSpots > 0
                      ? `${remainingSpots} spot${remainingSpots === 1 ? "" : "s"} left`
                      : "Fully booked"}
                  </p>
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-semibold text-white"
                  style={{
                    backgroundColor: bgColor,
                  }}
                >
                  {status}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(departure.reserved / departure.capacity) * 100}%`,
                    backgroundColor: bgColor,
                  }}
                />
              </div>
              <p
                className="text-xs mt-2"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {departure.reserved} / {departure.capacity} booked
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
