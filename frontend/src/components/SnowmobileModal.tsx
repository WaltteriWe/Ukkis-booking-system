"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/constants";
import { useState, useEffect } from "react";
import Image from "next/image";

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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      style={{
        animation: isClosing ? "fadeOut 0.3s ease-out forwards" : "fadeIn 0.3s ease-out",
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-lg shadow-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto"
        style={{
          backgroundColor: darkMode ? "#1a1a2e" : colors.white,
          animation: isClosing ? "slideDown 0.3s ease-in forwards" : "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-20 flex justify-end p-3 sm:p-4" style={{ backgroundColor: darkMode ? "#1a1a2e" : colors.white }}>
          <button
            onClick={handleClose}
            className="text-2xl font-bold hover:opacity-70 transition-opacity"
            style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
          >
            ✕
          </button>
        </div>

        {/* Image Section */}
        {imageUrl && (
          <div className="relative w-full h-48 sm:h-64 md:h-80">
            <Image
              src={imageUrl}
              alt={snowmobile.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              {snowmobile.name}
            </h2>
            {snowmobile.model && (
              <p
                className="text-base sm:text-lg"
                style={{ color: darkMode ? "#a0a0a0" : colors.darkGray }}
              >
                {snowmobile.model}
              </p>
            )}
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {snowmobile.engineSize && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Moottori
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.engineSize}
                </p>
              </div>
            )}

            {snowmobile.driveSystem && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Veto
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.driveSystem}
                </p>
              </div>
            )}

            {snowmobile.seating && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Paikkoja
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.seating}
                </p>
              </div>
            )}

            {snowmobile.startSystem && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Käynnistys
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.startSystem}
                </p>
              </div>
            )}

            {snowmobile.year && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Vuosimalli
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.year}
                </p>
              </div>
            )}

            {snowmobile.kilometerlimit && (
              <div
                className="p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: darkMode ? "#10b981" : colors.teal }}
                >
                  Kilometriraja
                </p>
                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {snowmobile.kilometerlimit}
                  {snowmobile.extraKmPrice && (
                    <span className="text-xs font-normal ml-1">
                      (+{snowmobile.extraKmPrice})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Target Audience */}
          {snowmobile.targetAudience && (
            <div className="mb-6">
              <p
                className="text-sm sm:text-base italic"
                style={{ color: darkMode ? "#10b981" : colors.teal }}
              >
                {snowmobile.targetAudience}
              </p>
            </div>
          )}

          {/* Features List */}
          {snowmobile.features && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                Ominaisuudet
              </h3>
              <ul
                className="space-y-2 text-sm sm:text-base"
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
              >
                {snowmobile.features.split('\n').map((feature: string, index: number) => (
                  feature.trim() && (
                    <li key={index} className="flex items-start">
                      <span
                        className="mr-2 sm:mr-3 text-base sm:text-lg shrink-0"
                        style={{ color: colors.teal }}
                      >
                        ✓
                      </span>
                      <span>{feature.trim()}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {snowmobile.description && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                Kuvaus
              </h3>
              <p
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
                className="leading-relaxed text-sm sm:text-base whitespace-pre-wrap"
              >
                {snowmobile.description}
              </p>
            </div>
          )}

          {/* Static Rental Information */}
          <div className="border-t pt-6 mt-6" style={{ borderColor: darkMode ? "#334155" : "#e5e7eb" }}>
            <h3
              className="text-lg sm:text-xl font-bold mb-4"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              Vuokrausehdot
            </h3>

            {/* What's Included */}
            <div className="mb-6">
              <h4
                className="text-sm sm:text-base font-semibold mb-2"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                Mitä sisältyy hintaan?
              </h4>
              <ul
                className="space-y-1 text-xs sm:text-sm"
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
              >
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Moottorikelkka</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Ajovarusteet</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Liikennevakuutus (omavastuu vahinkotapauksissa 1000 euroa)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Kainuun alueen uraluvat</span>
                </li>
              </ul>
            </div>

            {/* What's Not Included */}
            <div className="mb-6">
              <h4
                className="text-sm sm:text-base font-semibold mb-2"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                Mitä ei sisälly hintaan
              </h4>
              <ul
                className="space-y-1 text-xs sm:text-sm"
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
              >
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Polttoaine ei sisälly vuokraan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Vuokraamon pihalla on tankkausmahdollisuus</span>
                </li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="mb-6">
              <h4
                className="text-sm sm:text-base font-semibold mb-2"
                style={{ color: darkMode ? "#10b981" : colors.navy }}
              >
                Huomioithan
              </h4>
              <ul
                className="space-y-1 text-xs sm:text-sm"
                style={{ color: darkMode ? "#cbd5e1" : colors.darkGray }}
              >
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Moottorikelkan vuokraajan on oltava vähintään 18-vuotias</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Vuokraaja on vastuussa kelkasta, eikä saa luovuttaa sitä kolmannelle osapuolelle</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Moottorikelkan kuljettajan on oltava vähintään 15-vuotias (alle 15-vuotias vain vanhempien seurassa)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Kainuun alueella on käytössä uraluvat. Urilla ajolla ei vaadita ajokorttia. Moottorikelkkaa saa kuljettaa vähintään 15-vuotias ilman ajokorttia</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 shrink-0">•</span>
                  <span>Moottorikäyttöisen ajoneuvon kuljettaminen alkoholin tai huumaavien aineiden tai lääkkeiden vaikutuksen alaisena on vastoin Suomen lakeja</span>
                </li>
              </ul>
            </div>

            {/* Additional Info */}
            <div
              className="p-3 sm:p-4 rounded-lg text-xs sm:text-sm"
              style={{
                backgroundColor: darkMode ? "#16243a" : `${colors.teal}10`,
                color: darkMode ? "#cbd5e1" : colors.darkGray,
              }}
            >
              <p className="font-semibold mb-1">Lisätiedot</p>
              <p>Varaukset tulee tehdä viimeistään edeltävänä päivänä. Varaukset puhelimitse myös samalle päivälle!</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
