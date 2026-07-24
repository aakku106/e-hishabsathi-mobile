# shared/

Code that is used by **two or more features**. If only one feature needs it, it stays inside that feature's own folder (Rule 3 in the architecture guide).

This folder never contains SQL, screens, or feature-specific business logic. See [../doc/guide0.0.1-alpha.1.md](../../doc/guide0.0.1-alpha.1.md) for the full architecture.

### Folders

| Folder | Purpose | Status |
| --- | --- | --- |
| [components/](./components/README.md) | Reusable UI shared across features (buttons, inputs, tab bar, ...) | Partially implemented |
| [constants/](./constants/README.md) | Page-specific colors, typography, spacing, radius, routes, business types | Implemented |
| [hooks/](./hooks/README.md) | Reusable hooks (`useTheme`, `useDebounce`, `useKeyboard`, `useSQLite`) | Not yet implemented |
| [theme/](./theme/README.md) | Global theme configuration (colors/typography/spacing/dark mode) | Not yet implemented |
| [types/](./types/README.md) | Global TypeScript interfaces shared by multiple features | Not yet implemented |
| [utils/](./utils/README.md) | Reusable helper functions (currency, date, formatting, logging, validation) | Not yet implemented |

> [!NOTE]
> The `types/` folder is currently named `" types"` on disk (with a leading space) instead of `types`. It still works with editors/tools, but `@/shared/types` imports will not resolve until it's renamed. See [types/README.md](./types/README.md).

### How to use shared/ code

Import with the `@/shared/...` path alias, same as everywhere else in the app:

```tsx
import { Colors_SalesPage } from "@/shared/constants/colors";
import TopButton from "@/shared/components/Button/TopButton";
```

### Rules that apply to this folder

- Only put a component/hook/util here if **more than one feature** uses it. One-off UI stays inside the feature's own `components/` folder.
- Never hardcode colors, spacing, or typography in a component — pull tokens from `constants/` (or `theme/` once implemented).
- Business data (sales, inventory, credit, tax) never lives here — that belongs in `database/` and each feature's `data/` layer.

> [!WARNING]
> Any `t.ts` or `track.ts` file you see inside these folders is a git-tracking placeholder only. Never write to them — see the warning at the top of the architecture guide.
