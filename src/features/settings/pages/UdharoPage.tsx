import { useMemo } from "react";
import { Alert, View } from "react-native";

import { Colors_NavBar, Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { useTheme } from "@/providers/ThemeProvider";
import { useCopy } from "@/shared/i18n";
import { hapticSelection, hapticSuccess } from "@/shared/utils/haptics";
import { persistAiAssistant, persistRecent } from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

export default function UdharoPage() {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { aiAssistant, setAiAssistant, recent, setRecent } = useSettingsStore();

  const handleAiToggle = (enabled: boolean) => {
    hapticSelection();
    setAiAssistant("udharo", enabled);
    void persistAiAssistant("udharo", enabled);
  };

  const handleRecentToggle = (enabled: boolean) => {
    hapticSelection();
    setRecent("udharo", enabled);
    void persistRecent("udharo", enabled);
  };

  const handleResetToDefault = () => {
    hapticSelection();
    Alert.alert(
      t("Reset to default"),
      t("This restores the default settings for this page."),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Reset"),
          style: "destructive",
          onPress: () => {
            setAiAssistant("udharo", true);
            void persistAiAssistant("udharo", true);
            setRecent("udharo", true);
            void persistRecent("udharo", true);
            hapticSuccess();
          },
        },
      ],
    );
  };

  return (
    <SettingsPageShell
      title={t("Udharo")}
      accent={Colors_NavBar.selected.udharo}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI assistant")}
          hint={t("Show the floating AI button on this page")}
          value={aiAssistant.udharo}
          onValueChange={handleAiToggle}
          colors={colors}
          accent={Colors_NavBar.selected.udharo}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("Show recent udharo")}
          hint={t("Show the recent udharo list on this page")}
          value={recent.udharo}
          onValueChange={handleRecentToggle}
          colors={colors}
          accent={Colors_NavBar.selected.udharo}
        />
        <PrimaryButton
          title={t("Reset to default")}
          onPress={handleResetToDefault}
          gradient={["#E11D48", "#9F1239"]}
          style={styles.resetButton}
        />
      </View>
    </SettingsPageShell>
  );
}

function createStyles(colors: typeof Colors_SettingsPage) {
  return {
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    rowDivider: {
      height: BorderWidth.thin,
      backgroundColor: colors.border,
    },
    resetButton: {
      marginTop: Spacing.sm,
    },
  };
}
