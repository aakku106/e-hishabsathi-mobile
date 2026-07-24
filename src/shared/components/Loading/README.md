# Loading

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared loading indicator (spinner + optional label) shown while a feature hook is fetching from SQLite, so every screen doesn't roll its own `ActivityIndicator` layout.

## Suggested shape

```tsx
interface LoadingProps {
  label?: string;
}
```

```tsx
import Loading from "@/shared/components/Loading/Loading";

function SalesScreen() {
  const { sales, isLoading } = useSales();

  if (isLoading) return <Loading label="Loading sales..." />;

  return <SalesList sales={sales} />;
}
```
