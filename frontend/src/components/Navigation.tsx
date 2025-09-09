import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export function Navigation() {
  return (
    <nav className={cn("bg-white py-4 px-3 shadow-sm")}>
      <div className={cn("container mx-auto flex items-left justify-between")}>
        {/* Left side: Logo + Nav Links */}
        <div className={cn("flex items-center space-x-8")}>
          {/* Logo */}
          <Link href={routes.home} style={{ color: colors.primary }} className={cn("text-3xl font-bold")}>
            Ukkis Safaris
          </Link>

          {/* Nav Links */}
          <div className={cn("hidden md:flex items-center space-x-5 text-xl")}>
            <Link href={routes.home} className={cn("text-gray-700 hover:text-gray-900")}>
              Home
            </Link>
            <Link href={routes.categories} className={cn("text-gray-700 hover:text-gray-900")}>
              Tour Categories
            </Link>
            <Link href={routes.bookings} className={cn("text-gray-700 hover:text-gray-900")}>
              Booking
            </Link>
            <Link href={routes.contact} className={cn("text-gray-700 hover:text-gray-900")}>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right side: Search and Book Now */}
        <div className={cn("flex items-center space-x-4")}>
          <button aria-label="Search" className={cn("text-gray-700")}>
            <Search className="h-7 w-7" />
          </button>
          <Link 
            href={routes.bookings}
            className={cn("bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-full px-6 py-2 transition-colors text-xl")}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}