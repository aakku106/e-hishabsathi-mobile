import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabRoute = {
  key: string;
  name: string;
};

type TabBarState = {
  index: number;
  routes: TabRoute[];
};

type TabDescriptor = {
  options: {
    tabBarLabel?: string | ((props: any) => React.ReactNode);
    title?: string;
  };
};

type TabBarNavigation = {
  emit: (event: {
    type: string;
    target: string;
    canPreventDefault: boolean;
  }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
};

import { Colors_NavBar } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Layout, Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

// Mapping route names to the keys used in Colors_NavBar.selected
const ROUTE_COLOR_MAP: Record<string, keyof typeof Colors_NavBar.selected> = {
  "01-sales": "sales",
  "02-purchases": "buy",
  "03-udharo": "udharo",
  "04-dashboard": "dashBoard",
  "05-settings": "settings",
};

// Placeholder SVG slot component — swap with your actual SVG icons/paths from assets <figma bata import garna bakixa>
const IconPlaceholder: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 24,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 4,
      backgroundColor: color,
    }}
  />
);

export const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.navBar}>
        {state.routes.map((route: TabRoute, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string" ? options.tabBarLabel
            : options.title !== undefined ? options.title
            : route.name;

          const colorKey = ROUTE_COLOR_MAP[route.name];
          const activeColor =
            colorKey ? Colors_NavBar.selected[colorKey] : "#FFFFFF";
          const unselectedColor = "rgba(255, 255, 255, 0.7)";
          const itemColor = isFocused ? activeColor : unselectedColor;

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
              style={[styles.tabItem, isFocused && styles.activeTabHighlight]}>
              {/* Icon Slot */}
              <View style={styles.iconContainer}>
                <IconPlaceholder color={itemColor} />
              </View>

              {/* Title Label */}
              <Text style={[styles.label, { color: itemColor }]}>{label}</Text>
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
    backgroundColor: "rgba(80, 80, 80, 0.75)",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderWidth: BorderWidth.thin,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.pill,
    gap: Spacing.xxs,
  },
  activeTabHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
});

export default CustomTabBar;
