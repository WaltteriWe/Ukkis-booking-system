export const darkModeStyles = {
  bgPrimary: (isDark: boolean) => (isDark ? "#0f172a" : "#ffffff"),
  bgSecondary: (isDark: boolean) => (isDark ? "#1e293b" : "#f9fafb"),
  textPrimary: (isDark: boolean) => (isDark ? "#f1f5f9" : "#101651"),
  textSecondary: (isDark: boolean) => (isDark ? "#cbd5e1" : "#3b4463"),
  border: (isDark: boolean) => (isDark ? "#334155" : "#e5e7eb"),
  inputBg: (isDark: boolean) => (isDark ? "#1e293b" : "#ffffff"),
  inputBorder: (isDark: boolean) => (isDark ? "#475569" : "#d1d5db"),
  accent: (isDark: boolean) => (isDark ? "#10b981" : "#ffb64d"),
  hoverBg: (isDark: boolean) => (isDark ? "#334155" : "#f3f4f6"),
  cardBg: (isDark: boolean) => (isDark ? "#1e293b" : "#ffffff"),
  shadowColor: (isDark: boolean) =>
    isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)",
};

export const colors = {
  beige: "#f7fbf9",
  primary: "#101651",
  secondary: "#3b4463",
  accent: "#ffb64d",
  orange: "#ff8c3a",
};
