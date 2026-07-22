import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Colors_DashboardPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import { useDashboardData } from "../hooks/useDashboardData";

type ToggleProps = {
  active: string;
  left: string;
  right: string;
};

function Toggle({ active, left, right }: ToggleProps) {
  const leftActive = active === left;

  return (
    <View style={styles.toggle}>
      <View
        style={[
          styles.toggleFill,
          leftActive ? styles.toggleFillLeft : styles.toggleFillRight,
        ]}
      />
      <Text
        style={[styles.toggleLabel, leftActive && styles.toggleLabelActive]}
      >
        {left}
      </Text>
      <Text
        style={[styles.toggleLabel, !leftActive && styles.toggleLabelActive]}
      >
        {right}
      </Text>
    </View>
  );
}

export default function DashboardOverview() {
  const { stats, bars, trend } = useDashboardData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>DashBoard</Text>
        </View>

        <View style={styles.todayRow}>
          <Text style={styles.todayText}>Today</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={Colors_DashboardPage.textPrimary}
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
                    stat.changeType === "up"
                      ? styles.changeBadgeUp
                      : styles.changeBadgeDown,
                  ]}
                >
                  <Text
                    style={[
                      styles.changeText,
                      stat.changeType === "up"
                        ? styles.changeTextUp
                        : styles.changeTextDown,
                    ]}
                  >
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

      <View style={styles.spacerPanel}>
        <View style={styles.centerBadge}>
          <Text style={styles.centerBadgeText}>10%↑</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Toggle active="Income" left="Income" right="Spend" />
          <View style={styles.floatingButton}>
            <MaterialCommunityIcons name="sparkles" size={24} color="#D8F827" />
            <MaterialCommunityIcons
              name="star-four-points"
              size={22}
              color="#FFFFFF"
              style={styles.floatingStar}
            />
          </View>
        </View>

        <View style={styles.barChartWrap}>
          <View style={styles.axisLabels}>
            <Text style={styles.axisLabel}>Rs. 30,000</Text>
            <Text style={styles.axisLabel}>Rs. 20,000</Text>
            <Text style={styles.axisLabel}>Rs. 10,000</Text>
            <Text style={styles.axisLabel}>Rs. 5,000</Text>
            <Text style={styles.axisLabel}>Rs.0</Text>
          </View>

          <View style={styles.barArea}>
            {bars.map((bar) => (
              <View key={bar.label} style={styles.barColumn}>
                <View
                  style={[styles.bar, { height: Math.max(0, bar.value) * 7 }]}
                />
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.trendSection}>
        <Toggle active="Month" left="Month" right="Year" />

        <View style={styles.trendCard}>
          <View style={styles.trendTopRow}>
            <View style={styles.trendValuePill}>
              <Text style={styles.trendValueText}>Rs. 34,430</Text>
            </View>
          </View>

          <View style={styles.trendChart}>
            {trend.map((point, index) => {
              const heights = [52, 72, 82, 60, 58, 24, 48];
              return (
                <View key={point.label} style={styles.trendColumn}>
                  <View style={[styles.trendDot, { height: heights[index] }]} />
                  <Text style={styles.trendLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  floatingStar: {
    position: "absolute",
    bottom: 16,
    right: 14,
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
    width: 28,
    gap: Spacing.xs,
  },
  bar: {
    width: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors_DashboardPage.greenPrimary,
    minHeight: 6,
  },
  barLabel: {
    color: Colors_DashboardPage.greenPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
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
