# shared/hooks/

Reusable hooks used by two or more features. Feature-specific hooks (e.g. `useSalesEntries()`, `useSaleForm()`) stay inside that feature's own `hooks/` folder.

## Implemented hooks

| Hook | Returns | Purpose |
| --- | --- | --- |
| `useDebounce<T>(value, delay = 300)` | `T` | Debounce a fast-changing value before it triggers work such as a query |
| `useKeyboard()` | `{ isVisible, keyboardHeight }` | Track keyboard visibility and height for layout adjustments |
| `useSQLite()` | `{ db, ready, error }` | Read the SQLite provider context; use it to gate feature queries on `ready && db` |
| `useTheme()` | `{ mode, isDark }` | Re-export of `providers/ThemeProvider`; read the active light/dark mode |

## How to use them

```tsx
import { useDebounce } from "@/shared/hooks/useDebounce";

const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);
```

```tsx
import { useSQLite } from "@/shared/hooks/useSQLite";

function useSalesEntries() {
  const { db, ready } = useSQLite();
  return useQuery({
    queryKey: ["sales", "entries"],
    queryFn: fetchSalesEntries,
    enabled: ready && db !== null,
  });
}
```

```tsx
import { useTheme } from "@/shared/hooks/useTheme";

const { isDark } = useTheme();
```

## Notes

- Screens should never call SQLite directly (Rule 1). `useSQLite()` belongs in feature hooks that gate repository queries; repositories call `getDatabase()` from `@/database/sqlite`.
- `useTheme()` is a convenience re-export. Most existing screens import `useTheme` directly from `@/providers/ThemeProvider`.
- `useKeyboard()` only listens while the calling component is mounted.
