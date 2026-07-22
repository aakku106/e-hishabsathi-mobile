import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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

import Dropdown, {
  DropdownOption,
} from "@/shared/components/DatePicker/DropDown";
import { useDashboardData } from "../hooks/useDashboardData";

type ToggleProps = {
  active: string;
  left: string;
  right: string;
  onChange?: (value: string) => void;
};

function Toggle({ active, left, right, onChange }: ToggleProps) {
  const progress = useRef(new Animated.Value(active === left ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active === left ? 0 : 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [active, left, progress]);

  // toggle width matches styles.toggle (196)
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 98],
  });

  return (
    <View style={styles.toggle}>
      <Animated.View
        style={[styles.toggleFill, { transform: [{ translateX }], width: 98 }]}
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

export default function DashboardOverview() {
  const { stats, bars, trend } = useDashboardData();
  const periodOptions: DropdownOption[] = [
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  const [period, setPeriod] = useState<DropdownOption>(periodOptions[0]);

  // UI toggle states
  const [incomeMode, setIncomeMode] = useState<string>("Income");
  const [trendMode, setTrendMode] = useState<string>("Month");

  const chartFade = useRef(new Animated.Value(1)).current;
  const trendFade = useRef(new Animated.Value(1)).current;
  const BAR_CHART_HEIGHT = 220;
  const maxBarValue = Math.max(...bars.map((b) => b.value), 1);
  const formatRs = (v: number) =>
    `Rs. ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  const axisTicks = [
    Math.round(maxBarValue),
    Math.round(maxBarValue * 0.66),
    Math.round(maxBarValue * 0.33),
    Math.round(maxBarValue * 0.16),
    0,
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}>
      <View style={styles.hero}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>DashBoard</Text>
        </View>

        <View style={styles.todayRow}>
          <Dropdown
            options={periodOptions}
            defaultValue={periodOptions[0]}
            placeholder="Select period"
            maxSelectable={1}
            onSelect={(selected) => setPeriod(selected as DropdownOption)}
            bgColor={Colors_DashboardPage.background}
            textColor={Colors_DashboardPage.textPrimary}
            dropdownBgColor={Colors_DashboardPage.background}
            dropdownTextColor={Colors_DashboardPage.textPrimary}
            buttonStyle={{ minWidth: 120 }}
            textStyle={{ fontWeight: FontWeight.bold }}
          />
        </View>

        <View style={styles.cardGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
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
                    {stat.changeType === "up" ? "↑" : "↓"}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.separator} />
      <View style={styles.separatorGap} />

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
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

          {/* AI icon placeholder - replace with provided SVG later (figma ma xa need to export, ask @aakku106 for svg) */}
          <View
            style={styles.floatingButton}
            accessible
            accessibilityLabel="AI action placeholder">
            <View style={styles.floatingIconPlaceholder} />
          </View>
        </View>

        <View style={styles.barChartWrap}>
          <Animated.View
            style={[
              styles.axisLabels,
              { opacity: chartFade, height: BAR_CHART_HEIGHT },
            ]}>
            {axisTicks.map((t) => (
              <Text key={t} style={styles.axisLabel}>
                {formatRs(t)}
              </Text>
            ))}
          </Animated.View>

          <Animated.View
            style={[
              styles.barArea,
              { opacity: chartFade, height: BAR_CHART_HEIGHT },
            ]}>
            {bars.map((bar) => {
              const rawValue =
                incomeMode === "Income" ?
                  bar.value
                : Math.round(bar.value * 0.6);
              const height = Math.max(
                6,
                Math.round((rawValue / maxBarValue) * (BAR_CHART_HEIGHT - 24)),
              );
              return (
                <View key={bar.label} style={styles.barColumn}>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              );
            })}
          </Animated.View>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.trendSection}>
        <View style={{ alignItems: "center" }}>
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

        <Animated.View style={[styles.trendCard, { opacity: trendFade }]}>
          <View style={styles.trendTopRow}>
            <View style={styles.trendValuePill}>
              <Text style={styles.trendValueText}>Rs. 34,430</Text>
            </View>
          </View>

          <View style={styles.trendChart}>
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
          </View>
        </Animated.View>
      </View>

      <View style={styles.bottomGear}>
        <MaterialCommunityIcons name="cog-outline" size={34} color="#E5E7EB" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors_DashboardPage.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing["4xl"],
  },
  hero: {
    alignItems: "center",
    gap: Spacing.md,
  },
  pill: {
    minWidth: 172,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.topBtn,
    borderWidth: BorderWidth.thin,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  todayRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  todayText: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  cardGrid: {
    marginTop: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statCard: {
    width: "48%",
    minHeight: 82,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors_DashboardPage.background,
    borderRadius: Radius.sm,
    position: "relative",
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  statLabel: {
    color: Colors_DashboardPage.textTernary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: 17,
    fontWeight: FontWeight.regular,
  },
  changeBadge: {
    position: "absolute",
    right: Spacing.sm,
    bottom: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  changeBadgeUp: {
    backgroundColor: "#DAF7D1",
  },
  changeBadgeDown: {
    backgroundColor: "#FBD3D3",
  },
  changeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  changeTextUp: {
    color: Colors_DashboardPage.greenPrimary,
  },
  changeTextDown: {
    color: Colors_DashboardPage.redPrimary,
  },
  separator: {
    height: 4,
    backgroundColor: "#111111",
    marginVertical: Spacing.xl,
  },
  spacerPanel: {
    height: 250,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.lg,
  },
  centerBadge: {
    alignSelf: "center",
    backgroundColor: "#D9F6D0",
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#D9F6D0",
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  statBadgeText: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  centerBadgeText: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  chartSection: {
    gap: Spacing.md,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  toggle: {
    width: 196,
    height: 26,
    borderRadius: Radius.pill,
    backgroundColor: "#D8D8D8",
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
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: Colors_DashboardPage.greenPrimary,
  },
  toggleFillLeft: {
    left: 0,
  },
  toggleFillRight: {
    right: 0,
  },
  toggleLabel: {
    width: "50%",
    textAlign: "center",
    fontSize: FontSize.sm,
    color: Colors_DashboardPage.textTernary,
    zIndex: 1,
  },
  toggleLabelActive: {
    color: Colors_DashboardPage.textPrimary,
    fontWeight: FontWeight.medium,
  },
  floatingButton: {
    width: 62,
    height: 62,
    borderRadius: Radius.pill,
    backgroundColor: "#6B6B6B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    position: "absolute",
    right: Spacing.lg,
    top: -10,
  },
  floatingStar: {
    position: "absolute",
    bottom: 16,
    right: 14,
  },
  floatingIconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#D8F82733",
  },
  separatorGap: {
    height: 48,
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
    color: Colors_DashboardPage.greenPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
    width: 40,
    gap: Spacing.xs,
  },
  bar: {
    width: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.greenPrimary,
    minHeight: 6,
    shadowColor: "#2ECC71",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  barLabel: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  trendSection: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  trendCard: {
    height: 280,
    paddingTop: Spacing.md,
  },
  trendTopRow: {
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
  },
  trendValuePill: {
    backgroundColor: "#D9F0D9",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  trendValueText: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  trendChart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#D6D6D6",
    backgroundColor: "#DDEBDD",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  trendColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  trendDot: {
    width: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.greenPrimary,
    opacity: 0.18,
  },
  trendLabel: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: 10,
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
  bottomGear: {
    alignSelf: "flex-end",
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.lg,
    marginRight: Spacing.lg,
  },
});
