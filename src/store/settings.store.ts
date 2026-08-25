import { create } from "zustand";

import type { ThemeMode } from "@/providers/ThemeProvider";

type SettingsState = {
  themeMode: ThemeMode;
  currency: string;
  language: "en" | "np";
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: "en" | "np") => void;
  hydrate: (mode: ThemeMode, language?: "en" | "np") => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: "light",
  currency: "Rs.",
  language: "en",
  isHydrated: false,
  setThemeMode: (themeMode) => set({ themeMode }),
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === "light" ? "dark" : "light",
    })),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
  hydrate: (themeMode, language = "en") =>
    set({ themeMode, language, isHydrated: true }),
}));
