# shared/components/

Reusable UI components used by two or more features (Rule 3 — feature-only UI stays inside that feature's own `components/` folder).

Every component lives in its own `PascalCase` folder matching the component name.

### Components

| Component | Status | Docs |
| --- | --- | --- |
| Button | Implemented (`PrimaryButton`) | [Button/README.md](./Button/README.md) |
| Input | Implemented (`LabeledInput`) | [Input/README.md](./Input/README.md) |
| DatePicker | Implemented (`Dropdown`, not a date picker) | [DatePicker/README.md](./DatePicker/README.md) |
| Header | Implemented (`AppHeader` default, `PageHeader` legacy) | [Header/README.md](./Header/README.md) |
| Glass | Implemented (`GlassSurface`) | [Glass/README.md](./Glass/README.md) |
| ProductPicker | Implemented (`ProductPicker`) | [ProductPicker/README.md](./ProductPicker/README.md) |
| TabBar | Implemented (`CustomTabBar`, `SwipeableTabScreen`) | [TabBar/README.md](./TabBar/README.md) |
| BottomSheet | Not yet implemented; folder contains only its README | [BottomSheet/README.md](./BottomSheet/README.md) |
| Card | Not yet implemented; folder contains only its README | [Card/README.md](./Card/README.md) |
| CurrencyInput | Not yet implemented; folder contains only its README | [CurrencyInput/README.md](./CurrencyInput/README.md) |
| EmptyState | Not yet implemented; folder contains only its README | [EmptyState/README.md](./EmptyState/README.md) |
| Loading | Not yet implemented; folder contains only its README | [Loading/README.md](./Loading/README.md) |
| Modal | Not yet implemented; folder contains only its README | [Modal/README.md](./Modal/README.md) |
| SearchBar | Not yet implemented; folder contains only its README | [SearchBar/README.md](./SearchBar/README.md) |

### Pattern used by implemented components

- Accept an `onPress` / `onChangeText` / `onSelect`-style callback plus the value being displayed (`title`, `label`, `options`, ...).
- Accept `style` / `textStyle` (or similarly named) overrides so a screen can tweak layout without forking the component.
- Some components pull defaults from page tokens; others expose color props with neutral defaults. Pass the active page palette explicitly when the component should follow the page identity.

Example:

```tsx
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { Colors_UdharoPage } from "@/shared/constants/colors";

<PrimaryButton
  title="Add Entry"
  gradient={[Colors_UdharoPage.primary, Colors_UdharoPage.primaryDeep]}
  onPress={handleAddEntry}
/>
```

> [!WARNING]
> Any `t.ts` / `track.ts` file inside a component folder is a git-tracking placeholder only (see the warning at the top of the architecture guide). Never edit it, and don't treat its presence as an implementation.
