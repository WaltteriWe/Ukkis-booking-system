"use client"

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { colors } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";

interface AvailabilityCalendarProps {
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

export function AvailabilityCalendar({ selectedDate, onDateSelect }: AvailabilityCalendarProps) {
  const { darkMode } = useTheme();

  const disabledDays = (date: Date) => {
    return date < new Date();
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
        className="rounded-lg p-4"
        style={{ 
          backgroundColor: darkModeStyles.bgPrimary(darkMode),
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: darkModeStyles.border(darkMode),
        }}
      />
    </div>
  );
}