# shared/types/

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

Global TypeScript interfaces used by two or more features. Feature-specific types (e.g. `Sale`, `SaleItem`, `CreateSaleRequest`) stay in that feature's own `types.ts` — only promote a type here once a second feature needs it too.

## Suggested shape

```ts
// src/shared/types/common.ts
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type ID = string;
```

## How it would be used

```ts
import type { Paginated } from "@/shared/types/common";
import type { Sale } from "@/features/sales/types";

function useSalesPage(page: number): Paginated<Sale> {
  // ...
}
```
