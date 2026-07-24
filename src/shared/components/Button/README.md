# Button

`TopButton.tsx` is a shared pill-shaped button used across feature screens.

## Status

Implemented.

## What it does

- Renders a `TouchableOpacity` pill button with a title.
- Defaults to `Colors_SalesPage` tokens for background/text color, spacing, radius, and typography.
- Lets the caller override layout/color with `style` and `textStyle`.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | no | `""` |
| `onPress` | `(event: GestureResponderEvent) => void` | no | — |
| `style` | `StyleProp<ViewStyle>` | no | — |
| `textStyle` | `StyleProp<TextStyle>` | no | — |

## How to use it

```tsx
import TopButton from "@/shared/components/Button/TopButton";

<TopButton title="Save Sale" onPress={handleSave} />
```

Override colors for a different page's token set:

```tsx
import TopButton from "@/shared/components/Button/TopButton";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<TopButton
  title="Record Payment"
  onPress={handleRecordPayment}
  style={{ backgroundColor: Colors_UdharoPage.topBtn }}
  textStyle={{ color: Colors_UdharoPage.textPrimary }}
/>
```

## Notes

- `track.ts` in this folder is a git-tracking placeholder only — never edit it.
