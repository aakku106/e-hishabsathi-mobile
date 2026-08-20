type PageColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  onPrimary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBG: string;
  success: string;
  danger: string;
  warning: string;
};

const basePage = {
  surface: "#FFFFFF",
  onPrimary: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  inputBG: "#FFFFFF",
  success: "#059669",
  danger: "#DC2626",
  warning: "#D97706",
} as const;

export const Colors_SalesPage: PageColors = {
  ...basePage,
  background: "#F4FAF7",
  surfaceAlt: "#E9F7F0",
  primary: "#10B981",
  primaryDeep: "#047857",
  primarySoft: "#D1FAE5",
};

export const Colors_PurchasesPage: PageColors = {
  ...basePage,
  background: "#FFF9F4",
  surfaceAlt: "#FFF0E5",
  primary: "#FF5A00",
  primaryDeep: "#FF4D00",
  primarySoft: "#FFE0CC",
};

export const Colors_UdharoPage: PageColors = {
  ...basePage,
  background: "#FDF5F6",
  surfaceAlt: "#FDE8EC",
  primary: "#F43F5E",
  primaryDeep: "#BE123C",
  primarySoft: "#FECDD3",
};

export const Colors_DashboardPage: PageColors & {
  greenPrimary: string;
  redPrimary: string;
  heroTop: string;
  heroBottom: string;
} = {
  ...basePage,
  background: "#F6F7FB",
  surfaceAlt: "#EEF0F6",
  primary: "#6366F1",
  primaryDeep: "#4338CA",
  primarySoft: "#E0E7FF",
  greenPrimary: "#059669",
  redPrimary: "#DC2626",
  heroTop: "#0F172A",
  heroBottom: "#1E293B",
};

export const Colors_SettingsPage: PageColors = {
  ...basePage,
  background: "#F5F8FD",
  surfaceAlt: "#E9F0FB",
  primary: "#3B82F6",
  primaryDeep: "#1D4ED8",
  primarySoft: "#DBEAFE",
};

export const Colors_AiPage: PageColors = {
  ...basePage,
  background: "#FAF6FD",
  surfaceAlt: "#F3E8FF",
  primary: "#A855F7",
  primaryDeep: "#7E22CE",
  primarySoft: "#EDE9FE",
};

export const Colors_InventoryPage: PageColors = {
  ...basePage,
  background: "#F3F9FD",
  surfaceAlt: "#E0F2FE",
  primary: "#0EA5E9",
  primaryDeep: "#0369A1",
  primarySoft: "#BAE6FD",
};

export const Colors_TaxPage: PageColors = {
  ...basePage,
  background: "#F5F5FD",
  surfaceAlt: "#E9E9FB",
  primary: "#6366F1",
  primaryDeep: "#4338CA",
  primarySoft: "#E0E7FF",
};

export const Colors_NavBar = {
  selected: {
    sales: "#059669",
    buy: "#B45309",
    udharo: "#E11D48",
    dashBoard: "#4F46E5",
    settings: "#1D4ED8",
  },
  barBackground: "#FFFFFF",
  barBorder: "rgba(15, 23, 42, 0.08)",
  inactive: "#94A3B8",
} as const;

export const Colors_LoginPage = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  primary: "#4F46E5",
  primaryDeep: "#3730A3",
  primarySoft: "#E0E7FF",
  onPrimary: "#FFFFFF",
  danger: "#DC2626",
  heroTop: "#4F46E5",
  heroBottom: "#7C3AED",
} as const;
