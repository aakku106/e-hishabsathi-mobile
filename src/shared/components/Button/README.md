# Button

`PrimaryButton.tsx` exports `PrimaryButton`, the shared gradient action button used across feature screens.

## Status

Implemented.

## What it does

- Renders a `TouchableOpacity` wrapping a `LinearGradient`.
- Supports a loading spinner and disabled state.
- Uses shared spacing, radius, typography, and shadow tokens.
- Lets the caller override the gradient, outer style, and text style.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `title` | `string` | no | `""` |
| `onPress` | `(event: GestureResponderEvent) => void` | no | — |
| `loading` | `boolean` | no | `false` |
| `disabled` | `boolean` | no | `false` |
| `gradient` | `readonly [string, string]` | no | `["#4F46E5", "#3730A3"]` |
| `style` | `StyleProp<ViewStyle>` | no | — |
| `textStyle` | `StyleProp<TextStyle>` | no | — |

## How to use it

```tsx
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

<PrimaryButton title="Save Sale" onPress={handleSave} />
```

Match a page's palette by passing its gradient:

```tsx
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<PrimaryButton
  title="Record Payment"
  gradient={[Colors_UdharoPage.primary, Colors_UdharoPage.primaryDeep]}
  onPress={handleRecordPayment}
/>
```

## Notes

- The default export is also `PrimaryButton`.
- `loading` disables presses and replaces the title with a white `ActivityIndicator`.
