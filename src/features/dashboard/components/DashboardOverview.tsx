import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors_DashboardPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import AIOverlay from "@/features/ai/components/AIOverlay";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { Dropdown, type DropdownOption } from "@/shared/components/DatePicker/DropDown";
import { useDashboardData } from "../hooks/useDashboardData";

type ToggleProps = {
  active: string;
  left: string;
  right: string;
  onChange?: (value: string) => void;
};

function Toggle({ active, left, right, onChange }: ToggleProps) {
  const [progress] = useState(
    () => new Animated.Value(active === left ? 0 : 1),
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active === left ? 0 : 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [active, left, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 62],
  });

  return (
    <View style={styles.toggle}>
      <Animated.View
        style={[styles.toggleFill, { transform: [{ translateX }], width: 62 }]}
      />

      <TouchableOpacity
        style={styles.toggleHalf}
        activeOpacity={0.8}
        onPress={() => onChange?.(left)}>
        <Text
          style={[
            styles.toggleLabel,
            active === left && styles.toggleLabelActive,
          ]}>
          {left}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleHalf}
        activeOpacity={0.8}
        onPress={() => onChange?.(right)}>
        <Text
          style={[
            styles.toggleLabel,
            active === right && styles.toggleLabelActive,
          ]}>
          {right}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const STAT_ICONS: Record<string, { icon: string; tint: string; soft: string }> = {
  "Total Sells": {
    icon: "cash-multiple",
    tint: "#059669",
    soft: "#D1FAE5",
  },
  "Products sold": {
    icon: "shopping-outline",
    tint: "#4F46E5",
    soft: "#E0E7FF",
  },
  Customers: {
    icon: "account-group-outline",
    tint: "#0284C7",
    soft: "#E0F2FE",
  },
  Profit: {
    icon: "trending-up",
    tint: "#7C3AED",
    soft: "#EDE9FE",
  },
};

const DEFAULT_STAT_STYLE = {
  icon: "chart-box-outline",
  tint: "#4F46E5",
  soft: "#E0E7FF",
};

