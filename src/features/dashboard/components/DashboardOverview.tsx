import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";

import { USE_NATIVE_DRIVER } from "@/shared/constants/animation";
import { Colors_DashboardPage, getThemedColors } from "@/shared/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { Radius } from "@/shared/constants/radius";
import { boxShadow } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useCopy } from "@/shared/i18n";
import { formatCurrency } from "@/shared/utils/formatter";
import { AppHeader } from "@/shared/components/Header/AppHeader";

import { AIAssistant } from "@/features/ai/components/AIAssistant";
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
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_DashboardPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [progress] = useState(
    () => new Animated.Value(active === left ? 0 : 1),
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active === left ? 0 : 1,
      duration: 260,
      useNativeDriver: USE_NATIVE_DRIVER,
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
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_DashboardPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const {
    stats,
    bars,
    trend,
    isLoading,
    isFetching,
    error,
    databaseReady,
    refetch,
  } = useDashboardData(period);
  // UI toggle states
  const [incomeMode, setIncomeMode] = useState<string>("Income");
  const [trendMode, setTrendMode] = useState<string>("Month");
  const [headerHeight, setHeaderHeight] = useState(0);

  const [chartFade] = useState(() => new Animated.Value(1));
  const [trendFade] = useState(() => new Animated.Value(1));
  // Animated heights for each bar. Kept stable for the lifetime of a dataset
  // so renders never create new Animated.Value objects.
  const barHeights = useMemo(
    () => bars.map((bar) => new Animated.Value(Math.max(6, bar.value * 7))),
    [bars],
  );

  const maxBarAmount = useMemo(
    () => Math.max(0, ...bars.map((bar) => bar.amount)),
    [bars],
  );
  const axisAmounts = useMemo(
    () =>
      [1, 0.75, 0.5, 0.25, 0].map((factor) =>
        Math.round(maxBarAmount * factor),
      ),
    [maxBarAmount],
  );

  const trendPoints = useMemo(
    () =>
      trend.map((point, index) => ({
        x: (index / Math.max(1, trend.length - 1)) * 700,
        y: 142 - (point.value / 68) * 130,
        label: point.label,
      })),
    [trend],
  );
  const trendLine = trendPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const trendArea = trendPoints.length > 0 ? `0,142 ${trendLine} 700,142` : "";
  const bestTrend = useMemo(() => {
    if (trend.length === 0) return null;
    return trend.reduce((best, point) =>
      point.amount > best.amount ? point : best,
    );
  }, [trend]);

  // Animate bars when incomeMode or the underlying data changes
  useEffect(() => {
    const animations = bars.flatMap((bar, i) => {
      const value = barHeights[i];
      if (!value) return [];
      const target =
        (incomeMode === "Income" ? bar.value : Math.round(bar.value * 0.6)) * 7;
      return [
        Animated.timing(value, {
          toValue: Math.max(6, target),
          duration: 360,
          useNativeDriver: false,
        }),
      ];
    });

    if (animations.length > 0) Animated.parallel(animations).start();
  }, [incomeMode, bars, barHeights]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader title={t("Dashboard")} colors={colors} accentColor={colors.greenPrimary} edgeToEdge />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}>
      <View style={styles.todayRow}>
        <Pressable style={styles.periodSelector} onPress={() => setPeriodMenuOpen((open) => !open)}>
          <Text style={styles.todayText}>{t(period === "today" ? "Today" : period === "week" ? "This Week" : period === "month" ? "This Month" : "This Year")}</Text>
          <MaterialCommunityIcons name={periodMenuOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textPrimary} />
        </Pressable>
        {periodMenuOpen && (
          <View style={styles.periodMenu}>
            {(["today", "week", "month", "year"] as DashboardPeriod[]).map((option) => (
              <Pressable key={option} style={[styles.periodOption, period === option && styles.periodOptionActive]} onPress={() => { setPeriod(option); setPeriodMenuOpen(false); }}>
                <Text style={[styles.periodOptionText, period === option && styles.periodOptionTextActive]}>{t(option === "today" ? "Today" : option === "week" ? "This Week" : option === "month" ? "This Month" : "This Year")}</Text>
                {period === option && <MaterialCommunityIcons name="check" size={18} color={colors.greenPrimary} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.cardGrid}>
        {isLoading ?
          <View style={styles.dataStatus}>
            <ActivityIndicator size="small" color={colors.greenPrimary} />
            <Text style={styles.dataStatusText}>
              {t("Loading dashboard data")}
            </Text>
          </View>
        : stats.map((stat) => {
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
                    {stat.change.endsWith("%") ?
                      stat.changeType === "up" ?
                        " ↑"
                      : " ↓"
                    : ""}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        {!!error && (
          <View style={styles.dataError}>
            <Text style={styles.dataErrorText}>
              {t("Dashboard data could not be loaded from the local database.")}
            </Text>
            <Text style={styles.dataErrorDetail}>{error.message}</Text>
            {databaseReady && (
              <TouchableOpacity
                accessibilityRole="button"
                disabled={isFetching}
                onPress={() => void refetch()}
                style={styles.retryButton}>
                <Text style={styles.retryButtonText}>
                  {isFetching ? t("Retrying…") : t("Retry")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
                useNativeDriver: USE_NATIVE_DRIVER,
              }).start(() => {
                setIncomeMode(v);
                Animated.timing(chartFade, {
                  toValue: 1,
                  duration: 220,
                  useNativeDriver: USE_NATIVE_DRIVER,
                }).start();
              });
            }}
          />
        </View>

        <View style={styles.barChartWrap}>
          <Animated.View style={[styles.axisLabels, { opacity: chartFade }]}>
            {axisAmounts.map((amount, index) => (
              <Text key={index} style={styles.axisLabel}>
                {formatCurrency(amount)}
              </Text>
            ))}
          </Animated.View>

          <Animated.View style={[styles.barArea, { opacity: chartFade }]}>
            {bars.map((bar, index) => {
              const animatedHeight = barHeights[index];
              if (!animatedHeight) return null;
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
                useNativeDriver: USE_NATIVE_DRIVER,
              }).start(() => {
                setTrendMode(v);
                Animated.timing(trendFade, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: USE_NATIVE_DRIVER,
                }).start();
              });
            }}
          />
        </View>

        <Animated.View style={[styles.trendChart, { opacity: trendFade }]}>
          {trendPoints.length > 0 ? (
            <Svg width="100%" height="170" viewBox="0 0 700 170">
              <Line x1="0" y1="28" x2="700" y2="28" stroke={colors.border} strokeDasharray="5 5" />
              <Line x1="0" y1="85" x2="700" y2="85" stroke={colors.border} strokeDasharray="5 5" />
              <Line x1="0" y1="142" x2="700" y2="142" stroke={colors.border} strokeDasharray="5 5" />
              <Polygon points={trendArea} fill={colors.surfaceAlt} />
              <Polyline points={trendLine} fill="none" stroke={colors.greenPrimary} strokeWidth="3" />
              {trendPoints.map((point) => (
                <Circle
                  key={`${point.x}-${point.label}`}
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill={colors.greenPrimary}
                  stroke={colors.surface}
                  strokeWidth="2"
                />
              ))}
            </Svg>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.dataStatusText}>{t("No sales data yet")}</Text>
            </View>
          )}
          <View style={styles.trendLabelsRow}>
            {trend.map((point) => <Text key={point.label} style={styles.trendLabel}>{point.label}</Text>)}
          </View>
        </Animated.View>

        <View style={styles.trendValueRow}>
          <Text style={styles.trendValueLabel}>{t("Best month")}</Text>
          <Text style={styles.trendValueText}>
            {bestTrend && bestTrend.amount > 0
              ? `${t(bestTrend.label)} · ${formatCurrency(bestTrend.amount)}`
              : t("No data yet")}
          </Text>
        </View>
      </View>

      </ScrollView>

      <AIAssistant page="dashboard" />
    </View>
  );
}

function createStyles(colors: typeof Colors_DashboardPage) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    pointerEvents: "box-none",
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  periodText: {
    color: colors.greenPrimary,
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
  periodMenu: { position: "absolute", top: 38, left: 0, minWidth: 150, padding: Spacing.xs, backgroundColor: colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, boxShadow: boxShadow({ y: 5, blur: 12, color: "#0F172A", opacity: 0.12 }) },
  periodOption: { minHeight: 40, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodOptionActive: { backgroundColor: colors.surfaceAlt },
  periodOptionText: { color: colors.textPrimary, fontSize: FontSize.sm },
  periodOptionTextActive: { color: colors.greenPrimary, fontWeight: FontWeight.bold },
  todayText: {
    color: colors.textPrimary,
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
  dataStatus: {
    width: "100%",
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  dataStatusText: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
  },
  dataError: {
    width: "100%",
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.redPrimary,
  },
  dataErrorText: {
    color: colors.redPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dataErrorDetail: {
    color: colors.textMuted,
    fontSize: FontSize.xs,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  retryButtonText: {
    color: colors.greenPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statCard: {
    width: "47.5%",
    flexGrow: 1,
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: boxShadow({ y: 6, blur: 12, color: "#0F172A", opacity: 0.04 }),
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
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  statValue: {
    color: colors.textPrimary,
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
    backgroundColor: colors.surfaceAlt,
  },
  changeBadgeDown: {
    backgroundColor: colors.surfaceAlt,
  },
  changeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  changeTextUp: {
    color: colors.greenPrimary,
  },
  changeTextDown: {
    color: colors.redPrimary,
  },
  chartCard: {
    marginTop: Spacing["2xl"],
    marginHorizontal: Spacing.lg,
    backgroundColor: colors.surface,
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
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  toggle: {
    width: 124,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: colors.surfaceAlt,
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
    backgroundColor: colors.surface,
    boxShadow: boxShadow({ y: 2, blur: 6, color: "#0F172A", opacity: 0.12 }),
  },
  toggleLabel: {
    textAlign: "center",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: colors.textMuted,
    zIndex: 1,
  },
  toggleLabelActive: {
    color: colors.textPrimary,
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
    color: colors.textMuted,
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
    backgroundColor: colors.primary,
    minHeight: 6,
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  trendCard: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: colors.surface,
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
  emptyChart: {
    height: 170,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: colors.primarySoft,
  },
  trendLabel: {
    color: colors.textMuted,
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
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  trendValueText: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  });
}
