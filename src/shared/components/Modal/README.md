# Modal

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared modal/dialog wrapper (backdrop + centered panel + close handling) for confirmations and small forms, so features don't each reimplement `Modal` + `TouchableWithoutFeedback` boilerplate.

[DatePicker/DropDown.tsx](../DatePicker/README.md) already has an inline example of this backdrop + modal pattern (see its `Modal` + `modalOverlay` usage) that a shared `Modal` component could be extracted from.

## Suggested shape

```tsx
interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

```tsx
import AppModal from "@/shared/components/Modal/Modal";

<AppModal visible={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
  <Text>Delete this sale?</Text>
</AppModal>
```