export default function DashboardOverview() {
  const { stats, bars, trend } = useDashboardData();
  const periodOptions: DropdownOption[] = [
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  // UI toggle states
  const [incomeMode, setIncomeMode] = useState<string>("Income");
  const [trendMode, setTrendMode] = useState<string>("Month");
  const [showAI, setShowAI] = useState(false);

  const [chartFade] = useState(() => new Animated.Value(1));
  const [trendFade] = useState(() => new Animated.Value(1));
  // Animated heights for each bar
  const [barHeights] = useState(() =>
    bars.map((b) => new Animated.Value(Math.max(6, b.value * 7))),
  );

  // Animate bars when incomeMode or the underlying data changes
  useEffect(() => {
    const animations = bars.map((bar, i) => {
      const target =
        (incomeMode === "Income" ? bar.value : Math.round(bar.value * 0.6)) * 7;
      const value = barHeights[i] ?? new Animated.Value(6);
      return Animated.timing(value, {
        toValue: Math.max(6, target),
        duration: 360,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [incomeMode, bars, barHeights]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <PageHeader
        title="Dashboard"
        subtitle="Your business at a glance"
        gradient={[Colors_DashboardPage.heroTop, Colors_DashboardPage.heroBottom]}
        right={
          <TouchableOpacity
            style={styles.aiButton}
            accessible
            accessibilityLabel="Open AI assistant"
            activeOpacity={0.85}
            onPress={() => setShowAI(true)}>
            <MaterialCommunityIcons
              name="creation"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        }>
        <View style={styles.periodRow}>
          <Dropdown
            options={periodOptions}
            defaultValue={periodOptions[0]}
            placeholder="Select period"
            maxSelectable={1}
            bgColor="rgba(255,255,255,0.12)"
            textColor="#FFFFFF"
            borderColor="rgba(255,255,255,0.22)"
            dropdownBgColor="#FFFFFF"
            dropdownTextColor="#0F172A"
            buttonStyle={styles.periodButton}
            textStyle={{ fontWeight: FontWeight.semibold }}
          />
        </View>
      </PageHeader>

      <View style={styles.cardGrid}>
        {stats.map((stat) => {
          const preset = STAT_ICONS[stat.label] ?? DEFAULT_STAT_STYLE;
          return (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: preset.soft }]}>
                <MaterialCommunityIcons
                  name={preset.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                  color={preset.tint}
                />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>

              {!!stat.change && (
                <View
                  style={[
                    styles.changeBadge,
                    stat.changeType === "up" ?
                      styles.changeBadgeUp
                    : styles.changeBadgeDown,
                  ]}>
                  <Text
                    style={[
                      styles.changeText,
                      stat.changeType === "up" ?
                        styles.changeTextUp
                      : styles.changeTextDown,
                    ]}>
                    {stat.change}
                    {stat.changeType === "up" ? " ↑" : " ↓"}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {incomeMode === "Income" ? "Income" : "Spending"}
          </Text>
          <Toggle
            active={incomeMode}
            left="Income"
            right="Spend"
            onChange={(v) => {
              Animated.timing(chartFade, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
              }).start(() => {
                setIncomeMode(v);
                Animated.timing(chartFade, {
                  toValue: 1,
                  duration: 220,
                  useNativeDriver: true,
                }).start();
              });
            }}
          />
        </View>

        <View style={styles.barChartWrap}>
          <Animated.View style={[styles.axisLabels, { opacity: chartFade }]}>
            <Text style={styles.axisLabel}>Rs. 30,000</Text>
            <Text style={styles.axisLabel}>Rs. 20,000</Text>
            <Text style={styles.axisLabel}>Rs. 10,000</Text>
            <Text style={styles.axisLabel}>Rs. 5,000</Text>
            <Text style={styles.axisLabel}>Rs.0</Text>
          </Animated.View>

          <Animated.View style={[styles.barArea, { opacity: chartFade }]}>
            {bars.map((bar, index) => {
              const animatedHeight =
                barHeights[index] ?? new Animated.Value(6);
              return (
                <View key={bar.label} style={styles.barColumn}>
                  <Animated.View
                    style={[styles.bar, { height: animatedHeight }]}
                  />
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              );
            })}
          </Animated.View>
        </View>
      </View>

      <View style={styles.trendCard}>
        <View style={styles.trendTopRow}>
          <Text style={styles.chartTitle}>Trend</Text>
          <Toggle
            active={trendMode}
            left="Month"
            right="Year"
            onChange={(v) => {
              Animated.timing(trendFade, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
              }).start(() => {
                setTrendMode(v);
                Animated.timing(trendFade, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              });
            }}
          />
        </View>

        <Animated.View style={[styles.trendChart, { opacity: trendFade }]}>
          {trend.map((point, index) => {
            const heights =
              trendMode === "Month" ?
                [52, 72, 82, 60, 58, 24, 48]
              : [32, 42, 62, 40, 38, 14, 28];
            return (
              <View key={point.label} style={styles.trendColumn}>
                <View style={[styles.trendDot, { height: heights[index] }]} />
                <Text style={styles.trendLabel}>{point.label}</Text>
              </View>
            );
          })}
        </Animated.View>

        <View style={styles.trendValueRow}>
          <Text style={styles.trendValueLabel}>Best month</Text>
          <Text style={styles.trendValueText}>Rs. 34,430</Text>
        </View>
      </View>

      {showAI && (
        <AIOverlay visible={showAI} onClose={() => setShowAI(false)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors_DashboardPage.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
  },
  periodRow: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  periodButton: {
    minWidth: 140,
    minHeight: 42,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.thin,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardGrid: {
    marginTop: -Spacing.xl,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: Colors_DashboardPage.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    color: Colors_DashboardPage.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  statValue: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  changeBadge: {
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  changeBadgeUp: {
    backgroundColor: "#D1FAE5",
  },
  changeBadgeDown: {
    backgroundColor: "#FEE2E2",
  },
  changeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  changeTextUp: {
    color: Colors_DashboardPage.greenPrimary,
  },
  changeTextDown: {
    color: Colors_DashboardPage.redPrimary,
  },
  chartCard: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors_DashboardPage.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  toggle: {
    width: 124,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  toggleHalf: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleFill: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.surface,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleLabel: {
    textAlign: "center",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors_DashboardPage.textMuted,
    zIndex: 1,
  },
  toggleLabelActive: {
    color: Colors_DashboardPage.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  barChartWrap: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-end",
    paddingTop: Spacing.md,
  },
  axisLabels: {
    width: 72,
    justifyContent: "space-between",
    height: 176,
    paddingTop: 8,
  },
  axisLabel: {
    color: Colors_DashboardPage.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  barArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 176,
    paddingBottom: 8,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 28,
    gap: Spacing.xs,
  },
  bar: {
    width: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.primary,
    minHeight: 6,
  },
  barLabel: {
    color: Colors_DashboardPage.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  trendCard: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors_DashboardPage.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  trendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  trendChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    borderBottomWidth: 1,
    borderBottomColor: Colors_DashboardPage.border,
    paddingBottom: Spacing.xs,
  },
  trendColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  trendDot: {
    width: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.primarySoft,
  },
  trendLabel: {
    color: Colors_DashboardPage.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
  trendValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  trendValueLabel: {
    color: Colors_DashboardPage.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  trendValueText: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
