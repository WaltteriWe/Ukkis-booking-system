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
        className="relative flex flex-col items-center justify-center h-120 w-full bg-background"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home-hero-image4.jpg"
            alt="Arctic landscape"
            fill
            priority
            className="object-cover brightness-75 "
          />
        </div>

        {/* Hero text content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Arctic Adventure Awaits
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Experience the magic of Lapland through premium snowmobile safaris,
            enduro adventures, and ATV expeditions
          </p>
          <Link
            href={routes.categories}
            className={cn(
              "bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-full px-6 py-2 transition-colors text-xl"
            )}
          >
            Explore Tours
          </Link>
        </div>
      </div>

      <div className=" mx-auto w-full p-6 bg-gray-200 text-center">
        <h1
          style={{ color: colors.primary }}
          className="text-3xl font-bold object-center "
        >
          Your gateway to arctic adventures
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Discover the beauty of nature with Ukkis Safaris. We offer a variety
          of tours and adventures that allow you to explore the stunning
          landscapes and wildlife of our region. Whether you're looking for a
          thrilling snowmobile ride, a peaceful nature walk, or a cultural
          experience, we have something for everyone.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Our experienced guides are passionate about sharing their knowledge
          and love for the outdoors. They will ensure that your adventure is
          safe, enjoyable, and unforgettable. Join us for an experience of a
          lifetime!
        </p>
      </div>

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-gray-200">
        <div className="flex flex-col items-center">
          <RouteIcon
            style={{ color: colors.secondary }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2 text-gray-800">Variable routes</h1>
          <p style={{ colorScheme: colors.text }} className="mt-4 text-lg ">
            From 2-hour scenic rides to multi-day expeditions through untouched
            wilderness
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Clock2Icon
            style={{ color: colors.accent }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2 text-gray-800">Flexible durations</h1>
          <p className="mt-4 text-lg text-gray-700">
            Flexible booking options to suit your schedule and preferences
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Shield
            
            className="h-16 w-16 mt-6 items-center text-purple-950"
          />
          <h1 className="font-bold text-xl mt-2 text-gray-800">Safety First</h1>
          <p className="mt-4 text-lg text-gray-700">
            Professional guides, premium equipment, and comprehensive safety
            protocols
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;
