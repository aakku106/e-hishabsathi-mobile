import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { useDeviceTier } from "@/shared/utils/deviceTier";

type GlassSurfaceProps = {
  style?: StyleProp<ViewStyle>;
  /** Translucent color layered over the blur. Use `withAlpha()` to build it. */
  tintColor?: string;
  /** Blur strength on iOS devices without Liquid Glass. */
  intensity?: number;
  /** Overrides the solid background used by the low tier. */
  fallbackColor?: string;
};

/** Opacity of the solid fallback, by tier (lower = cheaper compositing). */
const SOLID_ALPHA = {
  high: 0.8,
  mid: 0.9,
  low: 0.97,
} as const;

/**
 * Translucent surface used by the header, tab bar, and floating AI button.
 *
 * The effect is picked per device tier so old hardware never pays for glass it
 * cannot render smoothly:
 * - iOS 26+ Liquid Glass -> native `GlassView`.
 * - iOS 17–25 -> native `BlurView` (UIVisualEffectView).
 * - Older iOS, Reduce Transparency, and every Android -> a solid translucent
 *   surface. Android blur needs a `BlurTargetView` around screen content,
 *   which is not worth the cost for chrome that is always on screen.
 */
export function GlassSurface({
  children,
  style,
  tintColor,
  intensity = 65,
  fallbackColor,
}: PropsWithChildren<GlassSurfaceProps>) {
  const { isDark } = useTheme();
  const tier = useDeviceTier();
  const liquidGlass = Platform.OS === "ios" && tier === "high";
  const nativeBlur = Platform.OS === "ios" && tier === "mid";

  const solidBackground =
    fallbackColor ??
    (isDark ?
      `rgba(17, 17, 17, ${SOLID_ALPHA[tier]})`
    : `rgba(255, 255, 255, ${SOLID_ALPHA[tier]})`);

  return (
    <View style={[styles.container, style]}>
      {liquidGlass ?
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme={isDark ? "dark" : "light"}
        />
      : nativeBlur ?
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      : <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: solidBackground },
          ]}
        />
      }

      {!!tintColor && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]}
        />
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

export default GlassSurface;
