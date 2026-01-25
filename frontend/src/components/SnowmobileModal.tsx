"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/constants";
import Image from "next/image";
import { useState, useEffect } from "react";

interface SnowmobileModalProps {
  snowmobile: any;
  isOpen: boolean;
  onClose: () => void;
}

const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads")) {
    return `http://localhost:3001${url}`;
  }
  return url;
};

export default function SnowmobileModal({
  snowmobile,
  isOpen,
  onClose,
}: SnowmobileModalProps) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender || !snowmobile) return null;

  const imageUrl = getImageUrl(snowmobile.imageUrl);

  return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{
          animation: isClosing ? "fadeOut 0.3s ease-out forwards" : "fadeIn 0.3s ease-out",
        }}
        onClick={handleClose}
      >
      <div
        className="rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: darkMode ? "#1a1a2e" : colors.white,
          animation: isClosing ? "slideDown 0.3s ease-in forwards" : "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="sticky top-0 flex justify-end p-4 z-10">
          <button
            onClick={handleClose}
            className="text-2xl font-bold"
            style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
          >
            ✕
          </button>
        </div>

        {/* Image Section */}
        {imageUrl && (
          <div className="relative w-full h-80">
            <img
              src={imageUrl}
              alt={snowmobile.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              {snowmobile.name}
            </h2>
            <p
              className="text-lg"
              style={{ color: darkMode ? "#a0a0a0" : colors.darkGray }}
            >
              {snowmobile.model}
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {snowmobile.year && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  {t("year")}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.year}
                </p>
              </div>
            )}

            {snowmobile.licensePlate && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  {t("licensePlate")}
                </p>
                <p
                  className="text-lg font-bold font-mono"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.licensePlate}
                </p>
              </div>
            )}

            {snowmobile.hourlyRate && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  {t("hourlyRate")}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  €{snowmobile.hourlyRate}/h
                </p>
              </div>
            )}

            {snowmobile.status && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  {t("status")}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: snowmobile.disabled ? "#ff6b6b" : "#10b981",
                  }}
                >
                  {snowmobile.disabled ? t("maintenance") : t("available")}
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          {snowmobile.featureKeys && snowmobile.featureKeys.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                {t("features")}
              </h3>
              <ul
                className="space-y-2"
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
              >
                {snowmobile.featureKeys.map((key: string) => (
                  <li key={key} className="flex items-start">
                    <span
                      className="mr-3 text-lg"
                      style={{ color: colors.teal }}
                    >
                      ✓
                    </span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {snowmobile.description && (
            <div>
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                {t("description")}
              </h3>
              <p
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
                className="leading-relaxed"
              >
                {snowmobile.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
