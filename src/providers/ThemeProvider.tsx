import React, { PropsWithChildren, createContext, useContext } from "react";

// Minimal theme object — expand with tokens as needed
export const theme = {
  colors: {
    primary: "#0b84ff",
    background: "#ffffff",
  },
};

const ThemeContext = createContext(theme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
