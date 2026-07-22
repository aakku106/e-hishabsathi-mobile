# Project Constants

This project uses page-specific style constants instead of a single light/dark theme. The goal is to keep each business area free to define its own colors, spacing, radius, and typography tokens.

### Where the constants live

- `src/shared/constants/colors.ts` for page color maps.
- `src/shared/constants/typography.ts` for font families, font sizes, weights, and page typography presets.
- `src/shared/constants/spacing.ts` for spacing scale and layout sizes.
- `src/shared/constants/radius.ts` for border radius and border widths.
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

### Recommended pattern

- Use the page token set that matches the screen you are styling, for example `Colors_SalesPage` or `Colors_DashboardPage`.
- Keep component-level defaults in shared components, but let screens override them with `style` and `textStyle` props when needed.
- Add new tokens by extending the relevant constants file instead of scattering raw hex values through the app.

### Current page token sets

- `Colors_SalesPage` and `Typography_SalesPage`
- `Colors_PurchasesPage` and `Typography_PurchasesPage`
- `Colors_UdharoPage` and `Typography_UdharoPage`
- `Colors_DashboardPage` and `Typography_DashboardPage`
- `Colors_SettingsPage` and `Typography_SettingsPage`
- `Colors_AiPage` and `Typography_AiPage`

If a screen needs a new visual identity, add a new token set in the constants folder first, then wire the screen to that set.
