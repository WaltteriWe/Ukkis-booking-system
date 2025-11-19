"use client";

import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn, getHoverColorProps } from "@/lib/utils";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [darkMode] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      className={cn(" py-4 px-3 shadow-md")}
      style={{ backgroundColor: colors.white }}
    >
      <div
        className={cn("container mx-auto flex items-center justify-between")}
      >
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
            <Link
              href={routes.home}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
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
            <Link
              href={routes.contact}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              Contact Us
            </Link>
          </div>
        </div>
        {/* Right side: Theme Toggle (desktop only) */}
        <div className={cn("hidden md:flex items-center space-x-4")}>
          <ThemeToggle />
        </div>

        {/* Mobile Hamburger Menu (includes mobile ThemeToggle) */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button
            aria-label="Toggle Menu"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className={cn("ml-3 p-2 rounded-md")}
            style={{
              ...(darkMode
                ? { backgroundColor: colors.navy }
                : { backgroundColor: colors.pink }),
            }}
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}{" "}
          </button>
        </div>
      </div>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transform bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300",
          open ? "translate-y-0" : "-translate-y-full"
        )}
        style={{ willChange: "transform" }}
      >
        <div className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <Link href={routes.home} className="text-lg font-semibold text-navy dark:text-white">
              Ukkohalla Safaris and Adventures
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
              <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          <nav className="mt-6 space-y-4">
            <Link href={routes.home} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              Home
            </Link>
            <Link href={routes.bookings + "?tab=safari"} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              Safari Tours
            </Link>
            <Link href={routes.bookings + "?tab=rental"} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              Snowmobile Rental
            </Link>
            <Link href={routes.contact} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}

