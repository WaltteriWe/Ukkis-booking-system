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
  alternates: {
    canonical: "https://ukkohallasafaris.fi/",
  },
  // Authors and creator info
  authors: [{ name: "Ukkohalla Safaris" }],
  creator: "Ukkohalla Safaris",
  publisher: "Ukkohalla Safaris",
  // Category
  category: "Tourism & Travel",
};


export const canonicalUrl = "https://ukkohallasafaris.fi";

export const pageMetadata = {
  home: {
    title: "Ukkohalla Safaris - Snowmobile Tours & Rentals in Hyrynsalmi, Finland",
    description: "Experience authentic Arctic snowmobile adventures in Ukkohalla. Guided tours, rentals, and northern lights safaris. Book your Finnish Lapland winter adventure today!",
    keywords: "Ukkohalla snowmobile, Hyrynsalmi safaris, Ukkohalla safaris, Snowmobile tours finland, Arctic tours Finland, winter activities",
  },
  bookings: {
    title: "Book Snowmobile Safari Tours - Ukkohalla Safaris",
    description: "Reserve your guided snowmobile safari in Ukkohalla, Hyrynsalmi. Choose from northern lights tours, family adventures, and customized Arctic experiences.",
    keywords: "book snowmobile tour, safari booking Finland, Ukkohalla reservations, guided snowmobile tours",
  },
  rentals: {
    title: "Snowmobile Rental - Ukkohalla Safaris | Moottorikelkka Vuokraus",
    description: "Rent quality snowmobiles in Ukkohalla, Hyrynsalmi. Hourly and daily rentals available. All equipment included. Perfect for exploring Finnish Lapland wilderness.",
    keywords: "snowmobile rental Finland, moottorikelkka vuokraus, Ukkohalla rental, Arctic equipment rental",
  },
  contact: {
    title: "Contact Ukkohalla Safaris - Book Tours & Rentals",
    description: "Contact Ukkohalla Safaris for bookings, inquiries, and customized Arctic adventures. Located in Hyrynsalmi, Finland. Available in English and Finnish.",
    keywords: "contact Ukkohalla Safaris, book snowmobile tour, safari inquiries Finland",
  },
};