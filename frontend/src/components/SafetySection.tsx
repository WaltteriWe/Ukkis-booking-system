"use client";

import { colors } from "@/lib/constants";
import { Shield, Star, Wrench } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";


const SafetySection = () => {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
 

  const features = [
    {
      icon: Star,
      title: t("certifiedGuides"),
      description: t("certifiedGuidesDesc"),
    },
    {
      icon: Wrench,
      title: t("premiumEquipment"),
      description: t("premiumEquipmentDesc"),
    },
    {
      icon: Shield,
      title: t("emergencyPrepared"),
      description: t("emergencyPreparedDesc"),
    },
  ];

  return (
    <div
      className="py-16 my-8 rounded-lg shadow-md transition-all duration-700 ease-in-out relative overflow-hidden"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
          : colors.white,
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
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: darkMode ? "#10b981" : colors.teal }}
            >
              {t("safetyTitle")}
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: darkMode ? "rgba(255, 255, 255, 0.85)" : colors.darkGray }}
            >
              {t("safetyText1")}
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-full"
                      style={{ backgroundColor: colors.teal }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg mb-1"
                        style={{ color: darkMode ? "#ffffff" : colors.navy }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ color: darkMode ? "rgba(255, 255, 255, 0.75)" : colors.darkGray }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div
              className="rounded-3xl h-96 flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, ${colors.teal}, ${colors.navy})`,
              }}
            >
              <div
                className="rounded-2xl w-48 h-32 transform rotate-12"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.pink}, ${colors.teal})`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetySection;
