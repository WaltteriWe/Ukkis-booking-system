"use client";

import { colors } from "@/lib/constants";
import { Shield, Star, Wrench } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SafetySection = () => {
  const { t } = useLanguage();

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
      className=" py-16 my-8 rounded-lg shadow-md"
      style={{ backgroundColor: colors.white }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: colors.teal }}
            >
              {t("safetyTitle")}
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: colors.darkGray }}
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
                        style={{ color: colors.navy }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ color: colors.darkGray }}>
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
