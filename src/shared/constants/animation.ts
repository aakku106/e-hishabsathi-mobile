import { Platform } from "react-native";

/**
 * react-native-web has no native animated module, so `useNativeDriver: true`
 * logs "Animated: `useNativeDriver` is not supported..." and falls back to
 * JS-based animation. Use this flag so web stays quiet and native keeps the
 * native driver.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== "web";
