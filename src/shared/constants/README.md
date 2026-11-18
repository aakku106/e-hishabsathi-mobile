# Project Constants

This project uses page-specific style constants plus a light/dark/system mode context. There is no single global palette; each business area defines its own colors, spacing, radius, and typography tokens.

### Where the constants live

- `src/shared/constants/colors.ts` for page color maps, `getThemedColors(colors, isDark)`, and the shared `Colors_Accent` / `getAccentColor(isDark)` tokens used by the floating AI button.
- `src/shared/constants/typography.ts` for font families, font sizes, weights, and page typography presets.
- `src/shared/constants/spacing.ts` for spacing scale and layout sizes.
- `src/shared/constants/radius.ts` for border radius and border widths.
- `src/shared/constants/shadows.ts` for `boxShadow` helpers (`shadow*` props are deprecated in RN 0.86).
- `src/shared/constants/animation.ts` for the `USE_NATIVE_DRIVER` flag (false on web, where there is no native animated module).
- `src/shared/constants/routes.ts` for route names.
- `src/shared/constants/businessTypes.ts` for business type values.

### How to use them

Import the token set for the page you are building and use it directly in styles.

```tsx
import { StyleSheet, Text, View } from "react-native";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors_SalesPage.background,
    padding: Spacing.lg,
  },
  title: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize["3xl"],
    fontWeight: FontWeight.semibold,
  },
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors_SalesPage.surface,
  },
});
```

For theme-aware screens, resolve the page palette with `useTheme()` and `getThemedColors`, then memoize `StyleSheet.create` by the resolved palette:

```tsx
const { isDark } = useTheme();
const colors = useMemo(
  () => getThemedColors(Colors_SalesPage, isDark),
  [isDark],
);
const styles = useMemo(() => createStyles(colors), [colors]);
```

### Recommended pattern

- Use the page token set that matches the screen you are styling, for example `Colors_SalesPage` or `Colors_DashboardPage`.
- For theme-aware styles, call `StyleSheet.create` inside `useMemo` keyed by `isDark` (or the resolved colors object). react-native-web compiles every new style object and inserts CSS rules, so calling `StyleSheet.create` during render leaks styles on every re-render.
- Keep component-level defaults in shared components, but let screens override them with `style` and `textStyle` props when needed.
- Add new tokens by extending the relevant constants file instead of scattering raw hex values through the app.

### Current page token sets

- `Colors_SalesPage` and `Typography_SalesPage`
- `Colors_PurchasesPage` and `Typography_PurchasesPage` (`Typography_BuyPage` is an alias)
- `Colors_UdharoPage` and `Typography_UdharoPage`
- `Colors_DashboardPage` and `Typography_DashboardPage`
- `Colors_SettingsPage` and `Typography_SettingsPage`
- `Colors_AiPage` and `Typography_AiPage`
- `Colors_InventoryPage` and `Typography_InventoryPage`
- `Colors_TaxPage` and `Typography_TaxPage`
- `Colors_LoginPage`
- `Colors_NavBar`
- `Colors_Accent` and `Colors_AccentForeground` (shared green for the floating AI button)

If a screen needs a new visual identity, add a new token set in the constants folder first, then wire the screen to that set.
