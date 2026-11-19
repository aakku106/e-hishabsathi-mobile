# shared/utils/

Reusable helper functions used by two or more features. Feature-specific helpers (e.g. `calculateProfit()` for Sales) stay inside that feature's own `utils/` folder — only move a helper here once a second feature needs it too.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `calculations.ts` | `sum`, `average`, `percentage`, `changePercent`, `profit`, `grossProfit` | Generic math helpers |
| `currency.ts` | `parseCurrency`, `formatCurrencyAmount`, `sumAmounts` | Currency parsing and formatting helpers |
| `date.ts` | `formatDate`, `formatTime`, `formatDateTime`, `startOfDay/Week/Month/Year`, `daysAgo`, `isOverdue`, `NEPALI_MONTHS`, `nepalMonthForDate`, `lastMonths`, `lastWeekdayLabels` | Date helpers built on Day.js |
| `formatter.ts` | `formatCurrency`, `formatNumber`, `formatPercentage` | General display formatting |
| `haptics.ts` | `hapticSelection`, `hapticSuccess`, `hapticWarning`, `hapticError`, `hapticImpact`, `hapticDestructive` | Fire-and-forget haptic feedback with silent failure on unsupported devices |
| `logger.ts` | `logger.debug/info/warn/error` | App-wide logger; output is suppressed outside development |
| `uuid.ts` | `generateUuid()` | Client UUID generation via `expo-crypto` |
| `validation.ts` | `optionalText`, `requiredText`, `positiveNumber`, `nonNegativeNumber`, `amountString`, `zodErrorMessages` | Lightweight Zod helpers shared by forms |

## How to use them

```ts
import { formatCurrency } from "@/shared/utils/formatter";
import { formatDate } from "@/shared/utils/date";
import { hapticSuccess } from "@/shared/utils/haptics";
import { logger } from "@/shared/utils/logger";

const label = `${formatCurrency(1250)} on ${formatDate(new Date())}`;
logger.info("rendered sale summary", { label });
hapticSuccess();
```

## Notes

- `formatCurrency` lives in `formatter.ts`; `currency.ts` is for parsing and currency-specific helpers.
- `haptics.ts` is the only place that imports `expo-haptics`. Use `hapticSuccess()` after a write, `hapticError()` for validation or failed writes, `hapticDestructive()` for logout/delete-all-data, and `hapticSelection()` for tab switches and preference toggles. Helpers swallow rejections, so they are safe on web and unsupported devices.
- Keep feature-only calculations (`groupSales()`, `calculateDiscount()`) inside the feature's own `utils/`, per Rules 3/4 in the architecture guide.
- Full form validation belongs in each feature's `validation.ts` using Zod; `shared/utils/validation.ts` only holds reusable primitives.
