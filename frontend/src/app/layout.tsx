import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { colors, routes } from "../lib/constants";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ukkis Safaris",
  description: "Explore the beauty of nature with Ukkis Safaris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: colors.lightGray }}
      >
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
