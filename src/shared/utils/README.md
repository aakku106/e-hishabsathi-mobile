# shared/utils/

## Status

Not yet implemented — every file here (`calculations.ts`, `currency.ts`, `date.ts`, `formatter.ts`, `logger.ts`, `validation.ts`) currently exists but is empty.

## Intended purpose

Reusable helper functions used by two or more features. Feature-specific helpers (e.g. `calculateProfit()` for Sales) stay inside that feature's own `utils/` folder — only move a helper here once a second feature needs it too.

## Files

| File | Intended purpose | Example |
| --- | --- | --- |
| `calculations.ts` | Generic math helpers not tied to one feature | `calculatePercentage(part, total)` |
| `currency.ts` | Money formatting/parsing (NPR, rounding, etc.) | `formatCurrency(amount)` |
| `date.ts` | Date formatting/parsing built on Day.js | `formatDate(date, "DD MMM YYYY")` |
| `formatter.ts` | General text/number formatting not specific to currency or date | `formatPhoneNumber(value)` |
| `logger.ts` | A single app-wide logger so `console.log` isn't scattered everywhere | `logger.info("sync started")` |
| `validation.ts` | Plain-JS validation helpers used outside of a Zod schema (e.g. quick UI checks) | `isValidPhoneNumber(value)` |

## How to use them (once implemented)

```ts
import { formatCurrency } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/date";
import { logger } from "@/shared/utils/logger";

const label = `${formatCurrency(1250)} on ${formatDate(new Date())}`;
logger.info("rendered sale summary", { label });
```

## Notes

- Keep feature-only calculations (e.g. `groupSales()`, `calculateDiscount()`) inside the feature's own `utils/`, per Rules 3/4 in the architecture guide.
- `validation.ts` here is for lightweight, non-schema checks. Full form field validation still belongs in each feature's own `validation.ts` using Zod.
