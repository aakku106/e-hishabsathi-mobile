# Header

`PageHeader.tsx` exports `PageHeader`, the shared gradient screen header used by feature screens.

## Status

Implemented.

## What it does

- Renders a gradient hero with a title, optional subtitle, optional icon badge, optional back button, and an optional right action.
- Accepts a custom gradient so each page can use its own palette.
- Accepts `children` for page-specific content below the title area.

## Props

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

## How to use it

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
<PageHeader
  title="Inventory"
  onBack={() => router.back()}
/>
```

## Notes

- The default export is also `PageHeader`.
- The back button only renders when `onBack` is provided.
