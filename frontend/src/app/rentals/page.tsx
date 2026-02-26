"use client";

import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const TempRentals = () => {
  
  const { t } = useLanguage();

  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-blue-100"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden ${
          darkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${
            darkMode ? "from-blue-800 to-blue-900" : "from-blue-600 to-blue-700"
          } p-12 text-center`}
        >
          <p className="text-2xl font-bold text-blue-100">{t("tempRentalTitle")}</p>
        </div>

        {/* Image */}
        <div className="relative w-full h-80">
          <Image
            src="/images/rentalPage.jpg"
            alt="Ukkis Adventure"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-12 space-y-8">
          {/* Email */}
          <div className="flex items-center gap-4 justify-center">
            <Mail
              className={`w-6 h-6 flex-shrink-0 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <a
              href="mailto:info@ukkis.fi"
              className={`text-2xl transition font-medium ${
                darkMode
                  ? "text-slate-100 hover:text-blue-400"
                  : "text-gray-900 hover:text-blue-600"
              }`}
            >
              info@ukkis.fi
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 justify-center">
            <Phone
              className={`w-6 h-6 flex-shrink-0 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <a
              href="tel:+358401316777"
              className={`text-2xl transition font-medium ${
                darkMode
                  ? "text-slate-100 hover:text-blue-400"
                  : "text-gray-900 hover:text-blue-600"
              }`}
            >
              +358 401 316 777
            </a>
          </div>

          <p
            className={`text-lg text-center leading-relaxed ${
              darkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            {t("tempRentalSubtitle")}
          </p>

          {/* CTA */}
          <div className="text-center pt-6">
            <a
              href="mailto:info@ukkis.fi"
              className={`inline-block font-bold py-3 px-8 rounded-lg transition text-lg ${
                darkMode
                  ? "bg-blue-700 hover:bg-blue-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {t("contactUs")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempRentals;