import { Stack } from "expo-router";
import { useEffect } from "react";

import { hydrateStores } from "../lib/hydration";
import { QueryProvider } from "../providers/QueryProvider";
import { SQLiteProvider, useSQLite } from "../providers/SQLiteProvider";
import { ThemeProvider } from "../providers/ThemeProvider";

function StoreHydration() {
  const { ready } = useSQLite();

  useEffect(() => {
    if (ready) {
      hydrateStores();
    }
  }, [ready]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <SQLiteProvider>
        <ThemeProvider>
          <StoreHydration />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SQLiteProvider>
    </QueryProvider>
  );
}
