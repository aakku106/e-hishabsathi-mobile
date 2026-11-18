# Header

Two shared headers:

- `AppHeader.tsx` — the default app header: menu (or back) button, title pill, and notifications button.
- `PageHeader.tsx` — legacy gradient hero header kept for compatibility; new screens should use `AppHeader`.

## AppHeader

Implemented. Renders a menu icon on the left, the page title in a pill, and a notification bell on the right (with an optional dot). Every authenticated screen uses it.

The header bar and title pill are translucent glass surfaces: both use `GlassSurface` with a translucent tint built from the page accent (native Liquid Glass on iOS 26+, `BlurView` elsewhere). The title text uses the same accent, so each page keeps its own identity. Pages set that accent through `colors.primary`, or `accentColor` for pages like Dashboard that use a different token.

The floating AI button is separate: it always uses the shared `getAccentColor(isDark)` green, also as a translucent glass tint.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | yes | — |
| `colors` | `{ surface, surfaceAlt, textPrimary, primary }` | yes | — |
| `accentColor` | `string` | no | `colors.primary` |
| `onBack` | `() => void` | no | — |
| `onMenuPress` | `() => void` | no | — |
| `onNotificationsPress` | `() => void` | no | — |
| `showNotificationDot` | `boolean` | no | `true` |
| `edgeToEdge` | `boolean` | no | `false` |

When `onBack` is provided the left button becomes a back arrow; otherwise it renders the hamburger menu.

Tab screen:

```tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_SalesPage } from "@/shared/constants/colors";

<SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
  <AppHeader title="Sales" colors={Colors_SalesPage} edgeToEdge />
  {/* ... */}
</SafeAreaView>
```

`edgeToEdge` adds the top safe-area inset to the header's padding, so the glass runs behind the status bar. The surrounding screen must then skip its own top inset (`edges` without `"top"`). Sales is the only screen using it so far; every other screen keeps the default inset behavior.

Dashboard uses its green accent instead of the page's indigo `primary`:

```tsx
<AppHeader
  title="Dashboard"
  colors={colors}
  accentColor={colors.greenPrimary}
/>
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
- `AppHeader`'s glass tint and bottom border are derived from the resolved page accent (`accentColor ?? colors.primary`) with `withAlpha()`, so the header always matches that page's identity.
- `edgeToEdge` is opt-in per screen; only enable it when the screen's safe-area wrapper omits the top edge.
- `GlassSurface` is the shared glass primitive; see [Glass/README.md](../Glass/README.md).
