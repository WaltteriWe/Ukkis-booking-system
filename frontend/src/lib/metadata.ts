import { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Ukkohalla Safaris - Arctic Adventure Tours & Snowmobile Rentals",
  description:
    "Experience thrilling safari tours and snowmobile rentals in Finnish Lapland. Book your Arctic adventure with Ukkohalla Safaris today.",
  keywords:
    "safari, snowmobile rental, Lapland, Finland, Arctic tours, winter activities, lapland safari, snowmobile safari, outdoor adventures, nature tours, guided tours, guided tours lapland, northern lights, snow, ice, winter, winter holiday locations, family activities, adventure travel",
  metadataBase: new URL("https://ukkohallasafaris.fi"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ukkohallasafaris.fi",
    siteName: "Ukkohalla Safaris",
    title: "Ukkohalla Safaris - Arctic Adventure Tours",
    description:
      "Experience thrilling safari tours and snowmobile rentals in Finnish Lapland.",
    images: [
      {
        url: "https://ukkohallasafaris.fi/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukkohalla Safaris",
    description: "Arctic Adventure Tours & Snowmobile Rentals",
  },
  robots: "index, follow",
};

export const canonicalUrl = "https://ukkohallasafaris.fi";

export const pageMetadata = {
  home: {
    title: "Home - Ukkohalla Safaris",
    description: "Discover Arctic adventures with Ukkohalla Safaris",
  },
  bookings: {
    title: "Book Safari Tours - Ukkohalla Safaris",
    description: "Reserve your safari tour in Finnish Lapland",
  },
  rentals: {
    title: "Snowmobile Rental - Ukkohalla Safaris",
    description: "Rent a snowmobile for your Arctic adventure",
  },
  contact: {
    title: "Contact Us - Ukkohalla Safaris",
    description: "Get in touch with Ukkohalla Safaris for inquiries",
  },
};