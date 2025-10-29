"use client";

import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn, getHoverColorProps } from "@/lib/utils";
import { Search } from "lucide-react";

export function Navigation() {
  return (
    <nav
      className={cn(" py-4 px-3 shadow-sm")}
      style={{ backgroundColor: colors.background }}
    >
      <div className={cn("container mx-auto flex items-left justify-between")}>
        {/* Left side: Logo + Nav Links */}
        <div className={cn("flex items-center space-x-8")}>
          {/* Logo */}
          <Link
            href={routes.home}
            style={{ color: colors.title }}
            className={cn("text-3xl font-bold")}
          >
            Ukkis Safaris
          </Link>

          {/* Nav Links */}
          <div className={cn("hidden md:flex items-center space-x-5 text-xl")}>
            <Link
              href={routes.home}
              {...getHoverColorProps(colors.navLink, colors.title)}
            >
              Home
            </Link>
            <Link
              href={routes.categories}
              {...getHoverColorProps(colors.navLink, colors.title)}
            >
              Tour Categories
            </Link>
            <Link
              href={routes.bookings}
              {...getHoverColorProps(colors.navLink, colors.title)}
            >
              Booking
            </Link>
            <Link
              href={routes.contact}
              {...getHoverColorProps(colors.navLink, colors.title)}
            >
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
            className={cn(
              " text-white font-medium rounded-full px-6 py-2 transition-colors text-xl"
            )}
            style={{ backgroundColor: colors.title }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
