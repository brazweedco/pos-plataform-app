// Design dimensions from Figma
export const DESIGN = {
  WIDTH: 440,
  HEIGHT: 956,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
} as const;

// Colors from design
export const COLORS = {
  // Brand
  primary: "#E46C45",
  primaryDark: "#CF4A22",
  secondary: "#003640",

  // Background
  background: "#FEF9F3",
  backgroundDark: "#E8E0D8",
  surface: "#FFFFFF",
  inputBackground: "#F7F5F3",

  // Text
  text: "#0F2F38",
  textMuted: "#808080",
  textLight: "rgba(0, 36, 48, 0.52)",

  // Border
  border: "rgba(241, 112, 73, 0.16)",
  borderStrong: "rgba(241, 112, 73, 0.25)",
  borderFocused: "#E46C45",
  divider: "rgba(0, 36, 48, 0.15)",

  // Status
  error: "#FF541C",
  success: "#22C55E",
} as const;
