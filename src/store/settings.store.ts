import { create } from "zustand";

import type { ThemeMode } from "@/providers/ThemeProvider";

/** Pages that have their own behaviour settings. */
export type PageKey = "sales" | "buy" | "udharo" | "dashboard";

/** Per-page visibility of the floating AI assistant button. */
export type AiAssistantSettings = Record<PageKey, boolean>;

export const DEFAULT_AI_ASSISTANT: AiAssistantSettings = {
  sales: true,
  buy: true,
  udharo: true,
  dashboard: true,
};

export type PageSettings = {
  /** Sales may only use products that already exist in inventory. */
  salesStrictInventory: boolean;
  aiAssistant: AiAssistantSettings;
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  salesStrictInventory: true,
  aiAssistant: DEFAULT_AI_ASSISTANT,
};

type SettingsState = PageSettings & {
  themeMode: ThemeMode;
  currency: string;
  language: "en" | "np";
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: "en" | "np") => void;
  setSalesStrictInventory: (enabled: boolean) => void;
  setAiAssistant: (page: PageKey, enabled: boolean) => void;
  hydrate: (
    mode: ThemeMode,
    language?: "en" | "np",
    pageSettings?: Partial<PageSettings>,
  ) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: "light",
  currency: "Rs.",
  language: "en",
  isHydrated: false,
  ...DEFAULT_PAGE_SETTINGS,
  setThemeMode: (themeMode) => set({ themeMode }),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
  setSalesStrictInventory: (salesStrictInventory) =>
    set({ salesStrictInventory }),
  setAiAssistant: (page, enabled) =>
    set((state) => ({
      aiAssistant: { ...state.aiAssistant, [page]: enabled },
    })),
  hydrate: (themeMode, language = "en", pageSettings) =>
    set({
      themeMode,
      language,
      salesStrictInventory:
        pageSettings?.salesStrictInventory ??
        DEFAULT_PAGE_SETTINGS.salesStrictInventory,
      aiAssistant: pageSettings?.aiAssistant ?? DEFAULT_AI_ASSISTANT,
      isHydrated: true,
    }),
}));
