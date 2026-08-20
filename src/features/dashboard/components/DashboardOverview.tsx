import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";

import { Colors_DashboardPage } from "@/shared/constants/colors";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useCopy } from "@/shared/i18n";

import AIOverlay from "@/features/ai/components/AIOverlay";
import { useDashboardData } from "../hooks/useDashboardData";
import type { DashboardPeriod } from "../data/dashboard.repository";

type ToggleProps = {
  active: string;
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
  onChange?: (value: string) => void;
};

function Toggle({ active, left, right, leftLabel = left, rightLabel = right, onChange }: ToggleProps) {
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
          {leftLabel}
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
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardOverview() {
  const { t } = useCopy();
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const { stats, bars, trend } = useDashboardData(period);
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
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
      <View style={styles.appHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconButton} accessibilityLabel="Open menu">
            <MaterialCommunityIcons name="menu" size={28} color={Colors_DashboardPage.textPrimary} />
          </TouchableOpacity>
          <View style={styles.dashboardPill}>
            <Text style={styles.brandName}>{t("Dashboard")}</Text>
          </View>
          <TouchableOpacity style={styles.headerIconButton} accessibilityLabel="Open notifications">
            <MaterialCommunityIcons name="bell-outline" size={27} color={Colors_DashboardPage.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.todayRow}>
        <Pressable style={styles.periodSelector} onPress={() => setPeriodMenuOpen((open) => !open)}>
          <Text style={styles.todayText}>{t(period === "today" ? "Today" : period === "week" ? "This Week" : period === "month" ? "This Month" : "This Year")}</Text>
          <MaterialCommunityIcons name={periodMenuOpen ? "chevron-up" : "chevron-down"} size={20} color={Colors_DashboardPage.textPrimary} />
        </Pressable>
        {periodMenuOpen && (
          <View style={styles.periodMenu}>
            {(["today", "week", "month", "year"] as DashboardPeriod[]).map((option) => (
              <Pressable key={option} style={[styles.periodOption, period === option && styles.periodOptionActive]} onPress={() => { setPeriod(option); setPeriodMenuOpen(false); }}>
                <Text style={[styles.periodOptionText, period === option && styles.periodOptionTextActive]}>{t(option === "today" ? "Today" : option === "week" ? "This Week" : option === "month" ? "This Month" : "This Year")}</Text>
                {period === option && <MaterialCommunityIcons name="check" size={18} color={Colors_DashboardPage.greenPrimary} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.cardGrid}>
        {stats.map((stat) => {
          return (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statBody}>
                <Text style={styles.statLabel}>{t(stat.label)}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>

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
          <Text style={styles.chartTitle}>{t("Income vs Spend")}</Text>
          <Toggle
            active={incomeMode}
            left="Income"
            right="Spend"
            leftLabel={t("Income")}
            rightLabel={t("Spend")}
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
          <Text style={styles.chartTitle}>{t("Business Trend")}</Text>
          <Toggle
            active={trendMode}
            left="Month"
            right="Year"
            leftLabel={t("Month")}
            rightLabel={t("Year")}
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
          <Svg width="100%" height="170" viewBox="0 0 700 170">
            <Line x1="0" y1="28" x2="700" y2="28" stroke="#DDE8DF" strokeDasharray="5 5" />
            <Line x1="0" y1="85" x2="700" y2="85" stroke="#DDE8DF" strokeDasharray="5 5" />
            <Line x1="0" y1="142" x2="700" y2="142" stroke="#DDE8DF" strokeDasharray="5 5" />
            <Polygon points="0,75 116,112 233,137 350,91 466,67 583,34 700,94 700,142 0,142" fill="#E4F3E6" />
            <Polyline points="0,75 116,112 233,137 350,91 466,67 583,34 700,94" fill="none" stroke="#159447" strokeWidth="3" />
            {[{ x: 0, y: 75 }, { x: 116, y: 112 }, { x: 233, y: 137 }, { x: 350, y: 91 }, { x: 466, y: 67 }, { x: 583, y: 34 }, { x: 700, y: 94 }].map((point) => (
              <Circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="6" fill="#159447" stroke="#FFFFFF" strokeWidth="2" />
            ))}
          </Svg>
          <View style={styles.trendLabelsRow}>
            {trend.map((point) => <Text key={point.label} style={styles.trendLabel}>{point.label}</Text>)}
          </View>
        </Animated.View>

        <View style={styles.trendValueRow}>
          <Text style={styles.trendValueLabel}>Best month</Text>
          <Text style={styles.trendValueText}>Rs. 34,430</Text>
        </View>
      </View>

      </ScrollView>

      <TouchableOpacity
        style={styles.floatingAIButton}
        accessibilityLabel="Open AI Assistant"
        activeOpacity={0.85}
        onPress={() => setShowAI(true)}
      >
        <MaterialCommunityIcons name="creation-outline" size={24} color="#FFFFFF" />
        <Text style={styles.floatingAIText}>AI</Text>
      </TouchableOpacity>

      {showAI && (
        <AIOverlay visible={showAI} onClose={() => setShowAI(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: Colors_DashboardPage.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  floatingAIButton: {
    position: "absolute",
    right: Spacing.lg,
    bottom: 92,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors_DashboardPage.greenPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  floatingAIText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeight.bold,
    marginTop: -2,
  },
  appHeader: {
    backgroundColor: Colors_DashboardPage.surface,
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
  brandName: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  dashboardPill: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    minHeight: 58,
    borderRadius: Radius.pill,
    backgroundColor: "#EAF8EC",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors_DashboardPage.greenPrimary,
  },
  periodRow: {
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  periodButton: {
    minWidth: 238,
    minHeight: 46,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "#CDECCF",
    backgroundColor: "#EAF8EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  periodText: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  todayRow: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    position: "relative",
    zIndex: 5,
  },
  periodSelector: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingVertical: Spacing.xs },
  periodMenu: { position: "absolute", top: 38, left: 0, minWidth: 150, padding: Spacing.xs, backgroundColor: Colors_DashboardPage.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors_DashboardPage.border, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  periodOption: { minHeight: 40, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodOptionActive: { backgroundColor: "#EAF8EC" },
  periodOptionText: { color: Colors_DashboardPage.textPrimary, fontSize: FontSize.sm },
  periodOptionTextActive: { color: Colors_DashboardPage.greenPrimary, fontWeight: FontWeight.bold },
  todayText: {
    color: Colors_DashboardPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
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
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47.5%",
    flexGrow: 1,
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors_DashboardPage.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "#F0F2F1",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
  },
  statBody: {
    flex: 1,
    gap: Spacing.sm,
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
    letterSpacing: 0,
  },
  changeBadge: {
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
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
    marginTop: Spacing["2xl"],
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors_DashboardPage.surface,
    borderTopWidth: 1,
    borderTopColor: "#E7ECE8",
    paddingTop: Spacing.lg,
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
    borderTopWidth: 1,
    borderTopColor: "#E7ECE8",
    paddingTop: Spacing.lg,
  },
  trendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  trendChart: {
    height: 195,
    paddingTop: Spacing.sm,
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
  trendLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: -22,
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
