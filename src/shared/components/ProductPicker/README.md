# shared/components/ProductPicker/

`ProductPicker.tsx` is a `LabeledInput` with inventory suggestions.

- Typing filters the products passed in; tapping a suggestion calls
  `onSelectProduct` and fills the field.
- Typing a name that isn't in inventory is still allowed — the data layer
  creates the product when the entry is saved.
- It also renders the linked product's stock (`stockQuantity`) and turns the
  hint red when `requestedQuantity` is higher than the stock on hand.

Used by the sales and purchase forms so both link their lines to inventory.
