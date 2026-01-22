"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Tour {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  isActive: boolean;
}

interface PackageDetailsModalProps {
  tour: Tour | null;
  isOpen: boolean;
  onClose: () => void;
  getImageUrl: (url?: string) => string | undefined;
}

export function PackageDetailsModal({
  tour,
  isOpen,
  onClose,
  getImageUrl,
}: PackageDetailsModalProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  if (!isOpen || !tour) return null;

  const darkModeStyles = {
    bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : "#ffffff"),
    bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
    textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
    textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
    border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
    accent: (isDark: boolean) => (isDark ? "#10b981" : "#101651"),
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        style={{ backgroundColor: darkModeStyles.bgPrimary(darkMode) }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: darkModeStyles.border(darkMode) }}>
          <h2
            className="text-2xl font-bold"
            style={{ color: darkModeStyles.textPrimary(darkMode) }}
          >
            {t(`tour_${tour.slug}_name`) !== `tour_${tour.slug}_name`
              ? t(`tour_${tour.slug}_name`)
              : tour.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X size={24} style={{ color: darkModeStyles.textPrimary(darkMode) }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 w-full overflow-hidden">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={getImageUrl(tour.imageUrl) || "/images/placeholderTour.jpg"}
              alt={tour.name}
              width={600}
              height={400}
              className="w-full h-64 object-cover"
              unoptimized
            />
          </div>

          {/* Description */}
          {tour.description && (
            <div className="w-full break-words">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: darkModeStyles.textPrimary(darkMode) }}
              >
                {t("about")}
              </h3>
              <p
                className="text-base leading-relaxed break-words whitespace-normal"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t(`tour_${tour.slug}_desc`) !== `tour_${tour.slug}_desc`
                  ? t(`tour_${tour.slug}_desc`)
                  : tour.description}
              </p>
            </div>
          )}

          {/* Tour Details */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: darkModeStyles.bgSecondary(darkMode) }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t("duration")}
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: darkModeStyles.textPrimary(darkMode) }}
              >
                {Math.floor(tour.durationMin / 60)}h {tour.durationMin % 60}m
              </p>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: darkModeStyles.bgSecondary(darkMode) }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t("difficulty")}
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: darkModeStyles.textPrimary(darkMode) }}
              >
                {tour.difficulty}
              </p>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: darkModeStyles.bgSecondary(darkMode) }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: darkModeStyles.textSecondary(darkMode) }}
              >
                {t("pricePerPerson")}
              </p>
              <p className="text-lg font-bold text-[#ff8c3a]">
                €{tour.basePrice}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 cursor-pointer">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition border cursor-pointer"
              style={{
                backgroundColor: darkModeStyles.bgSecondary(darkMode),
                color: darkModeStyles.textPrimary(darkMode),
                borderColor: darkModeStyles.border(darkMode),
              }}
            >
              {t("close")}
            </button>

            <Link
              href="/contact"
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition text-center text-white"
              style={{
                backgroundColor: "#ff8c3a",
              }}
              onClick={onClose}
            >
              {t("contactUs")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
