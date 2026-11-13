import dayjs from "dayjs";

import { getDatabase } from "@/database/sqlite";
import { lastMonths, lastWeekdayLabels } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/formatter";

import {
  DASHBOARD_STATS,
  INCOME_BARS,
  MONTH_TREND,
  type DashboardBar,
  type DashboardStat,
  type DashboardTrendPoint,
} from "./dashboard.mock";

export type DashboardPeriod = "today" | "week" | "month" | "year";

type StatsQuery = {
  totalSales: number;
  totalPurchases: number;
  totalCost: number;
  totalUdharo: number;
  udharoCount: number;
  stockValue: number;
  lowStockCount: number;
};
function periodStart(period: DashboardPeriod) {
  const now = dayjs();
  if (period === "today") return now.startOf("day");
  if (period === "week") return now.subtract(6, "day").startOf("day");
  if (period === "year") return now.startOf("year");
  return now.startOf("month");
}

async function queryStats(period: DashboardPeriod): Promise<StatsQuery | null> {
  const db = getDatabase();
  if (!db) return null;
  const start = periodStart(period).toISOString();

  const row = await db.getFirstAsync<StatsQuery>(
    `SELECT
      (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ?) as totalSales,
      (SELECT COALESCE(SUM(amount), 0) FROM purchase_entries WHERE purchased_at >= ?) as totalPurchases,
      (SELECT COALESCE(SUM(COALESCE(cost_price, 0) * quantity), 0) FROM sales_entries WHERE sold_at >= ?) as totalCost,
      (SELECT COALESCE(SUM(amount), 0) FROM udharo_entries WHERE created_at >= ?) as totalUdharo,
      (SELECT COUNT(*) FROM udharo_entries WHERE created_at >= ?) as udharoCount,
      (SELECT COALESCE(SUM(COALESCE(cost_price, 0) * stock_quantity), 0) FROM products) as stockValue,
      (SELECT COUNT(*) FROM products WHERE stock_quantity < 10) as lowStockCount`,
    start,
    start,
    start,
    start,
    start,
  );

  return row;
}

async function queryIncomeBars(period: DashboardPeriod): Promise<{ weekday: number; amount: number }[]> {
  const db = getDatabase();
  if (!db) return [];

  const start = periodStart(period).toISOString();
  return db.getAllAsync<{ weekday: number; amount: number }>(
    `SELECT CAST(strftime('%w', sold_at) AS INTEGER) as weekday, COALESCE(SUM(amount), 0) as amount
    FROM sales_entries WHERE sold_at >= ? GROUP BY weekday`,
      start,
  );
}

async function queryMonthTrend(): Promise<{ month: string; amount: number }[]> {
  const db = getDatabase();
  if (!db) return [];

  const start = dayjs().subtract(6, "month").startOf("month").toISOString();
  return db.getAllAsync<{ month: string; amount: number }>(
    `SELECT strftime('%Y-%m', sold_at) as month, COALESCE(SUM(amount), 0) as amount
     FROM sales_entries WHERE sold_at >= ? GROUP BY month`,
    start,
  );
}

export async function fetchDashboardData(period: DashboardPeriod = "today"): Promise<{
  stats: DashboardStat[];
  bars: DashboardBar[];
  trend: DashboardTrendPoint[];
}> {
  const db = getDatabase();
  if (!db) return { stats: DASHBOARD_STATS, bars: INCOME_BARS, trend: MONTH_TREND };

  const [statsRow, incomeBars, monthTrend] = await Promise.all([
    queryStats(period),
    queryIncomeBars(period),
    queryMonthTrend(),
  ]);

  const stats: DashboardStat[] = [
    {
      label: "Total Sales",
      value: formatCurrency(statsRow?.totalSales ?? 0),
      change: "0%",
      changeType: "up",
    },
    {
      label: "Total Profit",
      value: formatCurrency(
        (statsRow?.totalSales ?? 0) - (statsRow?.totalCost ?? 0),
      ),
      change: "0%",
      changeType: "up",
    },
    {
      label: "Total Udharo",
      value: formatCurrency(statsRow?.totalUdharo ?? 0),
      change: "0%",
      changeType: "down",
    },
    {
      label: "Stock Value",
      value: formatCurrency(statsRow?.stockValue ?? 0),
      change:
        (statsRow?.lowStockCount ?? 0) > 0 ?
          `${statsRow?.lowStockCount} low`
        : "",
      changeType: "down",
    },
  ];

  const weekdayAmounts = new Map(incomeBars.map((bar) => [bar.weekday, bar.amount]));
  const maxBarAmount = Math.max(1, ...incomeBars.map((bar) => bar.amount));
  const bars: DashboardBar[] = lastWeekdayLabels().map(({ label, weekday }) => ({
    label,
    value: Math.round(((weekdayAmounts.get(weekday) ?? 0) / maxBarAmount) * 22),
  }));

  const trendMap = new Map(monthTrend.map((point) => [point.month, point.amount]));
  const maxTrendAmount = Math.max(1, ...monthTrend.map((point) => point.amount));
  const trend: DashboardTrendPoint[] = lastMonths(7).map(({ label, month }) => ({
    label,
    value: Math.round(((trendMap.get(month) ?? 0) / maxTrendAmount) * 68),
  }));

  return { stats, bars, trend };
}
