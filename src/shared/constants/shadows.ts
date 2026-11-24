/**
 * React Native 0.88 and react-native-web deprecated the `shadow*` style props
 * (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) in favour of
 * the CSS-like `boxShadow` string. Keep the shadow recipes here so screens
 * don't repeat the same rgba values.
 */

import type { DeviceTier } from "@/shared/utils/deviceTier";

type BoxShadowOptions = {
  /** Horizontal offset in pixels. */
  x?: number;
  /** Vertical offset in pixels. */
  y?: number;
  /** Blur radius in pixels. */
  blur: number;
  /** Spread radius in pixels. */
  spread?: number;
  /** Shadow colour, as `#RRGGBB`, `rgb()` or `rgba()`. */
  color: string;
  /** Alpha applied to `color`, 0 to 1. */
  opacity?: number;
};

/**
 * Adds (or replaces) the alpha channel of a colour.
 * Supports `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb()` and `rgba()`.
 * Returns the colour untouched when it can't be parsed.
 */
export function withAlpha(color: string, alpha: number): string {
  const clamped = Math.min(1, Math.max(0, alpha));
  const hex = color.match(/^#([0-9a-f]{3,8})$/i);

  if (hex) {
    let digits = hex[1];

    if (digits.length === 3 || digits.length === 4) {
      digits = digits
        .slice(0, 3)
        .split("")
        .map((digit) => digit + digit)
        .join("");
    } else if (digits.length === 6 || digits.length === 8) {
      digits = digits.slice(0, 6);
    } else {
      return color;
    }

    const value = parseInt(digits, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${clamped})`;
  }

  const rgb = color.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const [red, green, blue] = rgb[1].split(",").map((part) => part.trim());
    return `rgba(${red}, ${green}, ${blue}, ${clamped})`;
  }

  return color;
}

/**
 * Builds a `boxShadow` value.
 *
 * @example
 * boxShadow: boxShadow({ y: 6, blur: 16, color: "#0F172A", opacity: 0.05 })
 * // "0px 6px 16px rgba(15, 23, 42, 0.05)"
 */
export function boxShadow({
  x = 0,
  y = 0,
  blur,
  spread,
  color,
  opacity = 1,
}: BoxShadowOptions): string {
  const layers = [`${x}px`, `${y}px`, `${blur}px`];
  if (spread) layers.push(`${spread}px`);

  return `${layers.join(" ")} ${withAlpha(color, opacity)}`;
}

/**
 * Shadow budget per device tier: opacity and blur-radius multipliers. Shadows
 * are cheap on paper but the blur is rasterized by the GPU, so older hardware
 * gets a smaller, fainter shadow on every card.
 */
const TIER_SHADOW_SCALE: Record<
  DeviceTier,
  { opacity: number; blur: number }
> = {
  high: { opacity: 1, blur: 1 },
  mid: { opacity: 0.85, blur: 0.8 },
  low: { opacity: 0.7, blur: 0.6 },
};

/**
 * Builds a `boxShadow` value scaled to the device tier.
 *
 * @example
 * const tier = useDeviceTier();
 * // "0px 6px 16px rgba(15, 23, 42, 0.05)" on high-end devices,
 * // "0px 6px 10px rgba(15, 23, 42, 0.035)" on low-end ones.
 * boxShadow: tierBoxShadow(tier, { y: 6, blur: 16, color: "#0F172A", opacity: 0.05 })
 */
export function tierBoxShadow(
  tier: DeviceTier,
  options: BoxShadowOptions,
): string {
  const scale = TIER_SHADOW_SCALE[tier];

  return boxShadow({
    ...options,
    blur: Math.max(0, Math.round(options.blur * scale.blur)),
    opacity: (options.opacity ?? 1) * scale.opacity,
  });
}
