# CurrencyInput

## Status

Not yet implemented — this folder only contains this README.

## Intended purpose

A shared numeric input specialized for money entry (currency prefix, decimal formatting, numeric keyboard), built on top of [Input/LabledInput.tsx](../Input/README.md) plus the implemented helpers in `@/shared/utils/currency` (see [utils/README.md](../../utils/README.md)).

## Suggested shape

```tsx
interface CurrencyInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  currencySymbol?: string; // default "Rs."
}
```

```tsx
import CurrencyInput from "@/shared/components/CurrencyInput/CurrencyInput";

<CurrencyInput label="Amount" value={amount} onChangeValue={setAmount} />
```
