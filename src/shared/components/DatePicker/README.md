# DatePicker

`DropDown.tsx` exports `Dropdown`, a shared single/multi-select dropdown built on a modal + `FlatList`.

## Status

Implemented.

> [!NOTE]
> Despite living in the `DatePicker` folder, this component is a generic option-select dropdown, not a date picker. It's reused today as the selection control for things like business type or category pickers. Use it as the base for building an actual date picker, or rename the folder if a dedicated `DatePicker` component is added later.

## What it does

- Shows a button with the current selection (or `placeholder`).
- Tapping it opens a modal list of `options`.
- `maxSelectable={1}` (default) behaves as single-select and closes on pick; `maxSelectable > 1` behaves as multi-select up to that limit.
- Defaults to `Colors_SalesPage` tokens, overridable via color props.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `options` | `DropdownOption[]` (`{ label, value }`) | yes | — |
| `defaultValue` | `DropdownOption \| DropdownOption[]` | no | — |
| `placeholder` | `string` | no | `"Select an option"` |
| `maxSelectable` | `number` | no | `1` |
| `onSelect` | `(selected: DropdownOption \| DropdownOption[]) => void` | no | — |
| `bgColor` / `textColor` / `dropdownBgColor` / `dropdownTextColor` / `borderColor` | `string` | no | `Colors_SalesPage.*` |
| `containerStyle` / `buttonStyle` / `textStyle` / `dropdownListStyle` | `StyleProp<...>` | no | — |

## How to use it

```tsx
import Dropdown from "@/shared/components/DatePicker/DropDown";

const options = [
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Restaurant", value: "restaurant" },
];

// Single select
<Dropdown
  options={options}
  placeholder="Select Business Type"
  defaultValue={options[0]}
  onSelect={(selected) => console.log(selected)}
/>

// Multi select (up to 2 options)
<Dropdown
  options={options}
  placeholder="Select Types"
  maxSelectable={2}
  onSelect={(selected) => console.log(selected)}
/>
```

## Notes

- `t.ts` in this folder is a git-tracking placeholder only — never edit it.
