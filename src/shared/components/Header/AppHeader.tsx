import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { GlassSurface } from "@/shared/components/Glass/GlassSurface";
import { getAccentColor } from "@/shared/constants/colors";
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
};

/**
 * Default app header: menu (or back) button on the left, page title pill in
 * the middle, notifications on the right. Each page supplies its own accent.
 */
export function AppHeader({
  title,
  colors,
  accentColor,
  onBack,
  onMenuPress,
  onNotificationsPress,
  showNotificationDot = true,
}: AppHeaderProps) {
  const { isDark } = useTheme();
  const accent = accentColor ?? colors.primary;
  const accentGreen = getAccentColor(isDark);
  const { textPrimary } = colors;
  const styles = useMemo(() => createStyles({ textPrimary }), [textPrimary]);

  return (
    <GlassSurface
      style={[
        styles.appHeader,
        {
          borderBottomColor: withAlpha(accentGreen, isDark ? 0.22 : 0.14),
        },
      ]}
      tintColor={withAlpha(accentGreen, isDark ? 0.2 : 0.12)}
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
              backgroundColor: withAlpha(
                accentGreen,
                isDark ? 0.2 : 0.12,
              ),
              borderColor: withAlpha(accentGreen, isDark ? 0.28 : 0.18),
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
      minHeight: 58,
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
