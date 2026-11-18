# Header

Two shared headers:

- `AppHeader.tsx` — the default app header: menu (or back) button, title pill, and notifications button.
- `PageHeader.tsx` — legacy gradient hero header kept for compatibility; new screens should use `AppHeader`.

## AppHeader

Implemented. Renders a menu icon on the left, the page title in a pill, and a notification bell on the right (with an optional dot). Every authenticated screen uses it.

The title and notification dot always use the shared theme-aware green from `getAccentColor(isDark)` in `src/shared/constants/colors.ts` (`#059669` light, `#34D399` dark). Do not pass a per-page accent.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | yes | — |
| `colors` | `{ surface, surfaceAlt, textPrimary }` | yes | — |
| `onBack` | `() => void` | no | — |
| `onMenuPress` | `() => void` | no | — |
| `onNotificationsPress` | `() => void` | no | — |
| `showNotificationDot` | `boolean` | no | `true` |

When `onBack` is provided the left button becomes a back arrow; otherwise it renders the hamburger menu.

Tab screen:

```tsx
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_SalesPage } from "@/shared/constants/colors";

<AppHeader title="Sales" colors={Colors_SalesPage} />
```

Stack screen:

```tsx
<AppHeader
  title="Inventory"
  colors={colors}
  onBack={() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/05-settings");
  }}
/>
```

The menu and notification buttons are visual placeholders until a drawer and notification screen exist; pass handlers when those land.

## PageHeader

Legacy. Renders a gradient hero with a title, optional subtitle, optional icon badge, optional back button, and an optional right action. Kept for reference; no current screen uses it.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | yes | — |
| `subtitle` | `string` | no | — |
| `icon` | `MaterialCommunityIcons` glyph name | no | — |
| `gradient` | `readonly [string, string]` | no | `["#4F46E5", "#7C3AED"]` |
| `onBack` | `() => void` | no | — |
| `right` | `React.ReactNode` | no | — |
| `children` | `React.ReactNode` | no | — |
| `style` | `ViewStyle` | no | — |

```tsx
import { PageHeader } from "@/shared/components/Header/PageHeader";

<PageHeader
  title="Settings"
  subtitle="Manage your shop and preferences"
  icon="cog-outline"
  gradient={["#3B82F6", "#1D4ED8"]}
/>
```

## Notes

- Both components are also default exports.
- `PageHeader`'s back button only renders when `onBack` is provided.
