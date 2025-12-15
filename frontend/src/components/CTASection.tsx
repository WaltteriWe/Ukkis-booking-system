"use client";

import Link from "next/link";
import { colors } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const CTASection = () => {
  const { t } = useLanguage();
  const { darkMode } = useTheme();

  return (
    <div
      className="py-20 mt-8 rounded-lg transition-all duration-700 ease-in-out relative overflow-hidden"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
          : `linear-gradient(to bottom right, ${colors.teal}, ${colors.navy})`,
        boxShadow: darkMode
          ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(0, 255, 200, 0.05)"
          : "none",
      }}
    >
      {darkMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 50%, rgba(139, 92, 246, 0.05) 100%)",
            animation: "aurora 10s ease-in-out infinite",
            filter: "blur(60px)",
            opacity: 0.6,
          }}
        />
      )}

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
          {t("ctaTitle")}
        </h2>
        <p
          className="text-xl mb-10 max-w-3xl mx-auto drop-shadow-md"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          {t("ctaSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bookings"
            className="text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: colors.pink }}
          >
            {t("ctaButton")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
