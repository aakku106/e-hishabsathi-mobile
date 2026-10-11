import { SafeAreaView } from "react-native";

import { Colors_DashboardPage, getThemedColors } from "@/shared/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import DashboardOverview from "./components/DashboardOverview";

export default function DashboardScreen() {
  const { isDark } = useTheme();
  const colors = getThemedColors(Colors_DashboardPage, isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <DashboardOverview />
    </SafeAreaView>
  );
}
