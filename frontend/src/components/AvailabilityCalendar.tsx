"use client"

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { colors } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";

type DayStatus = "available" | "limited" | "full";

interface AvailabilityData {
  [date: string]: 
  {
    booked: number;
    capacity: number;
    status: DayStatus;
  }
}

interface AvailabilityCalendarProps {
  packageId: number;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const darkModeStyles = {
  bgPrimary: (isDark: boolean) => isDark ? "#0f172a" : colors.white,
  bgSecondary: (isDark: boolean) => isDark ? "#1e293b" : "#f9fafb",
  textPrimary: (isDark: boolean) => isDark ? "#f1f5f9" : "#101651",
  textSecondary: (isDark: boolean) => isDark ? "#cbd5e1" : "#3b4463",
  border: (isDark: boolean) => isDark ? "#334155" : "#e5e7eb",
};

export function AvailabilityCalendar({ packageId, selectedDate, onDateSelect }: AvailabilityCalendarProps) {
  const { darkMode } = useTheme();
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect (() => {
    
    async function loadAvailability() {
      try {
        setLoading(true);
        const monthStr = format(currentMonth, 'yyyy-MM-dd');
        const response = await fetch(`http://localhost:3001/api/bookings/availability/${packageId}/${monthStr}`);
        const data: AvailabilityData = await response.json();
        setAvailability(data);
      } catch (error) {
        console.error("Failed to load availability:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [packageId, currentMonth]);

  const modifiers = {
    available: (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return availability[dateStr]?.status === "available" || !availability[dateStr];
    },
    limited: (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return availability[dateStr]?.status === "limited";
    },
    full: (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return availability[dateStr]?.status === "full";
    },
  };

  // ✅ Dynamic modifier styles based on dark mode
  const modifierStyles = {
    available: {
      backgroundColor: darkMode ? `${colors.teal}20` : `${colors.teal}30`,
      color: darkMode ? "#f1f5f9" : colors.navy,
      fontWeight: "bold",
    },
    limited: { 
      backgroundColor: darkMode ? `${colors.pink}25` : `${colors.pink}40`,
      color: darkMode ? "#f1f5f9" : colors.navy,
      fontWeight: 'bold',
    },
    full: { 
      backgroundColor: darkMode ? "#475569" : `${colors.darkGray}40`,
      color: darkMode ? "#94a3b8" : colors.white,
      textDecoration: 'line-through',
    },
  };

  const disabledDays = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability[dateStr]?.status === 'full' || date < new Date();
  };

  return (
    <div className="space-y-4">
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #0070f3;
          --rdp-background-color: ${darkMode ? "#1e293b" : "#e0f2fe"};
          color: ${darkModeStyles.textPrimary(darkMode)};
        }

        .rdp-months {
          background-color: ${darkModeStyles.bgPrimary(darkMode)};
          color: ${darkModeStyles.textPrimary(darkMode)};
          border: 1px solid ${darkModeStyles.border(darkMode)};
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .rdp-month {
          width: 100%;
        }

        .rdp-caption {
          color: ${darkModeStyles.textPrimary(darkMode)};
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .rdp-caption_label {
          color: ${darkModeStyles.textPrimary(darkMode)};
        }

        .rdp-head_cell {
          color: ${darkModeStyles.textSecondary(darkMode)};
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .rdp-cell {
          color: ${darkModeStyles.textPrimary(darkMode)};
        }

        .rdp-day {
          border-radius: 0.375rem;
          color: ${darkModeStyles.textPrimary(darkMode)};
          transition: all 0.2s;
        }

        .rdp-day:hover:not([disabled]) {
          background-color: ${darkMode ? "#334155" : "#e0f2fe"};
          cursor: pointer;
        }

        .rdp-day_selected {
          background-color: #0070f3;
          color: white;
          font-weight: bold;
        }

        .rdp-day_disabled {
          color: ${darkMode ? "#64748b" : "#cbd5e1"};
          opacity: 0.5;
        }

        .rdp-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .rdp-button_reset {
          border: none;
          padding: 0;
        }

        button[class*="rdp-button"] {
          color: ${darkModeStyles.textPrimary(darkMode)};
        }

        button[class*="rdp-button"]:hover:not(:disabled) {
          background-color: ${darkMode ? "#334155" : "#f3f4f6"};
        }
      `}</style>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={disabledDays}
        modifiers={modifiers}
        onMonthChange={setCurrentMonth}
        modifiersStyles={modifierStyles}
        className="border rounded-lg p-4"
        style={{ 
          backgroundColor: darkModeStyles.bgPrimary(darkMode),
          borderColor: darkModeStyles.border(darkMode),
        }}
      />

      {/* ✅ Legend with dark mode support */}
      <div className="flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ 
              backgroundColor: darkMode ? `${colors.teal}20` : `${colors.teal}30`,
            }}
          />
          <span style={{ color: darkModeStyles.textPrimary(darkMode) }}>
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ 
              backgroundColor: darkMode ? `${colors.pink}25` : `${colors.pink}40`,
            }}
          />
          <span style={{ color: darkModeStyles.textPrimary(darkMode) }}>
            Limited Spots
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ 
              backgroundColor: darkMode ? "#475569" : `${colors.darkGray}40`,
            }}
          />
          <span style={{ color: darkModeStyles.textPrimary(darkMode) }}>
            Fully Booked
          </span>
        </div>
      </div>

      {/* ✅ Availability details with dark mode support */}
      {selectedDate && availability[format(selectedDate, 'yyyy-MM-dd')] && (
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
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
          <p 
            className="text-sm" 
            style={{ color: darkModeStyles.textSecondary(darkMode) }}
          >
            {availability[format(selectedDate, 'yyyy-MM-dd')].booked} / 
            {availability[format(selectedDate, 'yyyy-MM-dd')].capacity} spots booked
          </p>
        </div>
      )}

      {/* ✅ Loading state with dark mode support */}
      {loading && (
        <p 
          className="text-center text-sm" 
          style={{ color: darkModeStyles.textSecondary(darkMode) }}
        >
          Loading availability...
        </p>
      )}
    </div>
  );
}