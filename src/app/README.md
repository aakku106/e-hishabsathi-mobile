# app/

Routing only. This folder is managed by **Expo Router** — every file here represents a route.

See [../../doc/guide0.0.1-alpha.1.md](../../doc/guide0.0.1-alpha.1.md) for the full architecture.

### Should NOT contain

- SQL
- Business logic
- API calls
- Complex state
- UI implementation

A route file should only export the feature screen it points to (Rule 7):

```tsx
export { default } from "@/features/sales/SalesScreen";
```

### Structure

```
app/
    _layout.tsx           # root layout — wraps providers, renders the Stack
    +not-found.tsx         # 404 fallback route

    (auth)/                # unauthenticated flow
        login.tsx
        business-type.tsx
        onboarding.tsx

    (tabs)/                 # main authenticated app
        _layout.tsx         # tab layout — renders CustomTabBar
        01-sales.tsx
        02-purchases.tsx
        03-udharo.tsx
        04-dashboard.tsx
        05-settings.tsx
```

### `_layout.tsx`

The root layout. Wraps the whole app in the global providers, in order, then renders the `Stack`:

```tsx
import { Stack } from "expo-router";
import QueryProvider from "../providers/QueryProvider";
import SQLiteProvider from "../providers/SQLiteProvider";
import ThemeProvider from "../providers/ThemeProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <SQLiteProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SQLiteProvider>
    </QueryProvider>
  );
}
```

If the app needs a new global provider (see [../providers/](../providers/)), add it here — never inside an individual route.

### `+not-found.tsx`

Expo Router's catch-all 404 screen. Unlike feature routes, this one owns its UI directly since there's no feature to delegate to.

### `(auth)/`

The pre-login / onboarding flow.

| Route | Status |
| --- | --- |
| `login.tsx` | Wired — exports `@/features/auth/Login` |
| `business-type.tsx` | Placeholder — inline stub, not yet wired to a feature screen |
| `onboarding.tsx` | Placeholder — inline stub, not yet wired to a feature screen |

`login.tsx` follows the thin-route pattern:

```tsx
export { default } from "@/features/auth/Login";
```

`business-type.tsx` and `onboarding.tsx` currently render their own placeholder `View` instead of re-exporting a feature screen, because their target features (`features/business/businessType`, `features/business/onboarding`) aren't implemented yet — those folders only contain a `track.ts` git-tracking placeholder. Once a feature screen exists, replace the inline JSX with a re-export, same as `login.tsx`.

### `(tabs)/`

The main tab-bar app, entered after auth. `_layout.tsx` renders `Tabs` with the shared [`CustomTabBar`](../shared/components/TabBar/README.md) as the `tabBar` prop:

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
      <Tabs.Screen name="04-dashboard" options={{ title: "DashBoard" }} />
      <Tabs.Screen name="05-settings" options={{ title: "Setting" }} />
    </Tabs>
  );
}
```

If you add a new tab, add both a `Tabs.Screen` entry here **and** a route-color mapping in `CustomTabBar` (see its README) — the two need to stay in sync.

| Route | Status |
| --- | --- |
| `01-sales.tsx` | Wired — exports `@/features/sales/SalesScreen` |
| `02-purchases.tsx` | Wired — exports `@/features/purchase/PurchaseScreen` |
| `03-udharo.tsx` | Wired — exports `@/features/udharo/UdharoScreen` |
| `04-dashboard.tsx` | Wired — exports `@/features/dashboard/DashboardScreen` |
| `05-settings.tsx` | **Not thin** — renders inline UI instead of exporting `@/features/settings/SettingsScreen`, even though that screen already exists |

> [!NOTE]
> `05-settings.tsx` breaks Rule 7 today: `features/settings/SettingsScreen.tsx` already exists, but the route still renders its own inline `View`/`Text` instead of re-exporting it. When picking this up, replace the body with:
> ```tsx
> export { default } from "@/features/settings/SettingsScreen";
> ```

### Rules that apply to this folder

- Screens should never communicate directly with SQLite — that flows through a feature hook → feature data layer → SQLite (Rule 1).
- Keep routing files thin — a route file should only expose a screen (Rule 7).
- Route grouping folders (`(auth)`, `(tabs)`) are for navigation structure only; they never hold business logic.
