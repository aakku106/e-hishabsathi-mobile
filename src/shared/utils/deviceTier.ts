import * as Device from "expo-device";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { useSyncExternalStore } from "react";
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

function getIosVersion(): number {
  return Number.parseFloat(String(Platform.Version));
}

function getAndroidApi(): number {
  return typeof Platform.Version === "number" ?
      Platform.Version
    : Number.parseInt(String(Platform.Version), 10);
}

export function resolveDeviceTier(reduceTransparency: boolean): DeviceTier {
  if (Platform.OS === "ios") {
    if (reduceTransparency) return "low";

    const iosVersion = getIosVersion();
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
    const api = getAndroidApi();
    const ram = Device.totalMemory ?? 0;

    // High-end Android needs both a recent OS and enough RAM; this keeps
    // Android Go / budget phones on the cheaper tiers even on Android 14+.
    if (api >= ANDROID_HIGH_API && ram >= HIGH_RAM_BYTES) {
      return "high";
    }
    if (api < ANDROID_MID_API || (ram > 0 && ram <= LOW_RAM_BYTES)) {
      return "low";
    }
    return "mid";
  }

  // Web and anything else: cheapest visuals.
  return "low";
}

/**
 * One shared snapshot for the whole app: every header, card, and row reads the
 * same tier without each component adding its own AccessibilityInfo listener.
 * The tier is resolved lazily and cached until Reduce Transparency changes.
 */
let reduceTransparency = false;
let cachedTier: DeviceTier | null = null;
let transparencyCheck: Promise<void> | null = null;
const listeners = new Set<() => void>();

/** Current tier, also usable outside React (for example during hydration). */
export function getDeviceTierSnapshot(): DeviceTier {
  cachedTier ??= resolveDeviceTier(reduceTransparency);
  return cachedTier;
}

function publish(enabled: boolean) {
  if (enabled === reduceTransparency) return;

  reduceTransparency = enabled;
  cachedTier = null;
  for (const listener of listeners) listener();
}

/**
 * Starts the one shared Reduce Transparency check/listener and resolves when
 * the initial check has settled.
 */
function ensureTransparencyCheck(): Promise<void> {
  if (transparencyCheck) return transparencyCheck;

  // `isReduceTransparencyEnabled` is iOS-only; react-native-web omits it.
  const check =
    typeof AccessibilityInfo.isReduceTransparencyEnabled === "function" ?
      AccessibilityInfo.isReduceTransparencyEnabled()
    : Promise.resolve(false);

  transparencyCheck = check
    .then((enabled) => publish(enabled))
    .catch(() => {
      // Keep the default when the platform cannot report it.
    });

  AccessibilityInfo.addEventListener("reduceTransparencyChanged", publish);

  return transparencyCheck;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureTransparencyCheck();

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Resolves the tier after the Reduce Transparency check settles. Used at
 * startup for tier-dependent defaults such as horizontal tab swiping.
 */
export async function resolveDeviceTierForDefaults(): Promise<DeviceTier> {
  await ensureTransparencyCheck();
  return getDeviceTierSnapshot();
}

/**
 * Returns the device tier and re-renders when iOS Reduce Transparency changes.
 * The first frame assumes the setting is off; the async check settles before
 * the first interaction.
 */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    subscribe,
    getDeviceTierSnapshot,
    getDeviceTierSnapshot,
  );
}

/** Diagnostics shown on the Settings page, mirroring the tier inputs. */
export type DeviceTierInfo = {
  tier: DeviceTier;
  /** e.g. `"iOS 18.2"` or `"Android 14 (API 34)"`. */
  os: string;
  /** Device model name, or `"Unknown"` when the platform does not report one. */
  model: string;
  /** Reported total RAM in bytes, or `null` when unavailable. */
  totalMemory: number | null;
  /** Liquid Glass APIs are usable (iOS 26+ only). */
  liquidGlass: boolean;
  /** iOS Reduce Transparency setting (always `false` elsewhere). */
  reduceTransparency: boolean;
  /** Short explanation of why the tier resolved this way. */
  reason: string;
};

export function getDeviceTierInfo(): DeviceTierInfo {
  const tier = getDeviceTierSnapshot();
  const totalMemory = Device.totalMemory ?? null;
  const model = Device.modelName ?? Device.deviceName ?? "Unknown";
  const iosVersion = getIosVersion();
  const api = getAndroidApi();
  const liquidGlass =
    Platform.OS === "ios" &&
    iosVersion >= IOS_GLASS_VERSION &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  let os: string = Platform.OS;
  if (Platform.OS === "ios") {
    os = `iOS ${String(Platform.Version)}`;
  } else if (Platform.OS === "android") {
    os = `Android ${Device.osVersion ?? String(api)} (API ${api})`;
  }

  return {
    tier,
    os,
    model,
    totalMemory,
    liquidGlass,
    reduceTransparency,
    reason: describeTier({ tier, iosVersion, api, totalMemory, liquidGlass }),
  };
}

function describeTier({
  tier,
  iosVersion,
  api,
  totalMemory,
  liquidGlass,
}: {
  tier: DeviceTier;
  iosVersion: number;
  api: number;
  totalMemory: number | null;
  liquidGlass: boolean;
}): string {
  if (Platform.OS === "ios") {
    if (reduceTransparency) {
      return "Reduce Transparency is on, so glass effects are disabled.";
    }
    if (iosVersion >= IOS_GLASS_VERSION) {
      return liquidGlass ?
          "iOS 26+ with Liquid Glass."
        : "iOS 26, but the Liquid Glass APIs are unavailable.";
    }
    if (iosVersion >= IOS_BLUR_VERSION) {
      return "iOS 17–25: native blur instead of Liquid Glass.";
    }
    return "iOS 16 or older: solid translucent surfaces.";
  }

  if (Platform.OS === "android") {
    if (tier === "high") {
      return "Android 13+ with 5 GB+ RAM.";
    }
    if (api < ANDROID_MID_API) {
      return `Android API ${api} is below 30.`;
    }
    if (totalMemory !== null && totalMemory > 0 && totalMemory <= LOW_RAM_BYTES) {
      return "3 GB RAM or less.";
    }
    if (api >= ANDROID_HIGH_API) {
      return "Android 13+, but under 5 GB RAM.";
    }
    return "Android 11–12: mid-range budget.";
  }

  return "Web preview uses the lowest visual budget.";
}
