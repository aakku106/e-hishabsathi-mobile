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
import {
  persistAiAssistant,
  persistAiVoiceEntry,
  persistRecent,
} from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";
import { persistSetting } from "@/features/settings/utils/persistSetting";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

export default function BuyPage() {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    aiAssistant,
    setAiAssistant,
    aiVoiceEntry,
    setAiVoiceEntry,
    recent,
    setRecent,
  } = useSettingsStore();

  const showSaveError = () => {
    hapticError();
    notify(t("Could not save the setting"), t("Please try again."));
  };

  const handleAiToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: aiAssistant.buy,
      next: enabled,
      apply: (value) => setAiAssistant("buy", value),
      persist: (value) => persistAiAssistant("buy", value),
    });
    if (!saved) showSaveError();
  };

  const handleRecentToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: recent.buy,
      next: enabled,
      apply: (value) => setRecent("buy", value),
      persist: (value) => persistRecent("buy", value),
    });
    if (!saved) showSaveError();
  };

  const handleVoiceEntryToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: aiVoiceEntry.buy,
      next: enabled,
      apply: (value) => setAiVoiceEntry("buy", value),
      persist: (value) => persistAiVoiceEntry("buy", value),
    });
    if (!saved) showSaveError();
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
        const results = await Promise.all([
          persistSetting({
            previous: aiAssistant.buy,
            next: true,
            apply: (value) => setAiAssistant("buy", value),
            persist: (value) => persistAiAssistant("buy", value),
          }),
          persistSetting({
            previous: aiVoiceEntry.buy,
            next: true,
            apply: (value) => setAiVoiceEntry("buy", value),
            persist: (value) => persistAiVoiceEntry("buy", value),
          }),
          persistSetting({
            previous: recent.buy,
            next: true,
            apply: (value) => setRecent("buy", value),
            persist: (value) => persistRecent("buy", value),
          }),
        ]);
        if (results.every(Boolean)) {
          hapticSuccess();
        } else {
          showSaveError();
        }
      },
    });
  };

  return (
    <SettingsPageShell
      title={t("Buy")}
      accent={Colors_NavBar.selected.buy}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI assistant")}
          hint={t("Show the floating AI button on this page")}
          value={aiAssistant.buy}
          onValueChange={handleAiToggle}
          colors={colors}
          accent={Colors_NavBar.selected.buy}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("AI voice entry")}
          hint={t("Show the AI Voice button on this form")}
          value={aiVoiceEntry.buy}
          onValueChange={handleVoiceEntryToggle}
          colors={colors}
          accent={Colors_NavBar.selected.buy}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("Show recent buys")}
          hint={t("Show the recent buys list on this page")}
          value={recent.buy}
          onValueChange={handleRecentToggle}
          colors={colors}
          accent={Colors_NavBar.selected.buy}
        />
        <PrimaryButton
          title={t("Reset to default")}
          onPress={handleResetToDefault}
          gradient={["#B45309", "#92400E"]}
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
