// src/lib/routes.ts

export const routes = {
  home: "/",
  categories: "/categories",
  bookings: "/bookings",
  contact: "/contact",
  admin: "/admin",
  //TODO: add other routes here if needed
};

export const colors = {
  // Blues/Navy
  darkBlue: "#1E3A8A", // Indigo-900 (formerly primary)
  indigo: "#4F46E5", // Indigo-600 (formerly accent)
  navy: "#2C3E50", // Deeper navy for better readability

  // Pinks/Purples
  pink: "#E5789F", // Rose pink for CTAs
  lavender: "#C8A8C8", // Light lavender (deprecated - use white instead)

  // Warm tones
  beige: "#FAF8F5", // Very light cream for subtle warmth
  amber: "#FBBF24", // Amber-400 (formerly secondary)
  orange: "#F59E0B", // Amber-500/Orange (formerly buttonColor)

  // Accent
  teal: "#2D9B9B", // Deeper teal for better contrast

  // Neutrals for clean design
  white: "#FFFFFF", // Pure white
  lightGray: "#F8F9FA", // Very light gray for sections
  darkGray: "#333333", // Dark gray for body text
  charcoal: "#1A1A1A", // Optional dark theme

   // Dark theme
  nightSky: "#0B1024", // deep midnight blue
  starGlow: "#FFFFFF", // stars
  translucentWhite: "rgba(255,255,255,0.85)", // see-through text
  translucentDark: "rgba(26,26,26,0.85)", // see-through panels
};

export const animations = {
  fadeInFloat: (delay: number = 0) => ({
    animation: 'fadeInFloat 0.8s ease-out forwards',
    animationDelay: `${delay}ms`,
  }),
}


