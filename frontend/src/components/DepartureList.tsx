"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isSameDay } from "date-fns";
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

interface DepartureListProps {
  packageId: number;
  onSelectDeparture: (departure: Departure) => void;
  selectedDeparture: Departure | null;
  filterDate?: Date;
}

const darkModeStyles = {
  bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : colors.white),
  bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
  textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
  textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
  border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
  accent: (isDark: boolean) => (isDark ? "#10b981" : "#10b981"),
};

export function DepartureList({
  packageId,
  onSelectDeparture,
  selectedDeparture,
  filterDate,
}: DepartureListProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDepartures() {
      if (!packageId) return;

      try {
        setLoading(true);
        // Load all future departures for the package
        const now = new Date();
        const url = `/api/departures?packageId=${packageId}&from=${encodeURIComponent(now.toISOString())}&onlyAvailable=true`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const departuresToSet = Array.isArray(data) ? data : (data.items || []);
        setDepartures(departuresToSet);
      } catch (error) {
        console.error("Failed to load departures:", error);
        setDepartures([]);
      } finally {
        setLoading(false);
      }
    }

    loadDepartures();
  }, [packageId]);

  // Filter departures by date if filterDate is provided
  const filteredDepartures = useMemo(() => {
    if (!filterDate) return departures;
    return departures.filter(dep => 
      isSameDay(parseISO(dep.departureTime), filterDate)
    );
  }, [departures, filterDate]);

  // Group departures by date
  const groupedDepartures = useMemo(() => {
    const groups: { [key: string]: Departure[] } = {};
    
    filteredDepartures.forEach(dep => {
      const date = format(parseISO(dep.departureTime), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(dep);
    });

    // Sort each group by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => 
        new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );
    });

    return groups;
  }, [filteredDepartures]);

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
    const available = capacity - reserved;
    if (available <= 0) return "Full";
    if (available <= 2) return `Only ${available} left`;
    return `${available} spots`;
  };

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: darkModeStyles.textSecondary(darkMode) }}>
        Loading departures...
      </div>
    );
  }

  if (filteredDepartures.length === 0) {
    return (
      <div
        className="p-6 rounded-lg border text-center"
        style={{
          backgroundColor: darkModeStyles.bgSecondary(darkMode),
          borderColor: darkModeStyles.border(darkMode),
          color: darkModeStyles.textSecondary(darkMode),
        }}
      >
        <p className="text-lg font-semibold">No departures available</p>
        <p className="text-sm mt-2">
          {filterDate 
            ? `No departures on ${format(filterDate, "MMMM d, yyyy")}`
            : "No upcoming departures for this package"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between p-4 rounded-lg"
        style={{
          backgroundColor: darkModeStyles.bgSecondary(darkMode),
          borderColor: darkModeStyles.border(darkMode),
        }}
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: darkModeStyles.textPrimary(darkMode) }}
        >
          {filterDate 
            ? `Departures on ${format(filterDate, "MMMM d, yyyy")}`
            : t("availableDepartures") || "Available Departures"}
        </h3>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: darkMode ? "#10b98130" : "#10b98120",
            color: darkModeStyles.accent(darkMode),
          }}
        >
          {filteredDepartures.length} {filteredDepartures.length === 1 ? "departure" : "departures"}
        </span>
      </div>

      {Object.entries(groupedDepartures).map(([date, dateDepartures]) => (
        <div key={date} className="space-y-3">
          <div
            className="sticky top-0 z-10 px-4 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: darkMode ? "#1e293b" : "#f3f4f6",
              color: darkModeStyles.accent(darkMode),
            }}
          >
            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
          </div>

          <div className="space-y-2">
            {dateDepartures.map((departure) => {
              const isSelected = selectedDeparture?.id === departure.id;
              const available = departure.capacity - departure.reserved;
              const availabilityColor = getAvailabilityColor(
                departure.reserved,
                departure.capacity,
                darkMode
              );

              return (
                <button
                  key={departure.id}
                  onClick={() => onSelectDeparture(departure)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={{
                    backgroundColor: darkModeStyles.bgPrimary(darkMode),
                    borderColor: isSelected
                      ? darkModeStyles.accent(darkMode)
                      : darkModeStyles.border(darkMode),
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: darkModeStyles.textPrimary(darkMode) }}
                        >
                          {format(parseISO(departure.departureTime), "HH:mm")}
                        </span>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: availabilityColor,
                            color: darkMode ? "#f1f5f9" : "#1f2937",
                          }}
                        >
                          {getAvailabilityStatus(departure.reserved, departure.capacity)}
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm"
                        style={{ color: darkModeStyles.textSecondary(darkMode) }}
                      >
                        {departure.reserved} / {departure.capacity} booked
                      </div>
                    </div>

                    {isSelected && (
                      <div className="ml-4">
                        <svg
                          className="w-6 h-6"
                          style={{ color: darkModeStyles.accent(darkMode) }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {available <= 0 && (
                    <div
                      className="mt-2 text-sm font-medium"
                      style={{ color: "#ef4444" }}
                    >
                      ⚠️ This departure is fully booked
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
