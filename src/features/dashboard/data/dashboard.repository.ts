import dayjs, { type Dayjs } from "dayjs";

import { PRODUCT_STOCK_VALUE_EXPRESSION } from "@/database/products";
import { getDatabase } from "@/database/sqlite";
import { lastMonths, lastWeekdayLabels } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/formatter";

import type {
  DashboardBar,
  DashboardStat,
  DashboardTrendPoint,
} from "./dashboard.mock";

export type DashboardPeriod = "today" | "week" | "month" | "year";

type DashboardQueryRow = {
  rowType: "stats" | "income" | "trend";
  totalSales: number | null;
  totalCost: number | null;
  totalUdharo: number | null;
  stockValue: number | null;
  lowStockCount: number | null;
  weekday: number | null;
  amount: number | null;
  month: string | null;
};

function periodStart(period: DashboardPeriod): Dayjs {
  const now = dayjs();
  if (period === "today") return now.startOf("day");
  if (period === "week") return now.subtract(6, "day").startOf("day");
  if (period === "year") return now.startOf("year");
  return now.startOf("month");
}

function toSqliteTimestamp(date: Dayjs): string {
  return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 19);
}

export async function fetchDashboardData(
  period: DashboardPeriod = "today",
): Promise<{
  stats: DashboardStat[];
  bars: DashboardBar[];
  trend: DashboardTrendPoint[];
}> {
  const db = getDatabase();
  if (!db) throw new Error("Database is not ready yet");

  const start = toSqliteTimestamp(periodStart(period));
  const monthTrendStart = toSqliteTimestamp(
    dayjs().subtract(6, "month").startOf("month"),
  );
  const rows = await db.getAllAsync<DashboardQueryRow>(
    `SELECT
       'stats' AS rowType,
       (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ?) AS totalSales,
       (SELECT COALESCE(SUM(COALESCE(cost_price, 0) * quantity), 0) FROM sales_entries WHERE sold_at >= ?) AS totalCost,
       (SELECT COALESCE(SUM(amount), 0) FROM udharo_entries WHERE created_at >= ?) AS totalUdharo,
       (SELECT COALESCE(SUM(${PRODUCT_STOCK_VALUE_EXPRESSION}), 0) FROM products) AS stockValue,
       (SELECT COUNT(*) FROM products WHERE stock_quantity < 10) AS lowStockCount,
       NULL AS weekday,
       NULL AS amount,
       NULL AS month
     UNION ALL
     SELECT
       'income',
       NULL, NULL, NULL, NULL, NULL,
       CAST(strftime('%w', sold_at) AS INTEGER) AS weekday,
       COALESCE(SUM(amount), 0),
       NULL
     FROM sales_entries
     WHERE sold_at >= ?
     GROUP BY weekday
     UNION ALL
     SELECT
       'trend',
       NULL, NULL, NULL, NULL, NULL,
       NULL,
       COALESCE(SUM(amount), 0),
       strftime('%Y-%m', sold_at) AS month
     FROM sales_entries
     WHERE sold_at >= ?
     GROUP BY month`,
    start,
    start,
    start,
    start,
    monthTrendStart,
  );

  const statsRow = rows.find((row) => row.rowType === "stats");
  if (!statsRow)
    throw new Error("Dashboard statistics query returned no result");

  const incomeBars = rows.flatMap((row) => {
    if (
      row.rowType !== "income" ||
      row.weekday === null ||
      row.amount === null
    ) {
      return [];
    }
    return [{ weekday: row.weekday, amount: row.amount }];
  });
  const monthTrend = rows.flatMap((row) => {
    if (row.rowType !== "trend" || row.month === null || row.amount === null) {
      return [];
    }
    return [{ month: row.month, amount: row.amount }];
  });

  const stats: DashboardStat[] = [
    {
      label: "Total Sales",
      value: formatCurrency(statsRow.totalSales ?? 0),
      change: "0%",
      changeType: "up",
    },
    {
      label: "Total Profit",
      value: formatCurrency(
        (statsRow.totalSales ?? 0) - (statsRow.totalCost ?? 0),
      ),
      change: "0%",
      changeType: "up",
    },
    {
      label: "Total Udharo",
      value: formatCurrency(statsRow.totalUdharo ?? 0),
      change: "0%",
      changeType: "down",
    },
    {
      label: "Stock Value",
      value: formatCurrency(statsRow.stockValue ?? 0),
      change:
        (statsRow.lowStockCount ?? 0) > 0 ?
          `${statsRow.lowStockCount} low`
        : "",
      changeType: "down",
    },
  ];

  const weekdayAmounts = new Map(
    incomeBars.map((bar) => [bar.weekday, bar.amount]),
  );
  const maxBarAmount = Math.max(1, ...incomeBars.map((bar) => bar.amount));
  const bars: DashboardBar[] = lastWeekdayLabels().map(
    ({ label, weekday }) => ({
      label,
      value: Math.round(
        ((weekdayAmounts.get(weekday) ?? 0) / maxBarAmount) * 22,
      ),
    }),
  );

  const trendMap = new Map(
    monthTrend.map((point) => [point.month, point.amount]),
  );
  const maxTrendAmount = Math.max(
    1,
    ...monthTrend.map((point) => point.amount),
  );
  const trend: DashboardTrendPoint[] = lastMonths(7).map(
    ({ label, month }) => ({
      label,
      value: Math.round(((trendMap.get(month) ?? 0) / maxTrendAmount) * 68),
    }),
  );

  return { stats, bars, trend };
}
