/**
 * Font family constants for Foundry Context font
 *
 * Usage in Figma:
 * - FoundryContextW03-Regular → Regular text, placeholders, body
 * - FoundryContextW03-Md (Medium) → Product names, tab labels, medium weight
 * - FoundryContextW03-Demi → Titles, button text, semi-bold weight
 * - FoundryContextW03-Bd (Bold) → Prices, emphasized text
 *
 * Note: We only have Regular, Demi, and Bold variants in assets.
 * Medium text should use Regular or Demi based on context.
 */

export const FONTS = {
  /** Regular weight - for body text, placeholders, descriptions */
  regular: "FoundryContextW03-Regular",

  /** Medium weight - maps to Demi for product names, labels */
  medium: "FoundryContextW03-Demi",

  /** Semi-bold weight - for titles, button text, headers */
  semiBold: "FoundryContextW03-Demi",

  /** Bold weight - for prices, emphasized text */
  bold: "FoundryContextW03-Bold",

  /** Extra Bold weight - for extra emphasis */
  extraBold: "FoundryContextW03-ExtraBold",
} as const;

export type FontFamily = (typeof FONTS)[keyof typeof FONTS];
