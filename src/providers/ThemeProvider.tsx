import React, { PropsWithChildren, createContext, useContext } from "react";

import { useSettingsStore } from "@/store/settings.store";

export type ThemeMode = "light" | "dark";

export type Theme = {
  mode: ThemeMode;
  isDark: boolean;
};

export const theme = {
  colors: {
    primary: "#0b84ff",
    background: "#ffffff",
    surface: "#f3f4f6",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  },
} as const;

const ThemeContext = createContext<Theme>({ mode: "light", isDark: false });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const mode = useSettingsStore((state) => state.themeMode);
  const isDark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
