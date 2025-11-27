"use client";

import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center justify-center font-semibold text-sm"
      )}
      style={{
        backgroundColor: language === "en" ? colors.pink : colors.navy,
        color: colors.white,
      }}
      aria-label={`Switch to ${language === "en" ? "Finnish" : "English"}`}
    >
      <span className="uppercase">{language === "en" ? "EN" : "FI"}</span>
    </button>
  );
}
