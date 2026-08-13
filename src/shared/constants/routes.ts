export const Routes = {
  auth: {
    login: "/(auth)/login",
    onboarding: "/(auth)/onboarding",
    businessType: "/(auth)/business-type",
  },
  tabs: {
    sales: "/(tabs)/01-sales",
    purchases: "/(tabs)/02-purchases",
    udharo: "/(tabs)/03-udharo",
    dashboard: "/(tabs)/04-dashboard",
    settings: "/(tabs)/05-settings",
  },
} as const;
