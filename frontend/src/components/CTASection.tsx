"use client";

import Link from "next/link";
import { colors } from "@/lib/constants";
<<<<<<< HEAD
import { useLanguage } from "@/context/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

=======

const CTASection = () => {
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
  return (
    <div
      className="py-20 mt-8 rounded-lg"
      style={{
        background: `linear-gradient(to bottom right, ${colors.teal}, ${colors.navy})`,
      }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
<<<<<<< HEAD
          {t("ctaTitle")}
=======
          Ready for Your Arctic Adventure?
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
        </h2>
        <p
          className="text-xl mb-10 max-w-3xl mx-auto"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
<<<<<<< HEAD
          {t("ctaSubtitle")}
=======
          Join thousands of adventurers who have experienced the magic of
          Lapland with Ukkis Safaris. Book your unforgettable Arctic expedition
          today.
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bookings"
            className="text-white font-bold px-8 py-4 rounded-full text-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: colors.pink }}
          >
<<<<<<< HEAD
            {t("ctaButton")}
=======
            Book Your Adventure
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
          </Link>
          <Link
            href="/categories"
            className="border-2 text-white font-bold px-8 py-4 rounded-full text-lg transition-colors"
            style={{ borderColor: colors.white }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.white;
              e.currentTarget.style.color = colors.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "white";
            }}
          >
<<<<<<< HEAD
            {t("viewAllTours")}
=======
            View All Tours
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
