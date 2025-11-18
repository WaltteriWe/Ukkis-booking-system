"use client";

import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn, getHoverColorProps } from "@/lib/utils";
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
          <Link href={routes.home} className={cn("flex items-center")}>
            <Image
              src="/images/ukkohalla-safaris-logo-no-bg.png"
              alt="Ukkis Safaris Logo"
              width={80}
              height={50}
              priority
              className="object-contain"
            />
          </Link>

          {/* Nav Links */}
          <div className={cn("hidden md:flex items-center space-x-5 text-xl")}>
            <Link href={routes.home} {...getHoverColorProps(colors.navy, colors.pink)}>
              Home
            </Link>
            <Link
              href={routes.bookings + "?tab=safari"}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Safari Tours
            </Link>
            <Link
              href={routes.bookings + "?tab=rental"}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Snowmobile Rental
            </Link>
            <Link href={routes.contact} {...getHoverColorProps(colors.navy, colors.pink)}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
