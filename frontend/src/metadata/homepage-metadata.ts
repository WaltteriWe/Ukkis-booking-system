import { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  openGraph: {
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    type: "website",
    url: "https://ukkohallasafaris.fi",
  },
};