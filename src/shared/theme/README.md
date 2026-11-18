# shared/theme/

Reserved for a future global theme token set.

## Status

No theme token files exist here yet. The app currently uses two complementary pieces:

- `src/providers/ThemeProvider.tsx` owns the light/dark/system mode context and exposes `useTheme()`. `mode` is the stored preference (`"light"`, `"dark"`, or `"system"`); `isDark` is the resolved value, with `"system"` following `useColorScheme()`.
- `src/shared/constants/colors.ts` holds page token sets and `getThemedColors(colors, isDark)`, which maps a page palette to dark values.

Screens should keep using their page token set plus `getThemedColors` rather than introducing a second theme system:

```tsx
const { isDark } = useTheme();
const colors = useMemo(
  () => getThemedColors(Colors_SalesPage, isDark),
  [isDark],
);
```

## Future direction

If the app later moves to a single shared palette, add it here and migrate page tokens deliberately. Until then, [constants/](../constants/README.md) is the source of truth for colors, spacing, radius, and typography.
