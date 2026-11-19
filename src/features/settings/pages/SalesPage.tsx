import { useMemo } from "react";
import { View } from "react-native";

import { Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { useTheme } from "@/providers/ThemeProvider";
import { useCopy } from "@/shared/i18n";
import { hapticSelection } from "@/shared/utils/haptics";
import { persistAiAssistant, persistSalesStrictInventory } from "@/lib/hydration";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsPageShell } from "@/features/settings/components/SettingsPageShell";
import { SettingsToggleRow } from "@/features/settings/components/SettingsToggleRow";

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
    salesStrictInventory,
    setSalesStrictInventory,
  } = useSettingsStore();

  const handleAiToggle = (enabled: boolean) => {
    hapticSelection();
    setAiAssistant("sales", enabled);
    void persistAiAssistant("sales", enabled);
  };

  const handleStrictInventoryChange = (enabled: boolean) => {
    hapticSelection();
    setSalesStrictInventory(enabled);
    void persistSalesStrictInventory(enabled);
  };

  return (
    <SettingsPageShell title={t("Sales")}>
      <View style={styles.card}>
        <SettingsToggleRow
          label={t("AI assistant")}
          hint={t("Show the floating AI button on this page")}
          value={aiAssistant.sales}
          onValueChange={handleAiToggle}
          colors={colors}
        />
        <View style={styles.rowDivider} />
        <SettingsToggleRow
          label={t("Only sell inventory items")}
          hint={t("Sales must use products that already exist in Inventory")}
          value={salesStrictInventory}
          onValueChange={handleStrictInventoryChange}
          colors={colors}
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
  };
}
