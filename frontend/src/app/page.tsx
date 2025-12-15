"use client";

import SafetySection from "@/components/SafetySection";
import CTASection from "@/components/CTASection";
import { animations, colors } from "@/lib/constants";
import { Clock2Icon, RouteIcon, Shield } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "@/hooks/useInView";

export default function Home() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  // Create separate refs for each section
  const heroView = useInView({ threshold: 0.1, rootMargin: "-100px 0px" });
  const introView = useInView({ threshold: 0.2, rootMargin: "-150px 0px" });
  const featuresView = useInView({ threshold: 0.2, rootMargin: "-150px 0px" });
  const safetyView = useInView({ threshold: 0.2, rootMargin: "-100px 0px" });
  const ctaView = useInView({ threshold: 0.2, rootMargin: "-100px 0px" });

  return (
    <div
      className="relative z-10 min-h-screen transition-colors duration-700 ease-in-out dark:bg-transparent"
      style={{ backgroundColor: darkMode ? "transparent" : colors.white }}
    >
      {/* Hero Section */}
      <div
        ref={heroView.ref}
        id="hero-container"
        className="
          relative flex flex-col items-center justify-center h-96 w-full rounded-xl
          sm:h-[500px] md:h-[600px] lg:h-[700px]
          transition-all duration-700 ease-in-out
          dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/30 dark:shadow-lg dark:bg-clip-padding 
        "
        style={{
          ...(darkMode ? {} : { backgroundColor: colors.beige }),
          ...(heroView.isInView
            ? animations.fadeInFloat(0)
            : { opacity: 0, transform: "translateY(20px)" }),
        }}
      >
        <div className="absolute inset-0 z-0 rounded-xl overflow-hidden">
          <Image
            src="/images/hero-image.jpg"
            alt="Arctic landscape"
            fill
            priority
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-black/20 to-black/40 dark:from-black/40 dark:to-black/60 transition-colors duration-700 ease-in-out" />
        </div>
        <div className="absolute top-4 right-4 z-20">
          <img
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 object-contain"
            src="/ukkohalla-safaris-logo-no-bg.png"
            alt="Ukkohalla Safaris Logo"
          />
        </div>

        <div className="relative z-10 text-center px-4 rounded-xl">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: colors.pink }}
          >
            {t("heroTitle")}
          </h1>

          <p
            className="text-lg md:text-2xl mb-6 font-medium drop-shadow-md"
            style={{ color: colors.white }}
          >
            {t("heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div
        ref={introView.ref}
        className="
          mx-auto w-full p-6 text-center mt-20 space-y-2 rounded-xl
          transition-all duration-700 ease-in-out
          dark:bg-white/45 dark:backdrop-blur-xl dark:border dark:border-white/30 dark:shadow-lg dark:bg-clip-padding
        "
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
            : colors.white,
          boxShadow: darkMode
            ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(0, 255, 200, 0.05)"
            : "none",
        }}
      >
        <h1
          className="text-3xl font-bold"
          style={{ color: darkMode ? colors.white : colors.teal }}
        >
          {t("introTitle")}
        </h1>
        <p
          className="mt-4 text-lg"
          style={{ color: darkMode ? colors.white : colors.darkGray }}
        >
          {t("introText1")}
        </p>
        <p
          className="mt-4 text-lg"
          style={{ color: darkMode ? colors.white : colors.darkGray }}
        >
          {t("introText2")}
        </p>
      </div>

      {/* Features Section */}
      <div
        ref={featuresView.ref}
        className="
          container mx-auto px-6 py-8 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center rounded-xl
          transition-all duration-700 ease-in-out
          dark:bg-white/45 dark:backdrop-blur-xl dark:border dark:border-white/30 dark:shadow-lg dark:bg-clip-padding 
        "
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
            : colors.white,
          boxShadow: darkMode
            ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(0, 255, 200, 0.05)"
            : "none",
        }}
      >
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={
            featuresView.isInView
              ? animations.fadeInFloat(200)
              : { opacity: 0, transform: "translateY(20px)" }
          }
        >
          <RouteIcon
            className="h-16 w-16 mt-6"
            style={{ color: colors.teal }}
          />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            {t("professionalGuidance")}
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: darkMode ? colors.white : colors.darkGray }}
          >
            {t("professionalGuidanceDesc")}
          </p>
        </div>
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={
            featuresView.isInView
              ? animations.fadeInFloat(400)
              : { opacity: 0, transform: "translateY(20px)" }
          }
        >
          <Clock2Icon
            className="h-16 w-16 mt-6"
            style={{ color: colors.teal }}
          />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            {t("premiumEquipment")}
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: darkMode ? colors.white : colors.darkGray }}
          >
            {t("premiumEquipmentDesc")}
          </p>
        </div>
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={
            featuresView.isInView
              ? animations.fadeInFloat(600)
              : { opacity: 0, transform: "translateY(20px)" }
          }
        >
          <Shield className="h-16 w-16 mt-6" style={{ color: colors.teal }} />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            {t("unforgettableExperiences")}
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: darkMode ? colors.white : colors.darkGray }}
          >
            {t("unforgettableExperiencesDesc")}
          </p>
        </div>
      </div>

      {/* Additional Sections */}
      <div
        ref={safetyView.ref}
        className="mt-20 transition-all duration-700 ease-in-out"
        style={
          safetyView.isInView
            ? animations.fadeInFloat(0)
            : { opacity: 0, transform: "translateY(20px)" }
        }
      >
        <SafetySection />
      </div>
      <div
        ref={ctaView.ref}
        className="mt-20 transition-all duration-700 ease-in-out"
        style={
          ctaView.isInView
            ? animations.fadeInFloat(0)
            : { opacity: 0, transform: "translateY(20px)" }
        }
      >
        <CTASection />
      </div>
    </div>
  );
}
