import { useMemo, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AppHeader, getAppHeaderHeight } from "@/shared/components/Header/AppHeader";
import { Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { useTheme } from "@/providers/ThemeProvider";

type SettingsPageShellProps = {
  /** Page title shown in the shared app header. */
  title: string;
  colors?: typeof Colors_SettingsPage;
  children: ReactNode;
};

function createStyles(colors: typeof Colors_SettingsPage) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      pointerEvents: "box-none",
    },
    content: {
      flexGrow: 1,
      paddingBottom: Spacing["4xl"],
    },
    card: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
  });
}

/**
 * Shared shell for per-page settings screens (AI button, inventory-only
 * sales, …): translucent app header overlay + scrollable content card.
 */
export function SettingsPageShell({
  title,
  colors: colorsProp,
  children,
}: SettingsPageShellProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const themedColors = useMemo(
    () => getThemedColors(colorsProp ?? Colors_SettingsPage, isDark),
    [colorsProp, isDark],
  );
  const styles = useMemo(() => createStyles(themedColors), [themedColors]);
  const [headerHeight, setHeaderHeight] = useState(() =>
    getAppHeaderHeight(insets.top),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader
          title={title}
          colors={themedColors}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/05-settings");
            }
          }}
          edgeToEdge
          showNotifications={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsPageShell;
