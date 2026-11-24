import { Redirect, Stack } from "expo-router";

import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useAuthStore } from "@/store/auth.store";

export const unstable_settings = {
  // Initial route for the auth stack: the login screen.
  anchor: "login",
};

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const { data: business } = useBusiness();

  // Guests skip the business onboarding flow, so they are let in even when no
  // business profile exists yet.
  if (isHydrated && isAuthenticated && (business || isGuest)) {
    return <Redirect href="/(tabs)/04-dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
