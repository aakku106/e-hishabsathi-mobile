import { Stack } from "expo-router";
import QueryProvider from "../providers/QueryProvider";
import SQLiteProvider from "../providers/SQLiteProvider";
import ThemeProvider from "../providers/ThemeProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <SQLiteProvider>
        <ThemeProvider>
          <Stack />
        </ThemeProvider>
      </SQLiteProvider>
    </QueryProvider>
  );
}
