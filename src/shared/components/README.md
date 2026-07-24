# shared/components/

Reusable UI components used by two or more features (Rule 3 — feature-only UI stays inside that feature's own `components/` folder).

Every component lives in its own `PascalCase` folder matching the component name.

### Components

| Component | Status | Docs |
| --- | --- | --- |
| Button | Implemented (`TopButton`) | [Button/README.md](./Button/README.md) |
| Input | Implemented (`LabeledInput`) | [Input/README.md](./Input/README.md) |
| DatePicker | Implemented (`Dropdown`) | [DatePicker/README.md](./DatePicker/README.md) |
| TabBar | Implemented (`CustomTabBar`) | [TabBar/README.md](./TabBar/README.md) |
| BottomSheet | Not yet implemented | [BottomSheet/README.md](./BottomSheet/README.md) |
| Card | Not yet implemented | [Card/README.md](./Card/README.md) |
| CurrencyInput | Not yet implemented | [CurrencyInput/README.md](./CurrencyInput/README.md) |
| EmptyState | Not yet implemented | [EmptyState/README.md](./EmptyState/README.md) |
| Header | Not yet implemented | [Header/README.md](./Header/README.md) |
| Loading | Not yet implemented | [Loading/README.md](./Loading/README.md) |
| Modal | Not yet implemented | [Modal/README.md](./Modal/README.md) |
| SearchBar | Not yet implemented | [SearchBar/README.md](./SearchBar/README.md) |

### Pattern used by implemented components

- Accept an `onPress` / `onChangeText` / `onSelect`-style callback plus the value being displayed (`title`, `label`, `options`, ...).
- Accept `style` / `textStyle` (or similarly named) overrides so a screen can tweak layout without forking the component.
- Pull default colors from a page token set in `@/shared/constants/colors` (e.g. `Colors_SalesPage`) and let the caller override it with a color prop (e.g. `labelColor`, `bgColor`).

Example:

```tsx
import TopButton from "@/shared/components/Button/TopButton";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<TopButton
  title="Add Entry"
  onPress={handleAddEntry}
  style={{ backgroundColor: Colors_UdharoPage.topBtn }}
/>
```

> [!WARNING]
> Every `t.ts` / `track.ts` file inside a component folder is a git-tracking placeholder only (see the warning at the top of the architecture guide). Never edit it, and don't treat its presence as an implementation.
