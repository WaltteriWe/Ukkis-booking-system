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
            src="/images/hero-final.jpg"
            alt="Arctic landscape"
            fill
            priority
            className="object-cover brightness-75"
          />
        </div>

        {/* Hero text content */}
        <div className="relative z-10 text-center px-4 rounded-lg">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: colors.pink }}
          >
            Arctic Adventure Awaits
          </h1>
          <p
            className="text-lg md:text-2xl mb-6 "
            style={{ color: colors.teal }}
          >
            Experience the magic of Lapland through premium snowmobile safaris,
            enduro adventures, and ATV expeditions
          </p>
          <Link
            href={routes.categories}
            className={cn(
              "text-white font-medium rounded-full px-6 py-2 transition-colors text-xl"
            )}
            style={{ backgroundColor: colors.pink }}
          >
            Explore Tours
          </Link>
        </div>
      </div>

      <div
        className=" mx-auto w-full p-6 text-center mt-8 space-y-2 rounded-t-lg shadow-md"
        style={{ backgroundColor: colors.lavender }}
      >
        <h1
          style={{ color: colors.teal }}
          className="text-3xl font-bold object-center "
        >
          Your gateway to arctic adventures
        </h1>
        <p className="mt-4 text-lg ">
          Discover the beauty of nature with Ukkis Safaris. We offer a variety
          of tours and adventures that allow you to explore the stunning
          landscapes and wildlife of our region. Whether you&apos;re looking for
          a thrilling snowmobile ride, a peaceful nature walk, or a cultural
          experience, we have something for everyone.
        </p>
        <p className="mt-4 text-lg ">
          Our experienced guides are passionate about sharing their knowledge
          and love for the outdoors. They will ensure that your adventure is
          safe, enjoyable, and unforgettable. Join us for an experience of a
          lifetime!
        </p>
      </div>

      <div
        className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        style={{ backgroundColor: colors.lavender }}
      >
        <div className="flex flex-col items-center">
          <RouteIcon
            style={{ color: colors.amber }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2 text-gray-800">
            Variable routes
          </h1>
          <p style={{ colorScheme: colors.teal }} className="mt-4 text-lg ">
            From 2-hour scenic rides to multi-day expeditions through untouched
            wilderness
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Clock2Icon
            style={{ color: colors.indigo }}
            className="h-16 w-16 mt-6 items-center"
          />
          <h1 className="font-bold text-xl mt-2 text-gray-800">
            Flexible durations
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Flexible booking options to suit your schedule and preferences
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Shield className="h-16 w-16 mt-6 items-center text-purple-950" />
          <h1 className="font-bold text-xl mt-2 text-gray-800">Safety First</h1>
          <p className="mt-4 text-lg text-gray-700">
            Professional guides, premium equipment, and comprehensive safety
            protocols
          </p>
        </div>
      </div>
      <div
        className="container mx-auto px-6 py-12 rounded-b-lg"
        style={{ backgroundColor: colors.lavender }}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Adventure Vehicle
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select from our premium fleet of Arctic vehicles, each designed for
            different types of adventures and skill levels
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            description="Experience the thrill of racing through snow-covered forests and frozen lakes on our premium snowmobiles. Perfect for all skill levels."
            imageSrc="/images/snowmobile.jpg"
            title="Snowmobiles"
            badgeText="Most Popular"
            badgeColor="bg-amber-400"
            features={[
              "Professional safety gear included",
              "Expert guide accompanies all tours",
              "No prior experience required",
            ]}
            buttonText="View Snowmobile Tours"
            buttonColor="bg-amber-400 hover:bg-amber-500"
            buttonHref="/tours/snowmobile"
          />

          <Card
            description="For the ultimate adrenaline rush, tackle challenging Arctic terrain on our specialized winter enduro motorcycles. Year-round adventures await!"
            imageSrc="/images/enduro-bike.jpg"
            title="Enduro Bikes"
            badgeText="Advanced"
            badgeColor="bg-purple-600"
            features={[
              "Specialized winter tires",
              "Advanced safety training",
              "Motorcycle experience required",
            ]}
            buttonText="View Enduro Adventures"
            buttonColor="bg-purple-600 hover:bg-purple-700"
            buttonHref="/tours/enduro"
          />

          <Card
            description="Explore rugged Arctic landscapes with stability and comfort on our all-terrain vehicles, perfect for families and groups."
            imageSrc="/images/atv.jpg"
            title="ATVs"
            badgeText="Family Friendly"
            badgeColor="bg-blue-400"
            features={[
              "Stable and easy to control",
              "Suitable for all ages (16+)",
              "Group-friendly adventures",
            ]}
            buttonText="View ATV Tours"
            buttonColor="bg-blue-400 hover:bg-blue-500"
            buttonHref="/tours/atv"
          />
        </div>
      </div>

      <SafetySection />

      <CTASection />
    </>
  );
}

export default Home;
