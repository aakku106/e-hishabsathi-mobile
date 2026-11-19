import { useMemo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Colors_SettingsPage } from "@/shared/constants/colors";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

type SettingsToggleRowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: typeof Colors_SettingsPage;
  /** Page accent used for the label and switch; defaults to the settings palette. */
  accent?: string;
};

function createStyles(colors: typeof Colors_SettingsPage) {
  return StyleSheet.create({
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.md,
    },
    settingTextWrap: {
      flex: 1,
      gap: 2,
    },
    settingLabel: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    settingHint: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.regular,
    },
  });
}

/**
 * Label + helper text + switch row used by the per-page settings screens
 * (for example the AI button toggle or the inventory-only sales rule).
 */
export function SettingsToggleRow({
  label,
  hint,
  value,
  onValueChange,
  colors,
  accent,
}: SettingsToggleRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingLabel, { color: accent ?? colors.textPrimary }]}>
          {label}
        </Text>
        {!!hint && (
          <Text
            style={[styles.settingHint, { color: accent ?? colors.textMuted }]}>
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        trackColor={{ false: colors.border, true: accent ?? colors.primary }}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

export default SettingsToggleRow;
