# BottomSheet

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared bottom sheet wrapper around `@gorhom/bottom-sheet` (see the "Recommended Libraries" section of the architecture guide) for quick-action panels, e.g. entry forms opened from a tab screen without a full route change.

## Suggested shape

```tsx
import BottomSheet from "@gorhom/bottom-sheet";

interface AppBottomSheetProps {
  snapPoints?: (string | number)[];
  children: React.ReactNode;
}
```

```tsx
import AppBottomSheet from "@/shared/components/BottomSheet/BottomSheet";

<AppBottomSheet snapPoints={["25%", "50%"]}>
  <QuickAddSaleForm />
</AppBottomSheet>
```
