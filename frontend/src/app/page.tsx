import Card from "@/components/Card";
import SafetySection from "@/components/SafetySection";
import CTASection from "@/components/CTASection";
import { routes } from "@/lib/constants";
import { colors } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Clock2Icon, RouteIcon, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Home() {
  return (
    <>
      <div
        id="hero-container"
        className="relative flex flex-col items-center justify-center h-120 w-full rounded-lg"
        style={{ backgroundColor: colors.beige }}
      >
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
          <Image
            src="/images/hero-image.jpg"
            alt="Arctic landscape"
            fill
            priority
            className="object-cover brightness-75"
          />
          {/* Dark gradient overlay for better text contrast */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        {/* Hero text content */}
        <div className="relative z-10 text-center px-4 rounded-lg">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
            style={{ color: colors.pink }}
          >
            Arctic Adventure Awaits
          </h1>
          <p
            className="text-lg md:text-2xl mb-6 font-medium drop-shadow-md"
            style={{ color: colors.white }}
          >
            Experience the magic of Lapland through premium snowmobile safaris,
            enduro adventures, and ATV expeditions
          </p>
          
        </div>
      </div>

      <div
        className=" mx-auto w-full p-6 text-center mt-8 space-y-2 rounded-t-lg shadow-md"
        style={{ backgroundColor: colors.white }}
      >
        <h1
          style={{ color: colors.teal }}
          className="text-3xl font-bold object-center "
        >
          Your gateway to arctic adventures
        </h1>
        <p className="mt-4 text-lg" style={{ color: colors.darkGray }}>
          Discover the beauty of nature with Ukkis Safaris. We offer a variety
          of tours and adventures that allow you to explore the stunning
          landscapes and wildlife of our region. Whether you&apos;re looking for
          a thrilling snowmobile ride, a peaceful nature walk, or a cultural
          experience, we have something for everyone.
        </p>
        <p className="mt-4 text-lg" style={{ color: colors.darkGray }}>
          Our experienced guides are passionate about sharing their knowledge
          and love for the outdoors. They will ensure that your adventure is
          safe, enjoyable, and unforgettable. Join us for an experience of a
          lifetime!
        </p>
      </div>

      <div
        className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        style={{ backgroundColor: colors.white }}
      >
        <div className="flex flex-col items-center">
          <RouteIcon
            style={{ color: colors.teal }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2" style={{ color: colors.navy }}>
            Variable routes
          </h1>
          <p className="mt-4 text-lg" style={{ color: colors.darkGray }}>
            From 2-hour scenic rides to multi-day expeditions through untouched
            wilderness
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Clock2Icon
            style={{ color: colors.teal }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2" style={{ color: colors.navy }}>
            Flexible durations
          </h1>
          <p className="mt-4 text-lg" style={{ color: colors.darkGray }}>
            Flexible booking options to suit your schedule and preferences
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Shield
            className="h-16 w-16 mt-6 items-center"
            style={{ color: colors.teal }}
          />
          <h1 className="font-bold text-xl mt-2" style={{ color: colors.navy }}>
            Safety First
          </h1>
          <p className="mt-4 text-lg" style={{ color: colors.darkGray }}>
            Professional guides, premium equipment, and comprehensive safety
            protocols
          </p>
        </div>
      </div>
      <div
        className="container mx-auto px-6 py-12 rounded-b-lg"
        style={{ backgroundColor: colors.white }}
      ></div>

      <SafetySection />

      <CTASection />
    </>
  );
}

export default Home;
