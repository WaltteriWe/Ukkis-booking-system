<<<<<<< HEAD
"use client";

=======
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/constants";
<<<<<<< HEAD
import { useLanguage } from "@/context/LanguageContext";

const Footer = ({ className }: { className?: string }) => {
  const { t } = useLanguage();

=======

const Footer = ({ className }: { className?: string }) => {
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
  return (
    <footer
      className={cn("text-white py-12 my-2 rounded-lg", className)}
      style={{
        background: `linear-gradient(to bottom right, ${colors.teal}, ${colors.navy})`,
      }}
    >
      <div className="container mx-auto px-20 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Ukkis Safaris</h3>
<<<<<<< HEAD
            <p className="text-purple-100 mb-6">{t("companyDescription")}</p>
=======
            <p className="text-purple-100 mb-6">
              Premium Arctic adventures in the heart of Lapland, Finland.
            </p>
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
              <Instagram className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
              <Youtube className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
<<<<<<< HEAD
            <h4 className="text-xl font-semibold mb-4">{t("quickLinks")}</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-purple-100 hover:text-white">
                {t("home")}
=======
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-purple-100 hover:text-white">
                Home
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
              </Link>

              <Link
                href="/bookings"
                className="block text-purple-100 hover:text-white"
              >
<<<<<<< HEAD
                {t("booking")}
=======
                Booking
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
              </Link>
              <Link
                href="/contact"
                className="block text-purple-100 hover:text-white"
              >
<<<<<<< HEAD
                {t("contact")}
=======
                Contact us
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
<<<<<<< HEAD
            <h4 className="text-xl font-semibold mb-4">{t("contact")}</h4>
=======
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-purple-100">
                  Ukkohallantie 5 89400 Hyrynsalmi, Finland
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span className="text-purple-100">+358 40 1306777</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="text-purple-100">info@ukkis.fi</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="border-t mt-8 pt-6 text-center"
          style={{ borderColor: colors.lavender }}
        >
          <p className="text-blue-100">
<<<<<<< HEAD
            &copy; {new Date().getFullYear()} Ukkis Safaris.{" "}
            {t("allRightsReserved")}
=======
            &copy; {new Date().getFullYear()} Ukkis Safaris. All rights
            reserved.
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
