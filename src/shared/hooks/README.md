# shared/hooks/

## Status

Not yet implemented — `useDebounce.ts`, `useKeyboard.ts`, `useSQLite.ts`, and `useTheme.ts` currently exist but are empty files.

## Intended purpose

Reusable hooks used by two or more features. Feature-specific hooks (e.g. `useSales()`, `useSaleForm()`) stay inside that feature's own `hooks/` folder.

## Files

| Hook | Intended purpose |
| --- | --- |
| `useDebounce.ts` | Debounce a fast-changing value (e.g. search text) before it triggers a SQLite query |
| `useKeyboard.ts` | Track keyboard visibility/height so screens can adjust layout when the keyboard opens |
| `useSQLite.ts` | Access the SQLite database instance set up in `database/` and `providers/` |
| `useTheme.ts` | Read the active theme, once [theme/](../theme/README.md) is implemented |

## How to use them (once implemented)

```tsx
import { useDebounce } from "@/shared/hooks/useDebounce";

const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  // re-run the SQLite search only when debouncedQuery changes
}, [debouncedQuery]);
```

```tsx
import { useSQLite } from "@/shared/hooks/useSQLite";

// Inside a feature's data/ repository, e.g. features/udharo/data/udharo.repository.ts
function useUdharoEntries() {
  const db = useSQLite();
  // db.getAllAsync(...)
}
```

## Notes

- Screens should still never call SQLite directly (Rule 1) — `useSQLite()` is meant to be consumed by a feature's `data/` repository, not by a screen component.
