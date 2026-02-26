"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  getAllOperatingHours,
  setDefaultOperatingHours,
  setDateOperatingHours,
  deleteDateOperatingHours,
} from "@/lib/api";

interface OperatingHour {
  id: number;
  date: Date | null;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function OperatingHoursManagement() {
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default hours state
  const [defaultHours, setDefaultHours] = useState({
    openingTime: "08:00",
    closingTime: "18:00",
    notes: "",
  });

  // Date override state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateOverride, setDateOverride] = useState({
    openingTime: "08:00",
    closingTime: "18:00",
    isClosed: false,
    notes: "",
  });

  // Load all operating hours
  const loadOperatingHours = async () => {
    try {
      setLoading(true);
      const hours = await getAllOperatingHours();
      setOperatingHours(hours);

      // Find and set default hours
      const defaultEntry = hours.find((h: any) => h.date === null);
      if (defaultEntry) {
        setDefaultHours({
          openingTime: defaultEntry.openingTime,
          closingTime: defaultEntry.closingTime,
          notes: defaultEntry.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load operating hours:", error);
      alert("Failed to load operating hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperatingHours();
  }, []);

  // Save default hours
  const handleSaveDefaultHours = async () => {
    try {
      setSaving(true);
      await setDefaultOperatingHours(defaultHours);
      alert("Default operating hours saved successfully!");
      await loadOperatingHours();
    } catch (error) {
      console.error("Failed to save default hours:", error);
      alert("Failed to save default hours");
    } finally {
      setSaving(false);
    }
  };

  // Save date-specific override
  const handleSaveDateOverride = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    try {
      setSaving(true);
      await setDateOperatingHours({
        date: format(selectedDate, "yyyy-MM-dd"),
        ...dateOverride,
      });
      alert("Date-specific hours saved successfully!");
      await loadOperatingHours();
      // Reset form
      setSelectedDate(undefined);
      setDateOverride({
        openingTime: "08:00",
        closingTime: "18:00",
        isClosed: false,
        notes: "",
      });
    } catch (error) {
      console.error("Failed to save date override:", error);
      alert("Failed to save date-specific hours");
    } finally {
      setSaving(false);
    }
  };

  // Delete date-specific override
  const handleDeleteDateOverride = async (date: Date) => {
    if (!confirm(`Delete custom hours for ${format(date, "MMMM d, yyyy")}?`)) {
      return;
    }

    try {
      await deleteDateOperatingHours(format(date, "yyyy-MM-dd"));
      alert("Date-specific hours deleted successfully!");
      await loadOperatingHours();
    } catch (error) {
      console.error("Failed to delete date override:", error);
      alert("Failed to delete date-specific hours");
    }
  };

  // Get date-specific overrides sorted by date
  const dateOverrides = operatingHours
    .filter((h) => h.date !== null)
    .sort((a, b) => {
      const dateA = new Date(a.date!).getTime();
      const dateB = new Date(b.date!).getTime();
      return dateA - dateB;
    });

  // Generate time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading operating hours...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operating Hours Management</h2>
        <p className="text-gray-600 mt-1">
          Configure default operating hours and date-specific overrides for snowmobile rentals
        </p>
      </div>

      {/* Default Operating Hours */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Default Operating Hours</h3>
        <p className="text-sm text-gray-600 mb-4">
          These hours will be used for all dates unless overridden below
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opening Time</label>
            <select
              value={defaultHours.openingTime}
              onChange={(e) =>
                setDefaultHours({ ...defaultHours, openingTime: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Closing Time</label>
            <select
              value={defaultHours.closingTime}
              onChange={(e) =>
                setDefaultHours({ ...defaultHours, closingTime: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <input
              type="text"
              value={defaultHours.notes}
              onChange={(e) =>
                setDefaultHours({ ...defaultHours, notes: e.target.value })
              }
              placeholder="e.g., Standard hours"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleSaveDefaultHours}
          disabled={saving}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Default Hours"}
        </button>
      </div>

      {/* Date-Specific Overrides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Date-Specific Overrides</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set custom hours for specific dates (holidays, special events, etc.)
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar for date selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>

          {/* Override settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date: {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}
              </label>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isClosed"
                checked={dateOverride.isClosed}
                onChange={(e) =>
                  setDateOverride({ ...dateOverride, isClosed: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="isClosed" className="text-sm font-medium">
                Closed for rentals on this date
              </label>
            </div>

            {!dateOverride.isClosed && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Opening Time</label>
                  <select
                    value={dateOverride.openingTime}
                    onChange={(e) =>
                      setDateOverride({ ...dateOverride, openingTime: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Closing Time</label>
                  <select
                    value={dateOverride.closingTime}
                    onChange={(e) =>
                      setDateOverride({ ...dateOverride, closingTime: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                value={dateOverride.notes}
                onChange={(e) =>
                  setDateOverride({ ...dateOverride, notes: e.target.value })
                }
                placeholder="e.g., Holiday hours, Special event"
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveDateOverride}
              disabled={!selectedDate || saving}
              className="w-full bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Date Override"}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Overrides List */}
      {dateOverrides.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Active Date Overrides</h3>
          <div className="space-y-3">
            {dateOverrides.map((override) => {
              const overrideDate = new Date(override.date!);
              return (
                <div
                  key={override.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {format(overrideDate, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {override.isClosed ? (
                        <span className="text-red-600 font-medium">❌ Closed</span>
                      ) : (
                        <span>
                          🕐 {override.openingTime} - {override.closingTime}
                        </span>
                      )}
                      {override.notes && (
                        <span className="ml-3 text-gray-500">• {override.notes}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDateOverride(overrideDate)}
                    className="ml-4 text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ How it works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Default hours apply to all dates automatically</li>
          <li>• Date-specific overrides take priority over default hours</li>
          <li>• Customers will see these hours when booking rentals</li>
          <li>• Closed dates prevent all rental bookings</li>
          <li>• Delete an override to revert back to default hours for that date</li>
        </ul>
      </div>
    </div>
  );
}
