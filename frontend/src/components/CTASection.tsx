"use client";

import Link from "next/link";
import { colors } from "@/lib/constants";

const CTASection = () => {
  return (
    <div
      className="py-20 mt-8"
      style={{
        background: `linear-gradient(to bottom right, ${colors.lavender}, ${colors.pink}, #FF6B35)`,
      }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready for Your Arctic Adventure?
        </h2>
        <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
          Join thousands of adventurers who have experienced the magic of
          Lapland with Ukkis Safaris. Book your unforgettable Arctic expedition
          today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bookings"
            className="text-white font-bold px-8 py-4 rounded-full text-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: colors.teal }}
          >
            Book Your Adventure
          </Link>
          <Link
            href="/categories"
            className="border-2 text-white hover:bg-teal font-bold px-8 py-4 rounded-full text-lg transition-colors"
            style={{ borderColor: colors.teal, color: "white" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.lavender;
              e.currentTarget.style.color = colors.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.teal;
              e.currentTarget.style.color = "white";
            }}
          >
            View All Tours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
