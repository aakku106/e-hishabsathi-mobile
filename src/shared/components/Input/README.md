# Input

`LabledInput.tsx` (filename keeps the project's existing spelling) exports `LabeledInput`, a shared labeled text input.

## Status

Implemented.

## What it does

- Renders a label above a bordered input container.
- Forwards all standard `TextInputProps` (e.g. `keyboardType`, `secureTextEntry`, `onChangeText`) to the underlying `TextInput`.
- Exposes color and style overrides for page-specific theming.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | yes | — |
| `value`, `onChangeText`, ...rest of `TextInputProps` | — | no | — |
| `placeholder` | `string` | no | `"Enter text"` |
| `labelColor` | `string` | no | `"#0F172A"` |
| `inputBgColor` | `string` | no | `"#FFFFFF"` |
| `borderColor` | `string` | no | `"#E2E8F0"` |
| `placeholderColor` | `string` | no | `"#94A3B8"` |
| `containerStyle` / `inputContainerStyle` / `labelStyle` / `inputStyle` | `StyleProp<...>` | no | — |

## How to use it

```tsx
import { LabeledInput } from "@/shared/components/Input/LabledInput";

<LabeledInput
  label="Quantity"
  placeholder="Enter Quantity"
  value={quantity}
  onChangeText={setQuantity}
  keyboardType="numeric"
/>
```

On a page with a different palette, pass its colors explicitly:

```tsx
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<LabeledInput
  label="Amount"
  placeholder="Enter Amount"
  labelColor={Colors_UdharoPage.textPrimary}
  inputBgColor={Colors_UdharoPage.surface}
  borderColor={Colors_UdharoPage.border}
  placeholderColor={Colors_UdharoPage.textMuted}
/>
```

## Notes

- The input text color is currently hardcoded to `#0F172A`; use `inputStyle` when a page needs a different text color.
- The default export is also `LabeledInput`.
