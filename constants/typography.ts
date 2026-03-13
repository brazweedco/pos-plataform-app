// Typography sizes for consistent font scaling
// Usage: fontSize: s(FONT_SIZES.md)

export const FONT_SIZES = {
  // Extra small - badges, captions
  xs: 12,
  // Small - secondary text, labels
  sm: 14,
  // Medium - body text, inputs
  md: 16,
  // Large - emphasized text, buttons
  lg: 18,
  // Extra large - section titles
  xl: 20,
  // 2X large - page titles
  "2xl": 24,
  // 3X large - hero titles
  "3xl": 28,
  // 4X large - large displays
  "4xl": 32,
} as const;

// Component-specific sizes for semantic usage
export const TEXT_SIZES = {
  // Labels
  inputLabel: FONT_SIZES.md,
  buttonLabel: FONT_SIZES.lg,

  // Body
  body: FONT_SIZES.md,
  bodySmall: FONT_SIZES.sm,

  // Headings
  pageTitle: FONT_SIZES["2xl"],
  sectionTitle: FONT_SIZES.lg,
  cardTitle: FONT_SIZES.lg,
  screenHeader: FONT_SIZES.xl,

  // Form
  input: FONT_SIZES.md,
  placeholder: FONT_SIZES.md,
  error: FONT_SIZES.sm,

  // Navigation
  tabLabel: FONT_SIZES.sm,

  // Product
  productName: FONT_SIZES.lg,
  productPrice: FONT_SIZES.lg,
  productSku: FONT_SIZES.sm,

  // Payment/Cart
  totalAmount: FONT_SIZES["2xl"],
  subtotalAmount: FONT_SIZES.lg,
  summaryLabel: FONT_SIZES.md,

  // Misc
  badge: FONT_SIZES.xs,
  emptyState: FONT_SIZES.lg,
  emptyTitle: FONT_SIZES["2xl"],
  emptySubtitle: FONT_SIZES.md,
} as const;

// Input/Button heights
export const INPUT_HEIGHT = 56;
export const BUTTON_HEIGHT = 56;
export const SEARCH_HEIGHT = 54;
export const TAB_HEIGHT = 44;
