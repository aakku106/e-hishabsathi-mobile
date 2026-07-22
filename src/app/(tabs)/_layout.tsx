import { Tabs } from "expo-router";

import CustomTabBar from "@/shared/components/TabBar/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="04-dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="01-sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="02-purchases" options={{ title: "Buy" }} />
      <Tabs.Screen name="03-udharo" options={{ title: "Udharo" }} />
      <Tabs.Screen name="04-dashboard" options={{ title: "DashBoard" }} />
      <Tabs.Screen name="05-settings" options={{ title: "Setting" }} />
    </Tabs>
  );
}
