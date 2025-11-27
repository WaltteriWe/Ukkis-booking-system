"use client";

<<<<<<< HEAD
=======
import { useState, useEffect } from "react";
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
import Link from "next/link";
import { colors, routes } from "@/lib/constants";
import { cn, getHoverColorProps } from "@/lib/utils";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
<<<<<<< HEAD
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [darkMode] = useState(false);
  const { t } = useLanguage();
=======
import { Menu, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useTheme } from "@/context/ThemeContext";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { darkMode } = useTheme();
  const t = useTranslations('nav');

  useEffect(() => {
    setMounted(true);
  }, []);
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

<<<<<<< HEAD
  return (
    <nav
      className={cn(" py-4 px-3 shadow-md")}
      style={{ backgroundColor: colors.white }}
    >
      <div
        className={cn("container mx-auto flex items-center justify-between")}
      >
=======
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className={cn("py-4 px-3 shadow-md")} style={{ backgroundColor: colors.white }}>
        <div className={cn("container mx-auto flex items-center justify-between")}>
          <div className="h-12" />
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn("py-4 px-3 shadow-md")} style={{ backgroundColor: colors.white }}>
      <div className={cn("container mx-auto flex items-center justify-between")}>
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
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
<<<<<<< HEAD
            <Link
              href={routes.home}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              {t("home")}
            </Link>
            <Link
              href={routes.bookings + "?tab=safari"}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              {t("safariTours")}
            </Link>
            <Link
              href={routes.bookings + "?tab=rental"}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              {t("snowmobileRental")}
            </Link>
            <Link
              href={routes.contact}
              {...getHoverColorProps(colors.navy, colors.pink)}
            >
              {t("contactUs")}
            </Link>
          </div>
        </div>
        {/* Right side: Language Toggle and Theme Toggle (desktop only) */}
        <div className={cn("hidden md:flex items-center space-x-4")}>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Hamburger Menu (includes mobile LanguageToggle and ThemeToggle) */}
        <div className="md:hidden flex items-center">
          <LanguageToggle />
=======
            <Link href={routes.home} {...getHoverColorProps(colors.navy, colors.pink)} className="inline-block">
              {t('home')}
            </Link>
            <Link href={routes.bookings + "?tab=safari"} {...getHoverColorProps(colors.navy, colors.pink)} className="inline-block">
              {t('safariTours')}
            </Link>
            <Link href={routes.bookings + "?tab=rental"} {...getHoverColorProps(colors.navy, colors.pink)} className="inline-block">
              {t('snowmobileRental')}
            </Link>
            <Link href={routes.contact} {...getHoverColorProps(colors.navy, colors.pink)} className="inline-block">
              {t('contactUs')}
            </Link>
          </div>
        </div>
        {/* Right side: Theme Toggle (desktop only) */}
        <div className={cn("hidden md:flex items-center space-x-4")}>
          <ThemeToggle />
        </div>

        {/* Mobile Hamburger Menu (includes mobile ThemeToggle) */}
        <div className="md:hidden flex items-center">
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
          <ThemeToggle />
          <button
            aria-label="Toggle Menu"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className={cn("ml-3 p-2 rounded-md")}
            style={{
<<<<<<< HEAD
              ...(darkMode
                ? { backgroundColor: colors.navy }
                : { backgroundColor: colors.pink }),
=======
              backgroundColor: darkMode ? colors.navy : colors.pink,
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
            }}
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
<<<<<<< HEAD
            )}{" "}
=======
            )}
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
          </button>
        </div>
      </div>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
<<<<<<< HEAD
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
=======
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
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
<<<<<<< HEAD
            <Link
              href={routes.home}
              className="text-lg font-semibold text-navy dark:text-white"
            >
              Ukkohalla Safaris and Adventures
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2"
            >
=======
            <Link href={routes.home} className="text-lg font-semibold text-navy dark:text-white">
              Ukkohalla Safaris and Adventures
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
              <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          <nav className="mt-6 space-y-4">
<<<<<<< HEAD
            <Link
              href={routes.home}
              onClick={() => setOpen(false)}
              {...getHoverColorProps(colors.navy, colors.pink)}
              className="block text-lg"
            >
              {t("home")}
            </Link>
            <Link
              href={routes.bookings + "?tab=safari"}
              onClick={() => setOpen(false)}
              {...getHoverColorProps(colors.navy, colors.pink)}
              className="block text-lg"
            >
              {t("safariTours")}
            </Link>
            <Link
              href={routes.bookings + "?tab=rental"}
              onClick={() => setOpen(false)}
              {...getHoverColorProps(colors.navy, colors.pink)}
              className="block text-lg"
            >
              {t("snowmobileRental")}
            </Link>
            <Link
              href={routes.contact}
              onClick={() => setOpen(false)}
              {...getHoverColorProps(colors.navy, colors.pink)}
              className="block text-lg"
            >
              {t("contactUs")}
=======
            <Link href={routes.home} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              {t('home')}
            </Link>
            <Link href={routes.bookings + "?tab=safari"} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              {t('safariTours')}
            </Link>
            <Link href={routes.bookings + "?tab=rental"} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              {t('snowmobileRental')}
            </Link>
            <Link href={routes.contact} onClick={() => setOpen(false)} {...getHoverColorProps(colors.navy, colors.pink)} className="block text-lg">
              {t('contactUs')}
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
