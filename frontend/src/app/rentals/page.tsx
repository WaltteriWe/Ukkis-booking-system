"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/lib/constants";

export default function RentalsPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: isDark ? colors.darkGray : colors.lightGray }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Page Title */}
        <h1 
          className="text-4xl md:text-5xl font-bold text-center mb-8"
          style={{ color: isDark ? "#fff" : colors.navy }}
        >
          {t("rentSnowmobileTitle")}
        </h1>

        {/* Contact Info Card */}
        <div 
          className="rounded-2xl shadow-lg p-8 md:p-12"
          style={{ 
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            border: isDark ? "1px solid #333" : "none"
          }}
        >
          <h2 
            className="text-2xl font-semibold mb-6"
            style={{ color: isDark ? "#fff" : colors.navy }}
          >
            {t("contactForRental")}
          </h2>

          <div className="space-y-6">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.pink }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p 
                  className="text-sm font-medium mb-1"
                  style={{ color: isDark ? "#999" : colors.darkGray }}
                >
                  {t("phone")}
                </p>
                <a 
                  href="tel:+358401306777"
                  className="text-xl font-semibold hover:underline"
                  style={{ color: isDark ? "#fff" : colors.navy }}
                >
                  +358 40 1306777
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.pink }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p 
                  className="text-sm font-medium mb-1"
                  style={{ color: isDark ? "#999" : colors.darkGray }}
                >
                  {t("email")}
                </p>
                <a 
                  href="mailto:safaris@ukkis.fi"
                  className="text-xl font-semibold hover:underline"
                  style={{ color: isDark ? "#fff" : colors.navy }}
                >
                  safaris@ukkis.fi
                </a>
              </div>
            </div>

            

              
            </div>
          </div>
        </div>
      </div>
  );
}