import { useMemo } from "react";
import { View } from "react-native";

import { Colors_NavBar, Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { useTheme } from "@/providers/ThemeProvider";
import { useCopy } from "@/shared/i18n";
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
} from "@/shared/utils/haptics";
import { confirmAction, notify } from "@/shared/utils/dialogs";
import { persistAiAssistant } from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";
import { persistSetting } from "@/features/settings/utils/persistSetting";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

export default function DashboardPage() {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { aiAssistant, setAiAssistant } = useSettingsStore();

  const handleAiToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: aiAssistant.dashboard,
      next: enabled,
      apply: (value) => setAiAssistant("dashboard", value),
      persist: (value) => persistAiAssistant("dashboard", value),
    });
    if (!saved) {
      hapticError();
      notify(t("Could not save the setting"), t("Please try again."));
    }
  };

  const handleResetToDefault = () => {
    hapticSelection();
    confirmAction({
      title: t("Reset to default"),
      message: t("This restores the default settings for this page"),
      confirmLabel: t("Reset"),
      cancelLabel: t("Cancel"),
      destructive: true,
      onConfirm: async () => {
        const saved = await persistSetting({
          previous: aiAssistant.dashboard,
          next: true,
          apply: (value) => setAiAssistant("dashboard", value),
          persist: (value) => persistAiAssistant("dashboard", value),
        });
        if (saved) {
          hapticSuccess();
        } else {
          hapticError();
          notify(t("Could not save the setting"), t("Please try again."));
        }
      },
    });
  };

  return (
    <SettingsPageShell
      title={t("Dashboard")}
      accent={Colors_NavBar.selected.dashBoard}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI assistant")}
          hint={t("Show the floating AI button on this page")}
          value={aiAssistant.dashboard}
          onValueChange={handleAiToggle}
          colors={colors}
          accent={Colors_NavBar.selected.dashBoard}
        />
        <PrimaryButton
          title={t("Reset to default")}
          onPress={handleResetToDefault}
          gradient={["#4F46E5", "#3730A3"]}
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
    resetButton: {
      marginTop: Spacing.sm,
    },
  };
}
