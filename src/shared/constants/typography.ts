import { Platform } from "react-native";

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Typography_SalesPage = {
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
    letterSpacing: 2,
  },
} as const;

export const Typography_PurchasesPage = {
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
    letterSpacing: 1.5,
  },
} as const;

export const Typography_BuyPage = Typography_PurchasesPage;

export const Typography_UdharoPage = {
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 30,
    letterSpacing: 1.5,
  },
} as const;

export const Typography_DashboardPage = {
  title: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 1,
  },
} as const;

export const Typography_SettingsPage = {
  title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 1,
  },
} as const;

export const Typography_AiPage = {
  title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 1,
  },
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

export const FontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const LineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const LetterSpacing = {
  tighter: -0.5,
  tight: 0,
  normal: 0.25,
  wide: 1,
  wider: 2,
} as const;
