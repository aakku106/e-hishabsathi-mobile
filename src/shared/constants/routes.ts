export const Routes = {
  auth: {
    login: "/(auth)/login",
    register: "/(auth)/register",
  },
  tabs: {
    sales: "/(tabs)/01-sales",
    buy: "/(tabs)/02-buy",
    udharo: "/(tabs)/03-udharo",
    dashboard: "/(tabs)/04-dashboard",
  },
} as const;
