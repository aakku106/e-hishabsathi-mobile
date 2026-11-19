import { Redirect, Tabs } from "expo-router";

import { useAuthStore } from "@/store/auth.store";
import { CustomTabBar } from "@/shared/components/TabBar/CustomTabBar";
import { SwipeableTabScreen } from "@/shared/components/TabBar/SwipeableTabScreen";

export const unstable_settings = {
  // Initial tab for the tabs navigator: the dashboard.
  anchor: "04-dashboard",
};

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenLayout={({ route, navigation, children }) => (
        <SwipeableTabScreen
          routeName={route.name}
          onNavigate={(name) => navigation.navigate(name)}>
          {children}
        </SwipeableTabScreen>
      )}
      screenOptions={{
        headerShown: false,
        // Slide the scenes sideways when the active tab changes; swipe
        // navigation in `SwipeableTabScreen` commits the same change.
        animation: "shift",
      }}>
      <Tabs.Screen name="01-sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="02-purchases" options={{ title: "Buy" }} />
      <Tabs.Screen name="03-udharo" options={{ title: "Udharo" }} />
      <Tabs.Screen name="04-dashboard" options={{ title: "DashBoard" }} />
      <Tabs.Screen name="05-settings" options={{ title: "Setting" }} />
    </Tabs>
  );
}
