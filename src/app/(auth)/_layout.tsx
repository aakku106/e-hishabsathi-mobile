import { Redirect, Stack } from "expo-router";

import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useAuthStore } from "@/store/auth.store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { data: business } = useBusiness();

  if (isHydrated && isAuthenticated && business) {
    return <Redirect href="/(tabs)/04-dashboard" />;
  }

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
