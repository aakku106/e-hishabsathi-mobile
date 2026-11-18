# Header

Two shared headers:

- `AppHeader.tsx` — dashboard-style top bar with a menu button, title pill, and notifications button.
- `PageHeader.tsx` — gradient hero header for stack/detail screens.

## AppHeader

Implemented. Renders a menu icon on the left, the page title in a pill, and a notification bell on the right (with an optional dot). Used by the Dashboard and Sales tabs.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | yes | — |
| `colors` | `{ surface, surfaceAlt, textPrimary, primary }` | yes | — |
| `accentColor` | `string` | no | `colors.primary` |
| `onMenuPress` | `() => void` | no | — |
| `onNotificationsPress` | `() => void` | no | — |
| `showNotificationDot` | `boolean` | no | `true` |

```tsx
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_SalesPage } from "@/shared/constants/colors";

<AppHeader
  title="Sales"
  colors={Colors_SalesPage}
  accentColor={Colors_SalesPage.primary}
/>
```

The menu and notification buttons are visual placeholders until a drawer and notification screen exist; pass handlers when those land.

## PageHeader

Implemented. Renders a gradient hero with a title, optional subtitle, optional icon badge, optional back button, and an optional right action.

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
import { Colors_SettingsPage } from "@/shared/constants/colors";

<PageHeader
  title="Settings"
  subtitle="Manage your shop and preferences"
  icon="cog-outline"
  gradient={[Colors_SettingsPage.primary, Colors_SettingsPage.primaryDeep]}
/>
```

With a back button:

```tsx
<PageHeader title="Inventory" onBack={() => router.back()} />
```

## Notes

- Both components are also default exports.
- `PageHeader`'s back button only renders when `onBack` is provided.
