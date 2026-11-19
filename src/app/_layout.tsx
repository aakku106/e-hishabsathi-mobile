import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SQLiteProvider>
          <ThemeProvider>
            <StoreHydration />
            <Stack
              screenOptions={{
                headerShown: false,
                // Consistent push transition for the stack routes opened from
                // Settings (Inventory, Tax, Account) and between auth groups.
                animation: "slide_from_right",
              }}
            />
          </ThemeProvider>
        </SQLiteProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
