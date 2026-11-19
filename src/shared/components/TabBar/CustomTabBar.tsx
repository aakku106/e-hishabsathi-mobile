import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import React from "react";
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors_NavBar } from "@/shared/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { boxShadow } from "@/shared/constants/shadows";
import { Layout, Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useCopy } from "@/shared/i18n";
import { hapticSelection } from "@/shared/utils/haptics";

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

const DEFAULT_SOFT_COLOR = "rgba(99, 102, 241, 0.16)";
const DARK_SOFT_COLOR = "rgba(255, 255, 255, 0.1)";

// A soft spring: the pill settles without a distracting bounce.
const PILL_SPRING = { damping: 25, stiffness: 200, mass: 1 } as const;
const PILL_COLOR_DURATION = 180;

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

export const CustomTabBar = ({ state, descriptors, emitter, navigateToTab }: any) => {
  const { t } = useCopy();
  const { isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(isDark), [isDark]);

  // iOS 26+ gets the native liquid-glass material. Other platforms use a
  // translucent blur (Android falls back to a semi-transparent surface).
  const useLiquidGlass =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const routeCount = state.routes.length;
  const activeIndex = state.index;
  const activeRouteName = state.routes[activeIndex]?.name;

  const activePillColor = isDark
    ? DARK_SOFT_COLOR
    : (ROUTE_SOFT_MAP[activeRouteName] ?? DEFAULT_SOFT_COLOR);

  // Every tab is `flex: 1`, so the row width divided by the route count is
  // both the pill width and the distance it travels per tab.
  const [rowWidth, setRowWidth] = React.useState(0);
  const itemWidth = routeCount > 0 ? rowWidth / routeCount : 0;

  const pillX = useSharedValue(0);
  const pillColor = useSharedValue(activePillColor);
  const hasPositioned = React.useRef(false);

  // Place the pill under the active tab as soon as the row is measured, so it
  // never paints at the wrong end of the bar on the first frame.
  const onRowLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setRowWidth(width);

    if (!hasPositioned.current && routeCount > 0 && width > 0) {
      hasPositioned.current = true;
      pillX.value = activeIndex * (width / routeCount);
      pillColor.value = activePillColor;
    }
  };

  // Afterwards the pill springs to the newly focused tab and cross-fades to
  // that tab's tint instead of teleporting.
  React.useEffect(() => {
    if (!hasPositioned.current || itemWidth === 0) return;

    pillX.value = withSpring(activeIndex * itemWidth, PILL_SPRING);
    pillColor.value = withTiming(activePillColor, {
      duration: PILL_COLOR_DURATION,
    });
  }, [activeIndex, activePillColor, itemWidth, pillColor, pillX]);

  const pillAnimatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: pillColor.value,
      transform: [{ translateX: pillX.value }],
    }),
    [pillColor, pillX],
  );

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

    const iconName: keyof typeof MaterialCommunityIcons.glyphMap =
      (isFocused ? ROUTE_ICON_ACTIVE_MAP[route.name] : ROUTE_ICON_MAP[route.name]) ??
      "circle-outline";

    const onPress = () => {
      const event = emitter.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        hapticSelection();
        navigateToTab(route.key);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.tabItem}>
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

  const tabsRow = (
    <View style={styles.tabsRow} onLayout={onRowLayout}>
      <Animated.View
        style={[styles.activePill, { width: itemWidth }, pillAnimatedStyle]}
      />
      {tabs}
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.navBarShadow}>
        {useLiquidGlass ?
          <GlassView
            style={styles.navBar}
            glassEffectStyle="regular"
            colorScheme={isDark ? "dark" : "light"}>
            {tabsRow}
          </GlassView>
        : <BlurView
            intensity={isDark ? 60 : 75}
            tint={isDark ? "dark" : "light"}
            style={styles.navBar}>
            {tabsRow}
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
    tabsRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
    },
    // Single shared pill that slides between tabs instead of one background
    // per tab; `pointerEvents` lives in the style for react-native-web.
    activePill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      borderRadius: Radius.md,
      pointerEvents: "none",
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
