"use client";

import { useState, useEffect } from "react";
import { getPackages } from "@/lib/api";
import { colors } from "@/lib/constants";

type Tour = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  capacity?: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  active: boolean;
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"safari" | "rental">("safari");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTours() {
      try {
        const response = await getPackages(true);
        setTours(response.items);
      } catch (error) {
        console.error("Failed to load tours:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTours();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <header className="text-white py-12" style={{ backgroundColor: colors.navy }}>
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Book Your Adventure</h1>
          <p className="text-lg text-gray-300">
            Choose between guided safaris or rent a snowmobile for your private trip
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b-2" style={{ borderColor: colors.teal }}>
          <button
            onClick={() => setActiveTab("safari")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "safari"
                ? "border-b-4"
                : "hover:opacity-80"
            }`}
            style={{
              color: activeTab === "safari" ? colors.navy : colors.darkGray,
              borderColor: activeTab === "safari" ? colors.teal : "transparent",
            }}
          >
            Safari Tours
          </button>
          <button
            onClick={() => setActiveTab("rental")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "rental"
                ? "border-b-4"
                : "hover:opacity-80"
            }`}
            style={{
              color: activeTab === "rental" ? colors.navy : colors.darkGray,
              borderColor: activeTab === "rental" ? colors.teal : "transparent",
            }}
          >
            Snowmobile Rental
          </button>
        </div>

        {/* Safari Tours Tab */}
        {activeTab === "safari" && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p style={{ color: colors.darkGray }}>Loading tours...</p>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: colors.darkGray }}>No tours available at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    style={{ backgroundColor: colors.white }}
                  >
                    {tour.imageUrl && (
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={tour.imageUrl}
                          alt={tour.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-medium px-3 py-1 rounded-full"
                          style={{ color: colors.navy, backgroundColor: `${colors.teal}20` }}
                        >
                          {tour.difficulty}
                        </span>
                        <span className="text-sm" style={{ color: colors.darkGray }}>
                          {tour.durationMin} min
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: colors.navy }}>
                        {tour.name}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.darkGray }}>
                        {tour.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: colors.teal }}>
                          €{tour.basePrice}
                        </span>
                        <a
                          href={`/book/${tour.slug}`}
                          className="px-6 py-2 rounded-md text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: colors.navy }}
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Snowmobile Rental Tab */}
        {activeTab === "rental" && (
          <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: colors.white }}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.navy }}>
                Rent a Snowmobile for Your Private Adventure
              </h2>
              <p className="mb-6" style={{ color: colors.darkGray }}>
                Explore the Arctic wilderness at your own pace. Our snowmobiles are perfect for
                experienced riders who want the freedom to create their own adventure.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg
                      className="w-6 h-6"
                      style={{ color: colors.teal }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>
                      Flexible Duration
                    </h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>
                      Rent by the hour - perfect for short trips or full-day adventures
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg
                      className="w-6 h-6"
                      style={{ color: colors.teal }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>
                      Quality Equipment
                    </h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>
                      Well-maintained modern snowmobiles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg
                      className="w-6 h-6"
                      style={{ color: colors.teal }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>
                      From €50/hour
                    </h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>
                      Competitive pricing for premium snowmobiles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.teal}20` }}>
                    <svg
                      className="w-6 h-6"
                      style={{ color: colors.teal }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: colors.navy }}>
                      Safety First
                    </h3>
                    <p className="text-sm" style={{ color: colors.darkGray }}>
                      All necessary safety gear included
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="border-l-4 p-4 mb-8"
                style={{ backgroundColor: `${colors.pink}20`, borderColor: colors.pink }}
              >
                <p className="text-sm" style={{ color: colors.darkGray }}>
                  <strong>Note:</strong> Valid driver's license required. Experience with
                  snowmobiles recommended.
                </p>
              </div>

              <a
                href="/snowmobile-rental"
                className="inline-block px-8 py-3 rounded-md text-white transition-opacity hover:opacity-90 font-semibold text-lg"
                style={{ backgroundColor: colors.navy }}
              >
                Check Availability & Book
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
