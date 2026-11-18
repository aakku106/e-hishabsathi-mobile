# shared/types/

Global TypeScript interfaces used by two or more features.

## Status

Empty — there are no shared type files yet.

Feature-specific types (e.g. `Sale`, `SaleItem`, `CreateSaleInput`) stay in that feature's own `types.ts`. Only promote a type here once a second feature needs it too.

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

```ts
import type { Paginated } from "@/shared/types/common";
import type { Sale } from "@/features/sales/types";

function useSalesPage(page: number): Paginated<Sale> {
  // ...
}
```

## Notes

- Do not create a shared type just to avoid a local import; wait until at least two features need it.
- Database row shapes and repository mapping types belong beside their repository.
