"use client"

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { colors } from "@/lib/constants";

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

export function AvailabilityCalendar({ packageId, selectedDate, onDateSelect }: AvailabilityCalendarProps) {
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

  const modifierStyles = {
    available: {
      backgroundColor: `${colors.teal}30`, // light teal
      color: colors.navy,
      fontWeight: "bold",
    },
    limited: { 
      backgroundColor: `${colors.pink}40`,
      color: colors.navy,
      fontWeight: 'bold',
    },
    full: { 
      backgroundColor: `${colors.darkGray}40`,
      color: colors.white,
      textDecoration: 'line-through',
    },
  };

  const disabledDays = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability[dateStr]?.status === 'full' || date < new Date();
  };

  return (
    <div className="space-y-4">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={disabledDays}
        modifiers={modifiers}
        onMonthChange={setCurrentMonth}
        modifiersStyles={modifierStyles}
        className="border rounded-lg p-4"
        style={{ backgroundColor: colors.white }}
      />
      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: `${colors.teal}30` }}
          />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: `${colors.pink}40` }}
          />
          <span>Limited Spots</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: `${colors.darkGray}40` }}
          />
          <span>Fully Booked</span>
        </div>
      </div>

      {/* Show availability details for selected date */}
      {selectedDate && availability[format(selectedDate, 'yyyy-MM-dd')] && (
        <div 
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${colors.beige}` }}
        >
          <p className="font-semibold" style={{ color: colors.navy }}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
          <p className="text-sm" style={{ color: colors.darkGray }}>
            {availability[format(selectedDate, 'yyyy-MM-dd')].booked} / 
            {availability[format(selectedDate, 'yyyy-MM-dd')].capacity} spots booked
          </p>
        </div>
      )}

      {loading && (
        <p className="text-center text-sm" style={{ color: colors.darkGray }}>
          Loading availability...
        </p>
      )}
    </div>
  );
}   