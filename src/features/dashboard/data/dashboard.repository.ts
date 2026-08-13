import dayjs from "dayjs";

import { getDatabase } from "@/database/sqlite";
import { changePercent } from "@/shared/utils/calculations";
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

type StatsQuery = {
  totalSales: number;
  totalQuantity: number;
  totalCustomers: number;
  totalPurchases: number;
  lastWeekSales: number;
  thisMonthSales: number;
  lastMonthSales: number;
};

async function queryStats(): Promise<StatsQuery | null> {
  const db = getDatabase();
  if (!db) return null;

  const weekStart = dayjs().subtract(7, "day").toISOString();
  const monthStart = dayjs().startOf("month").toISOString();
  const prevMonthStart = dayjs()
    .subtract(1, "month")
    .startOf("month")
    .toISOString();

  const row = await db.getFirstAsync<StatsQuery>(
    `SELECT
      (SELECT COALESCE(SUM(amount), 0) FROM sales_entries) as totalSales,
      (SELECT COALESCE(SUM(quantity), 0) FROM sales_entries) as totalQuantity,
      (SELECT COUNT(DISTINCT customer) FROM sales_entries WHERE customer IS NOT NULL AND customer != '') as totalCustomers,
      (SELECT COALESCE(SUM(amount), 0) FROM purchase_entries) as totalPurchases,
      (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ?) as lastWeekSales,
      (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ?) as thisMonthSales,
      (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ? AND sold_at < ?) as lastMonthSales
    `,
    weekStart,
    monthStart,
    prevMonthStart,
    monthStart,
  );

  return row;
}

async function queryIncomeBars(): Promise<{ weekday: number; amount: number }[]> {
  const db = getDatabase();
  if (!db) return [];

  const weekStart = dayjs().subtract(6, "day").startOf("day").toISOString();
  return db.getAllAsync<{ weekday: number; amount: number }>(
    `SELECT CAST(strftime('%w', sold_at) AS INTEGER) as weekday, COALESCE(SUM(amount), 0) as amount
     FROM sales_entries WHERE sold_at >= ? GROUP BY weekday`,
    weekStart,
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

export async function fetchDashboardData(): Promise<{
  stats: DashboardStat[];
  bars: DashboardBar[];
  trend: DashboardTrendPoint[];
}> {
  const db = getDatabase();
  if (!db) return { stats: DASHBOARD_STATS, bars: INCOME_BARS, trend: MONTH_TREND };

  const [statsRow, incomeBars, monthTrend] = await Promise.all([
    queryStats(),
    queryIncomeBars(),
    queryMonthTrend(),
  ]);

  const stats: DashboardStat[] = [
    {
      label: "Total Sells",
      value: formatCurrency(statsRow?.totalSales ?? 0),
      change: Math.round(changePercent(statsRow?.lastWeekSales ?? 0, statsRow?.lastMonthSales ?? 0)).toString(),
      changeType: (statsRow?.lastWeekSales ?? 0) >= (statsRow?.lastMonthSales ?? 0) ? "up" : "down",
    },
    {
      label: "Total Products sold",
      value: String(statsRow?.totalQuantity ?? 0),
      change: `${Math.round(changePercent(statsRow?.thisMonthSales ?? 0, statsRow?.lastMonthSales ?? 0))}%`,
      changeType: (statsRow?.thisMonthSales ?? 0) >= (statsRow?.lastMonthSales ?? 0) ? "up" : "down",
    },
    {
      label: "Total Customers",
      value: String(statsRow?.totalCustomers ?? 0),
      change: "0%",
      changeType: "down",
    },
    {
      label: "Total Profit",
      value: formatCurrency((statsRow?.totalSales ?? 0) - (statsRow?.totalPurchases ?? 0)),
      change: `${Math.round(changePercent(statsRow?.thisMonthSales ?? 0, statsRow?.lastMonthSales ?? 0))}%`,
      changeType: (statsRow?.thisMonthSales ?? 0) >= (statsRow?.lastMonthSales ?? 0) ? "up" : "down",
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
