import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors_NavBar } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
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

const ROUTE_SOFT_MAP: Record<string, string> = {
  "01-sales": "#D1FAE5",
  "02-purchases": "#FEF3C7",
  "03-udharo": "#FFE4E6",
  "04-dashboard": "#E0E7FF",
  "05-settings": "#DBEAFE",
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
  return (
    <View style={styles.outerContainer}>
      <View style={styles.navBar}>
        {state.routes.map((route: TabRoute, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label = t(
            typeof options.tabBarLabel === "string" ? options.tabBarLabel
            : options.title !== undefined ? options.title
            : route.name,
          );

          const colorKey = ROUTE_COLOR_MAP[route.name];
          const activeColor = colorKey ? Colors_NavBar.selected[colorKey] : "#4F46E5";
          const softColor = ROUTE_SOFT_MAP[route.name] ?? "#EEF2FF";

          const iconName: keyof typeof MaterialCommunityIcons.glyphMap =
            (isFocused
              ? ROUTE_ICON_ACTIVE_MAP[route.name]
              : ROUTE_ICON_MAP[route.name]) ?? "circle-outline";

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
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
    maxWidth: Layout.maxContentWidth,
    alignSelf: "center",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors_NavBar.barBackground,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: BorderWidth.thin,
    borderColor: Colors_NavBar.barBorder,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
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
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
  labelActive: {
    fontWeight: FontWeight.semibold,
  },
});

export default CustomTabBar;
