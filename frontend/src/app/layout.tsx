import type { Metadata } from "next";
import { siteMetadata } from "@/lib/metadata";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

import { StarryBackground } from "@/components/StarryBackground";
import { DepartureProvider } from "@/context/DepartureContext";

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
  ...siteMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://ukkohallasafaris.fi"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <DepartureProvider>
            <StarryBackground />
            <Navigation />
            <main className="container mx-auto px-6 py-8">
              {children}
              <Footer />
            </main>
            </DepartureProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
