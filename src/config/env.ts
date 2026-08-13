import Constants from "expo-constants";

export const ENV = {
  isDev: __DEV__,
  appName: Constants.expoConfig?.name ?? "E-HishabSathi",
  appVersion: Constants.expoConfig?.version ?? "0.0.1-alpha.1",
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "https://api.e-hishabsathi.com/api/v1",
  enableAiChat: process.env.EXPO_PUBLIC_ENABLE_AI === "true",
} as const;
