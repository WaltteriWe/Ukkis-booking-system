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

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer
      className={cn(
        "bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 my-2",
        className
      )}
    >
      <div className="container mx-auto px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Ukkis Safaris</h3>
            <p className="text-purple-100 mb-6">
              Premium Arctic adventures in the heart of Lapland, Finland.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
              <Instagram className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
              <Youtube className="w-6 h-6 hover:text-amber-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-purple-100 hover:text-white">
                Home
              </Link>
              <Link
                href="/categories"
                className="block text-purple-100 hover:text-white"
              >
                Tour Categories
              </Link>
              <Link
                href="/bookings"
                className="block text-purple-100 hover:text-white"
              >
                Booking
              </Link>
              <Link
                href="/about"
                className="block text-purple-100 hover:text-white"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Tours */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Tours</h4>
            <div className="space-y-2">
              <Link
                href="/tours/snowmobile"
                className="block text-purple-100 hover:text-white"
              >
                Snowmobile Safaris
              </Link>
              <Link
                href="/tours/enduro"
                className="block text-purple-100 hover:text-white"
              >
                Enduro Adventures
              </Link>
              <Link
                href="/tours/atv"
                className="block text-purple-100 hover:text-white"
              >
                ATV Expeditions
              </Link>
              <Link
                href="/tours/multi-day"
                className="block text-purple-100 hover:text-white"
              >
                Multi-Day Tours
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
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
        <div className="border-t border-blue-700 mt-8 pt-6 text-center">
          <p className="text-blue-100">
            &copy; {new Date().getFullYear()} Ukkis Safaris. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
