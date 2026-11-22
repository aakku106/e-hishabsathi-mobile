import * as Device from "expo-device";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * Device capability tiers used to pick a visual budget that stays smooth on
 * old hardware.
 *
 * - `high`: iOS 26+ Liquid Glass, or Android 13+ with 5 GB+ RAM.
 * - `mid`: iOS 17–25, or Android 11–12 (and newer devices with less RAM).
 * - `low`: iOS 16.x, Android 10 and below, low-RAM Androids (≤ 3 GB), and any
 *   device with Reduce Transparency enabled.
 */
export type DeviceTier = "high" | "mid" | "low";

/** Android 11. */
const ANDROID_MID_API = 30;
/** Android 13 — the high tier also needs enough RAM. */
const ANDROID_HIGH_API = 33;
/**
 * Reported total memory is slightly below the marketed RAM (a 6 GB phone
 * reports ~5.7 GB), so compare against 5 GB rather than 6 GB.
 */
const HIGH_RAM_BYTES = 5 * 1024 ** 3;
/** Devices at or below 3 GB are treated as low-end. */
const LOW_RAM_BYTES = 3 * 1024 ** 3;

/** iOS 26 ships the Liquid Glass APIs. */
const IOS_GLASS_VERSION = 26;
/** iOS 17–25 still blur natively (UIVisualEffectView) without a big cost. */
const IOS_BLUR_VERSION = 17;

export function resolveDeviceTier(reduceTransparency: boolean): DeviceTier {
  if (Platform.OS === "ios") {
    if (reduceTransparency) return "low";

    const iosVersion = Number.parseFloat(String(Platform.Version));
    if (
      iosVersion >= IOS_GLASS_VERSION &&
      isLiquidGlassAvailable() &&
      isGlassEffectAPIAvailable()
    ) {
      return "high";
    }
    return iosVersion >= IOS_BLUR_VERSION ? "mid" : "low";
  }

  if (Platform.OS === "android") {
    const api =
      typeof Platform.Version === "number" ?
        Platform.Version
      : Number.parseInt(String(Platform.Version), 10);
    const ram = Device.totalMemory ?? 0;

    // High-end Android needs both a recent OS and enough RAM; this keeps
    // Android Go / budget phones on the cheaper tiers even on Android 14+.
    if (api >= ANDROID_HIGH_API && ram >= HIGH_RAM_BYTES) {
      return "high";
    }
    if (api < ANDROID_MID_API || (ram > 0 && ram < LOW_RAM_BYTES)) {
      return "low";
    }
    return "mid";
  }

  // Web and anything else: cheapest visuals.
  return "low";
}

/**
 * Resolves the device tier and keeps it current when iOS Reduce Transparency
 * changes. The first frame assumes the setting is off; the async check settles
 * before the first interaction.
 */
export function useDeviceTier(): DeviceTier {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;

    // `isReduceTransparencyEnabled` is iOS-only; react-native-web omits it.
    const check =
      typeof AccessibilityInfo.isReduceTransparencyEnabled === "function" ?
        AccessibilityInfo.isReduceTransparencyEnabled()
      : Promise.resolve(false);

    void check
      .then((enabled) => {
        if (mounted) setReduceTransparency(enabled);
      })
      .catch(() => {
        // Keep the default when the platform cannot report it.
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return useMemo(
    () => resolveDeviceTier(reduceTransparency),
    [reduceTransparency],
  );
}
