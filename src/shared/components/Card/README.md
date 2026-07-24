# Card

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared surface/container component (rounded corners, background, shadow) that feature cards like `SaleCard` or a dashboard stat card can wrap, instead of each feature re-implementing the same box styling.

## Suggested shape

```tsx
interface CardProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
```

```tsx
import Card from "@/shared/components/Card/Card";
import { Colors_DashboardPage } from "@/shared/constants/colors";

<Card style={{ backgroundColor: Colors_DashboardPage.surface }}>
  <Text>Today's Sales: Rs. 12,500</Text>
</Card>
```

Follow the pattern used by [Button](../Button/README.md) and [Input](../Input/README.md): pull default colors from a page token set in `@/shared/constants/colors`, and accept a `style` override.
