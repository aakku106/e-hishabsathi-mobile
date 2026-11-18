# GlassSurface

`GlassSurface.tsx` exports `GlassSurface`, the shared translucent surface used by the header, floating AI button, and glass navigation treatments.

## Status

Implemented.

## What it does

- Renders a native iOS 26+ Liquid Glass material with `GlassView` from `expo-glass-effect`.
- Falls back to `BlurView` from `expo-blur` on other platforms.
- Layers an optional translucent `tintColor` over the glass so callers can make a green-tinted header or button.
- Clips the effect to the caller's `borderRadius` through `overflow: "hidden"`.

## Props

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | no | — |
| `style` | `StyleProp<ViewStyle>` | no | — |
| `tintColor` | `string` | no | — |
| `intensity` | `number` | no | `65` |

## How to use it

```tsx
import { GlassSurface } from "@/shared/components/Glass/GlassSurface";
import { withAlpha } from "@/shared/constants/shadows";

<GlassSurface
  style={{ borderRadius: 24, padding: 16 }}
  tintColor={withAlpha("#059669", 0.12)}
  intensity={60}>
  <Text>Glass content</Text>
</GlassSurface>
```

## Notes

- `tintColor` should already include alpha; `withAlpha()` from `constants/shadows` handles hex, `rgb()`, and `rgba()` inputs.
- On Android, `BlurView` without a `BlurTargetView` renders a semi-transparent surface rather than a live blur. This is an intentional fallback.
- The default export is also `GlassSurface`.
