import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";

type GlassSurfaceProps = {
  style?: StyleProp<ViewStyle>;
  /** Translucent color layered over the blur. Use `withAlpha()` to build it. */
  tintColor?: string;
  /** Blur strength on platforms without native Liquid Glass. */
  intensity?: number;
};

/**
 * Translucent surface used by the header, tab bar, and floating AI button.
 * iOS 26+ renders the native Liquid Glass material; other platforms fall back
 * to `expo-blur` (Android degrades to a semi-transparent surface).
 */
export function GlassSurface({
  children,
  style,
  tintColor,
  intensity = 65,
}: PropsWithChildren<GlassSurfaceProps>) {
  const { isDark } = useTheme();
  const useLiquidGlass =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  return (
    <View style={[styles.container, style]}>
      {useLiquidGlass ?
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme={isDark ? "dark" : "light"}
        />
      : <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
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
