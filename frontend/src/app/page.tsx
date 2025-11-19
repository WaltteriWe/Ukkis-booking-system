"use client";

import SafetySection from "@/components/SafetySection";
import CTASection from "@/components/CTASection";
import { animations, colors } from "@/lib/constants";
import { Clock2Icon, RouteIcon, Shield } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";

export default function Home() {
  const { darkMode } = useTheme();
  
  // Create separate refs for each section
  const heroView = useInView({ threshold: 0.1, rootMargin: '-100px 0px' });
  const introView = useInView({ threshold: 0.2, rootMargin: '-150px 0px' });
  const featuresView = useInView({ threshold: 0.2, rootMargin: '-150px 0px' });
  const safetyView = useInView({ threshold: 0.2, rootMargin: '-100px 0px' });
  const ctaView = useInView({ threshold: 0.2, rootMargin: '-100px 0px' });

  return (
    <div
      className="relative z-10 min-h-screen transition-colors duration-700 ease-in-out dark:bg-transparent"
      style={{ backgroundColor: darkMode ? 'transparent' : colors.white }}
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
          ...(heroView.isInView ? animations.fadeInFloat(0) : { opacity: 0, transform: 'translateY(20px)' }),
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

        <div className="relative z-10 text-center px-4 rounded-xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: colors.pink }}>
            Arctic Adventure Awaits
          </h1>
          <p className="text-lg md:text-2xl mb-6 font-medium drop-shadow-md" style={{ color: colors.white }}>
            Experience the magic of Lapland through premium snowmobile safaris or personal adventures with our wide range of vehicles and expert guides.
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
          ...(darkMode ? {} : { backgroundColor: colors.white }),
          ...(introView.isInView ? animations.fadeInFloat(0) : { opacity: 0, transform: 'translateY(20px)' }),
        }}
      >
        <h1 className="text-3xl font-bold" style={{ color: darkMode ? colors.white : colors.teal }}>
          Your gateway to arctic adventures
        </h1>
        <p className="mt-4 text-lg" style={{ color: darkMode ? colors.white : colors.darkGray }}>
          Discover the beauty of nature with Ukkis Safaris. We offer a variety
          of tours and adventures that allow you to explore the stunning
          landscapes and wildlife of our region.
        </p>
        <p className="mt-4 text-lg" style={{ color: darkMode ? colors.white : colors.darkGray }}>
          Our experienced guides are passionate about sharing their knowledge
          and love for the outdoors. They will ensure that your adventure is
          safe, enjoyable, and unforgettable.
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
          ...(darkMode ? {} : { backgroundColor: colors.white }),
          ...(featuresView.isInView ? {} : { opacity: 0 }),
        }}
      >
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={featuresView.isInView ? animations.fadeInFloat(200) : { opacity: 0, transform: 'translateY(20px)' }}
        >
          <RouteIcon
            className="h-16 w-16 mt-6"
            style={{ color: colors.teal }}
          />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            Variable routes
          </h1>
          <p className="mt-4 text-lg" style={{ color: darkMode ? colors.white : colors.darkGray }}>
            From 2-hour scenic rides to multi-day expeditions through
            untouched wilderness
          </p>
        </div>
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={featuresView.isInView ? animations.fadeInFloat(400) : { opacity: 0, transform: 'translateY(20px)' }}
        >
          <Clock2Icon
            className="h-16 w-16 mt-6"
            style={{ color: colors.teal }}
          />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            Flexible durations
          </h1>
          <p className="mt-4 text-lg" style={{ color: darkMode ? colors.white : colors.darkGray }}>
            Flexible booking options to suit your schedule and preferences
          </p>
        </div>
        <div
          className="flex flex-col items-center transition-all duration-700 ease-in-out"
          style={featuresView.isInView ? animations.fadeInFloat(600) : { opacity: 0, transform: 'translateY(20px)' }}
        >
          <Shield className="h-16 w-16 mt-6" style={{ color: colors.teal }} />
          <h1
            className="font-bold text-xl mt-2"
            style={{ color: darkMode ? colors.white : colors.navy }}
          >
            Safety First
          </h1>
          <p className="mt-4 text-lg" style={{ color: darkMode ? colors.white : colors.darkGray }}>
            Professional guides, premium equipment, and comprehensive safety
            protocols
          </p>
        </div>
      </div>

      {/* Additional Sections */}
      <div 
        ref={safetyView.ref}
        className="mt-20 transition-all duration-700 ease-in-out"
        style={safetyView.isInView ? animations.fadeInFloat(0) : { opacity: 0, transform: 'translateY(20px)' }}
      >
        <SafetySection />
      </div>
      <div 
        ref={ctaView.ref}
        className="mt-20 transition-all duration-700 ease-in-out"
        style={ctaView.isInView ? animations.fadeInFloat(0) : { opacity: 0, transform: 'translateY(20px)' }}
      >
        <CTASection />
      </div>
    </div>
  );
}