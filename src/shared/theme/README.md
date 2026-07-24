# shared/theme/

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

Per the architecture guide, `theme/` is meant to hold global theme configuration: colors, typography, spacing, and dark mode support.

Right now the project uses the **page-specific token pattern** documented in [constants/README.md](../constants/README.md) instead (`Colors_SalesPage`, `Colors_UdharoPage`, etc.) — each screen owns its own visual identity rather than pulling from one shared light/dark theme.

If the app later moves to a single shared theme (e.g. to support a real dark-mode toggle instead of per-page colors), it belongs here, structured roughly as:

```
theme/
    colors.ts       # light + dark palettes
    typography.ts
    spacing.ts
    index.ts        # exports the active theme, e.g. via useColorScheme()
```

```tsx
// Hypothetical usage once implemented
import { useTheme } from "@/shared/hooks/useTheme";

const theme = useTheme();
<View style={{ backgroundColor: theme.colors.background }} />
```

Until this exists, keep using the page token sets in [constants/](../constants/README.md).
