import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AIAssistant } from "@/features/ai/components/AIAssistant";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_UdharoPage, getThemedColors } from "@/shared/constants/colors";
import { Spacing } from "@/shared/constants/spacing";
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
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom", "left", "right"]}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader title={t("Udharo")} colors={colors} edgeToEdge />
      </View>

      <UdharoEntryForm contentPaddingTop={headerHeight + Spacing.lg} />
      <AIAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    pointerEvents: "box-none",
  },
});
