# CustomTabBar

`CustomTabBar.tsx` is the shared bottom tab bar used by the Expo Router tabs layout.

## What it does

- Renders the bottom navigation bar.
- Uses shared design tokens for spacing, radius, typography, shadows, and colors.
- Maps route names like `01-sales` and `04-dashboard` to nav color tokens and icon names.
- Translates tab labels through `useCopy()` and switches soft/active colors with `useTheme()`.
- Works as the `tabBar` prop for the tabs navigator.

## Where it is used

Use it from the tabs layout:

```tsx
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/shared/components/TabBar/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="04-dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="01-sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="02-purchases" options={{ title: "Buy" }} />
      <Tabs.Screen name="03-udharo" options={{ title: "Udharo" }} />
      <Tabs.Screen name="04-dashboard" options={{ title: "DashBoard" }} />
      <Tabs.Screen name="05-settings" options={{ title: "Setting" }} />
    </Tabs>
  );
}
```

## Notes

- Keep route names in sync with `ROUTE_COLOR_MAP`, `ROUTE_SOFT_MAP`, `ROUTE_ICON_MAP`, and `ROUTE_ICON_ACTIVE_MAP` inside `CustomTabBar.tsx`.
- If you add a new tab, update those maps and add a matching `Tabs.Screen` entry.
- The default export is also `CustomTabBar`.
