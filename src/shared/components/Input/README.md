# Input

`LabledInput.tsx` (filename keeps the project's existing spelling) exports `LabeledInput`, a shared labeled text input.

## Status

Implemented.

## What it does

- Renders a label above a bordered input container.
- Defaults to `Colors_SalesPage` tokens for label/background/border color.
- Forwards all standard `TextInputProps` (e.g. `keyboardType`, `secureTextEntry`, `onChangeText`) to the underlying `TextInput`.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | yes | — |
| `value`, `onChangeText`, ...rest of `TextInputProps` | — | no | — |
| `placeholder` | `string` | no | `"Enter text"` |
| `labelColor` | `string` | no | `Colors_SalesPage.textPrimary` |
| `inputBgColor` | `string` | no | `Colors_SalesPage.inputBG` |
| `borderColor` | `string` | no | `Colors_SalesPage.border` |
| `containerStyle` / `inputContainerStyle` / `labelStyle` / `inputStyle` | `StyleProp<...>` | no | — |

## How to use it

```tsx
import LabeledInput from "@/shared/components/Input/LabledInput";

<LabeledInput
  label="Quantity"
  placeholder="Enter Quantity"
  value={quantity}
  onChangeText={setQuantity}
  keyboardType="numeric"
/>
```

On a different page, override the token set:

```tsx
import LabeledInput from "@/shared/components/Input/LabledInput";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<LabeledInput
  label="Amount"
  placeholder="Enter Amount"
  labelColor={Colors_UdharoPage.textPrimary}
  borderColor={Colors_UdharoPage.border}
/>
```

## Notes

- `t.ts` in this folder is a git-tracking placeholder only — never edit it.
