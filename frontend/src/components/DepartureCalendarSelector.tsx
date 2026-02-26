"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
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

interface DepartureCalendarSelectorProps {
  packageId: number;
  selectedDeparture: Departure | null;
  onSelectDeparture: (departure: Departure | null) => void;
}

const darkModeStyles = {
  bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : colors.white),
  bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
  textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
  textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
  border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
  accent: (isDark: boolean) => (isDark ? "#10b981" : "#10b981"),
};

export function DepartureCalendarSelector({
  packageId,
  selectedDeparture,
  onSelectDeparture,
}: DepartureCalendarSelectorProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function loadDepartures() {
      if (!packageId) return;

      try {
        setLoading(true);
        const now = new Date();
        const url = `http://localhost:3001/api/departures?packageId=${packageId}&from=${encodeURIComponent(now.toISOString())}&onlyAvailable=true`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const departuresToSet = Array.isArray(data) ? data : (data.items || []);
        
        // Filter out past departures and fully booked ones
        const futureDepartures = departuresToSet.filter((dep: Departure) => {
          const depDate = new Date(dep.departureTime);
          return depDate > now && dep.reserved < dep.capacity;
        });
        
        setDepartures(futureDepartures);
      } catch (error) {
        console.error("Failed to load departures:", error);
        setDepartures([]);
      } finally {
        setLoading(false);
      }
    }

    loadDepartures();
  }, [packageId]);

  // Filter departures for the selected date
  const filteredDepartures = selectedDate
    ? departures.filter((dep) =>
        isSameDay(parseISO(dep.departureTime), selectedDate)
      )
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // If no departures on that day, clear selection
    if (date) {
      const depsOnDate = departures.filter((dep) =>
        isSameDay(parseISO(dep.departureTime), date)
      );
      if (depsOnDate.length === 0) {
        onSelectDeparture(null);
      }
    }
  };

  const getAvailabilityStatus = (reserved: number, capacity: number) => {
    const available = capacity - reserved;
    if (available <= 0) return "Full";
    if (available <= 2) return `${available} left`;
    return `${available} spots`;
  };

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div>
        <AvailabilityCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* Departure List - only shown when a date is selected */}
      {selectedDate && (
        <div className="space-y-3">
          <div
            className="px-3 py-2 rounded-md font-medium text-sm"
            style={{
              backgroundColor: darkMode ? "#1e293b" : "#f3f4f6",
              color: darkModeStyles.accent(darkMode),
            }}
          >
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>

          {loading ? (
            <div className="p-4 text-center text-sm" style={{ color: darkModeStyles.textSecondary(darkMode) }}>
              {t("loading") || "Loading..."}
            </div>
          ) : filteredDepartures.length === 0 ? (
            <div
              className="p-4 rounded-md text-center text-sm"
              style={{
                backgroundColor: darkModeStyles.bgSecondary(darkMode),
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: darkModeStyles.border(darkMode),
                color: darkModeStyles.textSecondary(darkMode),
              }}
            >
              {t("noDeparturesOnThisDate") || "No departures available on this date"}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredDepartures
                .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
                .map((departure) => {
                  const isSelected = selectedDeparture?.id === departure.id;
                  

                  return (
                    <button
                      key={departure.id}
                      onClick={() => onSelectDeparture(isSelected ? null : departure)}
                      className={`w-full text-left p-3 rounded-md transition-all hover:shadow-sm ${
                        isSelected ? "ring-2 ring-offset-1" : ""
                      }`}
                      style={{
                        backgroundColor: darkModeStyles.bgPrimary(darkMode),
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: isSelected
                          ? darkModeStyles.accent(darkMode)
                          : darkModeStyles.border(darkMode),
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-lg font-bold"
                            style={{ color: darkModeStyles.textPrimary(darkMode) }}
                          >
                            {format(parseISO(departure.departureTime), "HH:mm")}
                          </span>
                          <div
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: darkMode ? "#1e293b" : "#f3f4f6",
                              color: darkMode ? "#f1f5f9" : "#1f2937",
                            }}
                          >
                            {getAvailabilityStatus(departure.reserved, departure.capacity)}
                          </div>
                        </div>

                        {isSelected && (
                          <svg
                            className="w-5 h-5"
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
                        )}
                      </div>
                      <div
                        className="mt-1 text-xs"
                        style={{ color: darkModeStyles.textSecondary(darkMode) }}
                      >
                        {departure.reserved} / {departure.capacity} booked
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && departures.length > 0 && (
        <div
          className="p-3 rounded-md text-center text-sm"
          style={{
            backgroundColor: darkModeStyles.bgSecondary(darkMode),
            color: darkModeStyles.textSecondary(darkMode),
          }}
        >
          {t("selectDateToViewDepartures") || "Select a date to view available departures"}
        </div>
      )}
    </div>
  );
}
