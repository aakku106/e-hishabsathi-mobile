import { useMemo } from "react";
import { SafeAreaView } from "react-native";

import { AIAssistant } from "@/features/ai/components/AIAssistant";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_UdharoPage, getThemedColors } from "@/shared/constants/colors";
import { useCopy } from "@/shared/i18n";
import { useTheme } from "@/providers/ThemeProvider";
import UdharoEntryForm from "./components/UdharoEntryForm";

export default function UdharoScreen() {
  const { isDark } = useTheme();
  const { t } = useCopy();
  const colors = useMemo(
    () => getThemedColors(Colors_UdharoPage, isDark),
    [isDark],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title={t("Udharo")} colors={colors} />
      <UdharoEntryForm />
      <AIAssistant />
    </SafeAreaView>
  );
}
