# TabBar

Two pieces make up the bottom tab navigation:

- `CustomTabBar.tsx` — the floating, translucent tab bar rendered as the navigator's `tabBar`.
- `SwipeableTabScreen.tsx` — a gesture wrapper applied to every tab screen through the `Tabs` `screenLayout` prop, so users can swipe horizontally between tabs.

## CustomTabBar

`CustomTabBar.tsx` is the shared bottom tab bar used by the Expo Router tabs layout.

### What it does

- Renders a floating, translucent bottom navigation bar.
- On iOS 26+ it uses `GlassView` from `expo-glass-effect` for the native Liquid Glass material.
- On other platforms it uses `BlurView` from `expo-blur` (web gets CSS `backdrop-filter`; Android falls back to a semi-transparent surface when no blur target is provided).
- Uses shared design tokens for spacing, radius, typography, shadows, and colors.
- Maps route names like `01-sales` and `04-dashboard` to nav color tokens and icon names.
- Translates tab labels through `useCopy()` and switches soft/active colors with `useTheme()`.
- Fires a selection haptic before switching to a different tab.
- Works as the `tabBar` prop for the tabs navigator.

## SwipeableTabScreen

Wraps a tab screen in a horizontal `Gesture.Pan()`:

- Swiping left moves to the next tab; swiping right moves to the previous one.
- `activeOffsetX` / `failOffsetY` are both `12px`, so vertical scrolling wins as soon as the drag is clearly vertical.
- A page change commits after `56px` of travel or a `500px/s` fling, and fires `hapticSelection()`.
- The first and last tabs simply do nothing when swiped past the end.

`TAB_ROUTE_ORDER` defines the page order. Keep it in sync with the `<Tabs.Screen>` order in `src/app/(tabs)/_layout.tsx`.

## Where it is used

Use both pieces from the tabs layout:

```tsx
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/shared/components/TabBar/CustomTabBar";
import { SwipeableTabScreen } from "@/shared/components/TabBar/SwipeableTabScreen";

export const unstable_settings = {
  // Expo Router 58 initial-tab API (replaces `initialRouteName`).
  anchor: "04-dashboard",
};

export default function TabsLayout() {
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
      screenOptions={{ headerShown: false, animation: "shift" }}>
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

- Expo Router 58 passes `{ state, descriptors, emitter, navigateToTab }` to a custom `tabBar`; the old `navigation` prop is gone. Emit `tabPress` through `emitter` and switch tabs with `navigateToTab(route.key)`.
- `screenLayout` is supported by the vendored bottom-tabs navigator; it wraps each screen inside its scene, so the tab bar itself is not part of the swipe area.
- `animation: "shift"` slides the scenes sideways on every tab change, including swipes. The default shift timing is 150ms.
- Keep route names in sync with `ROUTE_COLOR_MAP`, `ROUTE_SOFT_MAP`, `ROUTE_ICON_MAP`, and `ROUTE_ICON_ACTIVE_MAP` inside `CustomTabBar.tsx`.
- If you add a new tab, update those maps, `TAB_ROUTE_ORDER`, and add a matching `Tabs.Screen` entry.
- The active tab pills use translucent route tints so they read correctly on top of the glass surface.
- `expo-glass-effect` only renders the native effect on iOS 26+; the blur fallback is intentional, not a bug.
- The default export is also `CustomTabBar`.
