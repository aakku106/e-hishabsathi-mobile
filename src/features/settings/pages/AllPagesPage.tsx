import { useMemo } from "react";
import { Alert, View } from "react-native";

import { Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { useTheme } from "@/providers/ThemeProvider";
import { useCopy } from "@/shared/i18n";
import { hapticSelection, hapticSuccess } from "@/shared/utils/haptics";
import { persistAiVoiceEntry } from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

/**
 * Settings shared by every page. Today that is the AI voice entry button, which
 * appears on the Sales, Buy and Udharo forms.
 */
export default function AllPagesPage() {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { aiVoiceEntry, setAiVoiceEntry } = useSettingsStore();

  const handleVoiceToggle = (enabled: boolean) => {
    hapticSelection();
    setAiVoiceEntry(enabled);
    void persistAiVoiceEntry(enabled);
  };

  const handleResetToDefault = () => {
    hapticSelection();
    Alert.alert(
      t("Reset to default"),
      t("This restores the default settings shared by every page"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Reset"),
          style: "destructive",
          onPress: () => {
            setAiVoiceEntry(true);
            void persistAiVoiceEntry(true);
            hapticSuccess();
          },
        },
      ],
    );
  };

  return (
    <SettingsPageShell title={t("All pages")}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI voice entry")}
          hint={t("Show the AI voice button on the Sales, Buy and Udharo forms")}
          value={aiVoiceEntry}
          onValueChange={handleVoiceToggle}
          colors={colors}
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
