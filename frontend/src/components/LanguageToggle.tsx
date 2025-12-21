"use client";

import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GB, FI } from 'country-flag-icons/react/3x2'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  const flagComponent = language === "en" ? <GB className="w-6 h-10" title="English" /> : <FI className="w-6 h-10" title="Finnish" />

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center justify-center font-semibold text-sm"
      )}
      style={{
        backgroundColor: "transparent",
        color: colors.white,
      }}
      aria-label={`Switch to ${language === "en" ? "Finnish" : "English"}`}
    >
      {flagComponent}
    </button>
  );
}
