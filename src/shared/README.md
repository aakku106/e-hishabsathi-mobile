# shared/

Code that is used by **two or more features**. If only one feature needs it, it stays inside that feature's own folder (Rule 3 in the architecture guide).

This folder never contains SQL, screens, or feature-specific business logic. See [../doc/guide0.0.1-alpha.1.md](../../doc/guide0.0.1-alpha.1.md) for the full architecture.

### Folders and files

| Path | Purpose | Status |
| --- | --- | --- |
| [components/](./components/README.md) | Reusable UI shared across features | Partially implemented; see component index |
| [constants/](./constants/README.md) | Page-specific colors, typography, spacing, radius, routes, business types | Implemented |
| [hooks/](./hooks/README.md) | Reusable hooks (`useTheme`, `useDebounce`, `useKeyboard`, `useSQLite`) | Implemented |
| [theme/](./theme/README.md) | Future global theme tokens | Reserved; theme mode currently lives in `providers/ThemeProvider` |
| [types/](./types/README.md) | Global TypeScript interfaces shared by multiple features | Empty; no shared types yet |
| [utils/](./utils/README.md) | Currency, date, formatting, logging, validation, UUID helpers | Implemented |
| `i18n.ts` | English/Nepali copy lookup and the `useCopy()` hook | Implemented |

### How to use shared/ code

Import with the `@/shared/...` path alias, same as everywhere else in the app:

```tsx
import { Colors_SalesPage } from "@/shared/constants/colors";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
```

### Rules that apply to this folder

- Only put a component/hook/util here if **more than one feature** uses it. One-off UI stays inside the feature's own `components/` folder.
- Never hardcode page colors, spacing, or typography in a feature component — pull tokens from `constants/`.
- Business data (sales, inventory, credit, tax) never lives here — that belongs in `database/` and each feature's `data/` layer.

> [!WARNING]
> Any `t.ts` or `track.ts` file you see inside these folders is a git-tracking placeholder only. Never write to them — see the warning at the top of the architecture guide.
