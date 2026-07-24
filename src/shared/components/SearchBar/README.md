# SearchBar

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared search input (magnifier icon + text field + clear button), typically paired with `useDebounce` (see [hooks/README.md](../../hooks/README.md)) so a feature's list-filter hook isn't re-querying SQLite on every keystroke.

## Suggested shape

```tsx
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
```

```tsx
import SearchBar from "@/shared/components/SearchBar/SearchBar";
import { useDebounce } from "@/shared/hooks/useDebounce";

const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

<SearchBar value={query} onChangeText={setQuery} placeholder="Search udharo..." />
```
