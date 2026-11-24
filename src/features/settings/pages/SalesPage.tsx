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
import { persistAiAssistant, persistRecent, persistSalesStrictInventory } from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";
import { persistSetting } from "@/features/settings/utils/persistSetting";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";

export default function SalesPage() {
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
    recent,
    setRecent,
    salesStrictInventory,
    setSalesStrictInventory,
  } = useSettingsStore();

  const showSaveError = () => {
    hapticError();
    notify(t("Could not save the setting"), t("Please try again."));
  };

  const handleAiToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: aiAssistant.sales,
      next: enabled,
      apply: (value) => setAiAssistant("sales", value),
      persist: (value) => persistAiAssistant("sales", value),
    });
    if (!saved) showSaveError();
  };

  const handleStrictInventoryChange = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: salesStrictInventory,
      next: enabled,
      apply: setSalesStrictInventory,
      persist: persistSalesStrictInventory,
    });
    if (!saved) showSaveError();
  };

  const handleRecentToggle = async (enabled: boolean) => {
    hapticSelection();
    const saved = await persistSetting({
      previous: recent.sales,
      next: enabled,
      apply: (value) => setRecent("sales", value),
      persist: (value) => persistRecent("sales", value),
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
            previous: salesStrictInventory,
            next: true,
            apply: setSalesStrictInventory,
            persist: persistSalesStrictInventory,
          }),
          persistSetting({
            previous: aiAssistant.sales,
            next: true,
            apply: (value) => setAiAssistant("sales", value),
            persist: (value) => persistAiAssistant("sales", value),
          }),
          persistSetting({
            previous: recent.sales,
            next: true,
            apply: (value) => setRecent("sales", value),
            persist: (value) => persistRecent("sales", value),
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
      title={t("Sales")}
      accent={Colors_NavBar.selected.sales}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI assistant")}
          hint={t("Show the floating AI button on this page")}
          value={aiAssistant.sales}
          onValueChange={handleAiToggle}
          colors={colors}
          accent={Colors_NavBar.selected.sales}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("Only sell inventory items")}
          hint={t("Sales must use products that already exist in Inventory")}
          value={salesStrictInventory}
          onValueChange={handleStrictInventoryChange}
          colors={colors}
          accent={Colors_NavBar.selected.sales}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("Show recent sales")}
          hint={t("Show the recent sales list on this page")}
          value={recent.sales}
          onValueChange={handleRecentToggle}
          colors={colors}
          accent={Colors_NavBar.selected.sales}
        />
        <PrimaryButton
          title={t("Reset to default")}
          onPress={handleResetToDefault}
          gradient={["#059669", "#047857"]}
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
