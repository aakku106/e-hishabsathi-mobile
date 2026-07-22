import React, { PropsWithChildren } from "react";
import { ThemeProvider as PaperThemeProvider } from "react-native-paper";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";

// Minimal theme object — expand with tokens as needed
const theme = {
  colors: {
    primary: "#0b84ff",
    background: "#ffffff",
  },
};

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PaperThemeProvider>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </PaperThemeProvider>
  );
};

export default ThemeProvider;
