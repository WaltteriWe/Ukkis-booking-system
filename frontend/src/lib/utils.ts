import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to get hover props without using a hook (for inline usage)
 * Works in both Server and Client Components
 * @param defaultColor - The default color when not hovering
 * @param hoverColor - The color to show on hover
 * @returns Object with event handlers and base style
 */
export function getHoverColorProps(defaultColor: string, hoverColor: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = hoverColor;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = defaultColor;
    },
    className: "transition-colors duration-300",
    style: { color: defaultColor },
  };
}
