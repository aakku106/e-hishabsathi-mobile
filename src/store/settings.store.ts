import { create } from "zustand";

import type { ThemeMode } from "@/providers/ThemeProvider";

/** Pages that have their own behaviour settings. */
export type PageKey = "sales" | "buy" | "udharo" | "dashboard";

/** Per-page visibility of the floating AI assistant button. */
export type AiAssistantSettings = Record<PageKey, boolean>;

/**
 * Whether a page's recent-entries list is shown. Only the pages that render
 * one (sales, buys, udharo) carry a toggle.
 */
export type RecentEntriesSettings = Record<"sales" | "buy" | "udharo", boolean>;

export const DEFAULT_AI_ASSISTANT: AiAssistantSettings = {
  sales: true,
  buy: true,
  udharo: true,
  dashboard: true,
};

export const DEFAULT_RECENT_ENTRIES: RecentEntriesSettings = {
  sales: true,
  buy: true,
  udharo: true,
};

export type PageSettings = {
  /** Sales may only use products that already exist in inventory. */
  salesStrictInventory: boolean;
  aiAssistant: AiAssistantSettings;
  recent: RecentEntriesSettings;
  /**
   * Horizontal swipe between tab pages. The default is tier-dependent
   * (on for high/mid, off for low) and is resolved during hydration.
   */
  tabSwipeEnabled: boolean;
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  salesStrictInventory: true,
  aiAssistant: DEFAULT_AI_ASSISTANT,
  recent: DEFAULT_RECENT_ENTRIES,
  tabSwipeEnabled: true,
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
  setRecent: (page: "sales" | "buy" | "udharo", enabled: boolean) => void;
  setTabSwipeEnabled: (enabled: boolean) => void;
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
  setRecent: (page, enabled) =>
    set((state) => ({
      recent: { ...state.recent, [page]: enabled },
    })),
  setTabSwipeEnabled: (tabSwipeEnabled) => set({ tabSwipeEnabled }),
  hydrate: (themeMode, language = "en", pageSettings) =>
    set({
      themeMode,
      language,
      salesStrictInventory:
        pageSettings?.salesStrictInventory ??
        DEFAULT_PAGE_SETTINGS.salesStrictInventory,
      aiAssistant: pageSettings?.aiAssistant ?? DEFAULT_AI_ASSISTANT,
      recent: pageSettings?.recent ?? DEFAULT_RECENT_ENTRIES,
      tabSwipeEnabled:
        pageSettings?.tabSwipeEnabled ??
        DEFAULT_PAGE_SETTINGS.tabSwipeEnabled,
      isHydrated: true,
    }),
}));
