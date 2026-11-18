import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Radius } from "@/shared/constants/radius";
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
  const accent = accentColor ?? colors.primary;
  const { surface, surfaceAlt, textPrimary } = colors;
  const styles = useMemo(
    () => createStyles({ surface, surfaceAlt, textPrimary }),
    [surface, surfaceAlt, textPrimary],
  );

  return (
    <View style={styles.appHeader}>
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

        <View style={styles.titlePill}>
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
    </View>
  );
}

function createStyles(
  colors: Pick<AppHeaderColors, "surface" | "surfaceAlt" | "textPrimary">,
) {
  return StyleSheet.create({
    appHeader: {
      backgroundColor: colors.surface,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
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
      backgroundColor: colors.surfaceAlt,
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
