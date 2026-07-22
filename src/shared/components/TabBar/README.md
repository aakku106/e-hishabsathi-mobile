# CustomTabBar

`CustomTabBar.tsx` is the shared bottom tab bar used by the Expo Router tabs layout.

## What it does

- Renders the bottom navigation bar.
- Uses shared design tokens for spacing, radius, typography, and colors.
- Maps route names like `01-sales` and `04-dashboard` to the matching nav color tokens.
- Works as the `tabBar` prop for the tabs navigator.

## Where it is used

Use it from the tabs layout:

```tsx
import { Tabs } from "expo-router";
import CustomTabBar from "@/shared/components/TabBar/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="04-dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="01-sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="02-purchases" options={{ title: "Buy" }} />
      <Tabs.Screen name="03-udharo" options={{ title: "Udharo" }} />
      <Tabs.Screen name="04-dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="05-settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

## Notes

- Keep route names in sync with the color map inside `CustomTabBar.tsx`.
- If you add a new tab, update the route-to-color mapping and add a matching `Tabs.Screen` entry.
- Replace the placeholder icon block with real icons when the design is ready.
