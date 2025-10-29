"use client";

import { useState } from "react";

/**
 * Custom hook for hover color transitions
 * @param defaultColor - The default color when not hovering
 * @param hoverColor - The color to show on hover
 * @returns Object with color, mouse event handlers, and className
 */
export function useHoverColor(defaultColor: string, hoverColor: string) {
  const [isHovered, setIsHovered] = useState(false);

  return {
    style: { color: isHovered ? hoverColor : defaultColor },
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: "transition-colors duration-300",
  };
}
