import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors_NavBar } from "@/shared/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { boxShadow } from "@/shared/constants/shadows";
import { Layout, Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useCopy } from "@/shared/i18n";

type TabRoute = {
  key: string;
  name: string;
};

// Mapping route names to the keys used in Colors_NavBar.selected
const ROUTE_COLOR_MAP: Record<string, keyof typeof Colors_NavBar.selected> = {
  "01-sales": "sales",
  "02-purchases": "buy",
  "03-udharo": "udharo",
  "04-dashboard": "dashBoard",
  "05-settings": "settings",
};

// Translucent tints so the active pill works on top of the glass surface.
const ROUTE_SOFT_MAP: Record<string, string> = {
  "01-sales": "rgba(16, 185, 129, 0.16)",
  "02-purchases": "rgba(255, 90, 0, 0.14)",
  "03-udharo": "rgba(244, 63, 94, 0.14)",
  "04-dashboard": "rgba(99, 102, 241, 0.16)",
  "05-settings": "rgba(59, 130, 246, 0.16)",
};

// Icons per tab route
const ROUTE_ICON_MAP: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  "01-sales": "rhombus-outline",
  "02-purchases": "circle-outline",
  "03-udharo": "triangle-outline",
  "04-dashboard": "view-dashboard-outline",
  "05-settings": "cog-outline",
};

const ROUTE_ICON_ACTIVE_MAP: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  "01-sales": "rhombus",
  "02-purchases": "circle",
  "03-udharo": "triangle",
  "04-dashboard": "view-dashboard",
  "05-settings": "cog",
};

export const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(isDark), [isDark]);

  // iOS 26+ gets the native liquid-glass material. Other platforms use a
  // translucent blur (Android falls back to a semi-transparent surface).
  const useLiquidGlass =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const tabs = state.routes.map((route: TabRoute, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const label = t(
      typeof options.tabBarLabel === "string" ? options.tabBarLabel
      : options.title !== undefined ? options.title
      : route.name,
    );

    const colorKey = ROUTE_COLOR_MAP[route.name];
    const activeColor = colorKey ? Colors_NavBar.selected[colorKey] : "#4F46E5";
    const softColor =
      isDark ? "rgba(255, 255, 255, 0.1)" : (
        (ROUTE_SOFT_MAP[route.name] ?? "rgba(99, 102, 241, 0.16)")
      );

    const iconName: keyof typeof MaterialCommunityIcons.glyphMap =
      (isFocused ? ROUTE_ICON_ACTIVE_MAP[route.name] : ROUTE_ICON_MAP[route.name]) ??
      "circle-outline";

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.tabItem, isFocused && { backgroundColor: softColor }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={isFocused ? activeColor : Colors_NavBar.inactive}
          />
        </View>

        <Text
          style={[
            styles.label,
            { color: isFocused ? activeColor : Colors_NavBar.inactive },
            isFocused && styles.labelActive,
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.navBarShadow}>
        {useLiquidGlass ?
          <GlassView
            style={styles.navBar}
            glassEffectStyle="regular"
            colorScheme={isDark ? "dark" : "light"}>
            {tabs}
          </GlassView>
        : <BlurView
            intensity={isDark ? 60 : 75}
            tint={isDark ? "dark" : "light"}
            style={styles.navBar}>
            {tabs}
          </BlurView>
        }
      </View>
    </View>
  );
};

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    outerContainer: {
      position: "absolute",
      bottom: Spacing.xl,
      left: Spacing.lg,
      right: Spacing.lg,
      alignItems: "center",
      maxWidth: Layout.maxContentWidth,
      alignSelf: "center",
    },
    navBarShadow: {
      width: "100%",
      borderRadius: Radius.xl,
      backgroundColor: isDark ? "rgba(17, 17, 17, 0.01)" : "rgba(255, 255, 255, 0.01)",
      boxShadow: boxShadow({ y: 10, blur: 24, color: "#0F172A", opacity: 0.12 }),
    },
    navBar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderWidth: BorderWidth.thin,
      borderColor:
        isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.7)",
      overflow: "hidden",
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.xs,
      borderRadius: Radius.md,
      gap: 2,
    },
    iconContainer: {
      width: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: FontSize.xs,
      lineHeight: 16,
      fontWeight: FontWeight.medium,
      textAlign: "center",
      letterSpacing: 0.5,
      flexShrink: 1,
    },
    labelActive: {
      fontWeight: FontWeight.semibold,
    },
  });
}

export default CustomTabBar;
