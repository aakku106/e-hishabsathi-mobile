# app/

Routing only. This folder is managed by **Expo Router** — every file here represents a route.

See [../../doc/guide0.0.1-alpha.1.md](../../doc/guide0.0.1-alpha.1.md) for the full architecture.

### Should NOT contain

- SQL
- Business logic
- API calls
- Complex state
- Feature UI implementation

A screen route should only export the feature screen it points to:

```tsx
export { default } from "@/features/sales/SalesScreen";
```

Layouts (`_layout.tsx`) and `+not-found.tsx` own UI/navigation code by design.

### Structure

```
app/
    _layout.tsx           # providers + store hydration + Stack
    index.tsx             # redirects to the login flow
    +not-found.tsx        # 404 fallback route

    (auth)/               # unauthenticated flow
        _layout.tsx
        login.tsx
        business-type.tsx
        onboarding.tsx

    (tabs)/               # main authenticated app
        _layout.tsx       # tab layout with CustomTabBar
        01-sales.tsx
        02-purchases.tsx
        03-udharo.tsx
        04-dashboard.tsx
        05-settings.tsx

    account.tsx           # stack route opened from Settings
    inventory.tsx         # stack route opened from Settings
    tax.tsx               # stack route opened from Settings
```

### `_layout.tsx`

The root layout wraps the app in global providers, hydrates stores once SQLite is ready, then renders the `Stack`:

```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <QueryProvider>
    <SQLiteProvider>
      <ThemeProvider>
        <StoreHydration />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SQLiteProvider>
  </QueryProvider>
</GestureHandlerRootView>
```

`GestureHandlerRootView` is required by react-native-gesture-handler v3 (used by the AI bottom sheet).

If the app needs a new global provider (see [../providers/](../providers/)), add it here — never inside an individual route.

### `+not-found.tsx`

Expo Router's catch-all 404 screen. Unlike screen routes, this one owns its UI directly since there is no feature to delegate to.

### `(auth)/`

The pre-login / onboarding flow. All screen routes are wired to feature screens.

| Route | Status |
| --- | --- |
| `login.tsx` | Wired — exports `@/features/auth/Login` |
| `business-type.tsx` | Wired — exports `@/features/business/businessType/BusinessTypeScreen` |
| `onboarding.tsx` | Wired — exports `@/features/business/onboarding/OnboardingScreen` |

The auth layout redirects authenticated users with a business profile to the dashboard. The login screen is local-only and is not connected to a remote identity provider yet.

### `(tabs)/`

The main tab-bar app, entered after auth. `_layout.tsx` guards authentication and renders `Tabs` with the shared [`CustomTabBar`](../shared/components/TabBar/README.md) as the `tabBar` prop and [`SwipeableTabScreen`](../shared/components/TabBar/README.md) as the `screenLayout` wrapper (horizontal swipe between tabs):

```tsx
export const unstable_settings = {
  // Expo Router 58 initial-tab API (replaces `initialRouteName`).
  anchor: "04-dashboard",
};

<Tabs
  tabBar={(props) => <CustomTabBar {...props} />}
  screenLayout={({ route, navigation, children }) => (
    <SwipeableTabScreen
      routeName={route.name}
      onNavigate={(name) => navigation.navigate(name)}>
      {children}
    </SwipeableTabScreen>
  )}
  screenOptions={{ headerShown: false, animation: "none" }}>
  <Tabs.Screen name="01-sales" options={{ title: "Sales" }} />
  <Tabs.Screen name="02-purchases" options={{ title: "Buy" }} />
  <Tabs.Screen name="03-udharo" options={{ title: "Udharo" }} />
  <Tabs.Screen name="04-dashboard" options={{ title: "DashBoard" }} />
  <Tabs.Screen name="05-settings" options={{ title: "Setting" }} />
</Tabs>
```

If you add a new tab, add both a `Tabs.Screen` entry here **and** route-color/icon mappings in `CustomTabBar` plus the route name in `SwipeableTabScreen`'s `TAB_ROUTE_ORDER` — they need to stay in sync.

| Route | Status |
| --- | --- |
| `01-sales.tsx` | Wired — exports `@/features/sales/SalesScreen` |
| `02-purchases.tsx` | Wired — exports `@/features/purchase/PurchaseScreen` |
| `03-udharo.tsx` | Wired — exports `@/features/udharo/UdharoScreen` |
| `04-dashboard.tsx` | Wired — exports `@/features/dashboard/DashboardScreen` |
| `05-settings.tsx` | Wired — exports `@/features/settings/SettingsScreen` |

`account.tsx`, `inventory.tsx`, and `tax.tsx` are stack routes outside the tabs, opened from Settings.

### Rules that apply to this folder

- Screens should never communicate directly with SQLite — that flows through a feature hook → feature data layer → SQLite (Rule 1).
- Keep screen route files thin — a route file should only expose a screen (Rule 7).
- Route grouping folders (`(auth)`, `(tabs)`) are for navigation structure only; they never hold business logic.
