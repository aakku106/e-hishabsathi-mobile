import { SafeAreaView } from "react-native";

import { Colors_UdharoPage, getThemedColors } from "@/shared/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import UdharoEntryForm from "./components/UdharoEntryForm";

export default function UdharoScreen() {
  const { isDark } = useTheme();
  const colors = getThemedColors(Colors_UdharoPage, isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <UdharoEntryForm />
    </SafeAreaView>
  );
}
