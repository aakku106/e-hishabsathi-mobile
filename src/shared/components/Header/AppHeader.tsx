import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/providers/ThemeProvider";
import { GlassSurface } from "@/shared/components/Glass/GlassSurface";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { withAlpha } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

type AppHeaderColors = {
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  primary: string;
};

type AppHeaderProps = {
  title: string;
  colors: AppHeaderColors;
  /** Page accent for the title and notification dot. Defaults to `colors.primary`. */
  accentColor?: string;
  /** Shows a back arrow instead of the menu button on stack screens. */
  onBack?: () => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  showNotificationDot?: boolean;
  /**
   * Extends the glass behind the status bar. The screen must not apply its own
   * top safe-area inset when this is enabled (use `edges` without `"top"`).
   */
  edgeToEdge?: boolean;
};

/** Height of the header row, excluding the top padding and bottom border. */
const HEADER_ROW_HEIGHT = 58;

/**
 * Total header height for a given top safe-area inset. Screens that render the
 * header as an overlay over scrolling content use it to offset that content.
 */
export function getAppHeaderHeight(topInset: number): number {
  const topPadding = topInset > 0 ? topInset + Spacing.sm : Spacing.lg;
  return topPadding + HEADER_ROW_HEIGHT + Spacing.sm + BorderWidth.thin;
}

/**
 * Default app header: menu (or back) button on the left, page title pill in
 * the middle, notifications on the right. The glass is tinted with the page's
 * own accent, so each area keeps its identity.
 */
export function AppHeader({
  title,
  colors,
  accentColor,
  onBack,
  onMenuPress,
  onNotificationsPress,
  showNotificationDot = true,
  edgeToEdge = false,
}: AppHeaderProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + Spacing.sm : Spacing.lg;
  const accent = accentColor ?? colors.primary;
  const { textPrimary } = colors;
  const styles = useMemo(() => createStyles({ textPrimary }), [textPrimary]);

  return (
    <GlassSurface
      style={[
        styles.appHeader,
        edgeToEdge && { paddingTop: topPadding },
        {
          borderBottomColor: withAlpha(accent, isDark ? 0.25 : 0.16),
        },
      ]}
      tintColor={withAlpha(accent, isDark ? 0.18 : 0.08)}
      intensity={55}>
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.headerIconButton}
            onPress={onBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={styles.headerIconButton}
            onPress={onMenuPress}>
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={textPrimary}
            />
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.titlePill,
            {
              backgroundColor: withAlpha(accent, isDark ? 0.22 : 0.14),
              borderColor: withAlpha(accent, isDark ? 0.3 : 0.22),
            },
          ]}>
          <Text style={[styles.title, { color: accent }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          style={styles.headerIconButton}
          onPress={onNotificationsPress}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={27}
            color={textPrimary}
          />
          {showNotificationDot && (
            <View style={[styles.notificationDot, { backgroundColor: accent }]} />
          )}
        </TouchableOpacity>
      </View>
    </GlassSurface>
  );
}

function createStyles(colors: Pick<AppHeaderColors, "textPrimary">) {
  return StyleSheet.create({
    appHeader: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
      borderBottomWidth: BorderWidth.thin,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerIconButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
    },
    titlePill: {
      flex: 1,
      marginHorizontal: Spacing.lg,
      minHeight: HEADER_ROW_HEIGHT,
      borderRadius: Radius.pill,
      borderWidth: BorderWidth.thin,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
      textAlign: "center",
    },
    notificationDot: {
      position: "absolute",
      top: 6,
      right: 7,
      width: 9,
      height: 9,
      borderRadius: 5,
    },
  });
}

export default AppHeader;
