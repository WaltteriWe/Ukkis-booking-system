"use client";

import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn, getHoverColorProps } from "@/lib/utils";
import { Search } from "lucide-react";
import Image from "next/image";

export function Navigation() {
  return (
    <nav
      className={cn(" py-4 px-3 shadow-md")}
      style={{ backgroundColor: colors.white }}
    >
      <div className={cn("container mx-auto flex items-left justify-between")}>
        {/* Left side: Logo + Nav Links */}
        <div className={cn("flex items-center space-x-8")}>
          {/* Logo */}
          <Link
            href={routes.home}
            className={cn("flex items-center")}
          >
            <Image
              src="/images/logo.jpg"
              alt="Ukkis Safaris Logo"
              width={80}
              height={50}
              priority
              className="object-contain"
            />
          </Link>

          {/* Nav Links */}
          <div className={cn("hidden md:flex items-center space-x-5 text-xl")}>
            <Link
              href={routes.home}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Home
            </Link>
            <Link
              href={routes.bookings}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Booking
            </Link>
            <Link
              href={routes.contact}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right side: Search and Book Now */}
        <div className={cn("flex items-center space-x-4")}>
          <button aria-label="Search" style={{ color: colors.navy }}>
            <Search className="h-7 w-7" />
          </button>
          <Link
            href={routes.bookings}
            className={cn(
              " text-white font-medium rounded-full px-6 py-2 transition-colors text-xl hover:opacity-90"
            )}
            style={{ backgroundColor: colors.pink }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
