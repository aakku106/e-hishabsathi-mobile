# EmptyState

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared "nothing here yet" placeholder (icon/illustration + message + optional action) shown when a feature hook returns an empty list, e.g. no sales recorded yet.

## Suggested shape

```tsx
interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

```tsx
import EmptyState from "@/shared/components/EmptyState/EmptyState";

if (sales.length === 0) {
  return (
    <EmptyState
      message="No sales recorded yet"
      actionLabel="Add Sale"
      onAction={handleAddSale}
    />
  );
}
```
