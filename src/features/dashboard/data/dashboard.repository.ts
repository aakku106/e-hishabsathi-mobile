import dayjs, { type Dayjs } from "dayjs";

import { PRODUCT_STOCK_VALUE_EXPRESSION } from "@/database/products";
import { getDatabase } from "@/database/sqlite";
import { profit as calculateProfit } from "@/shared/utils/calculations";
import { lastMonths, lastWeekdayLabels } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/formatter";

import type {
  DashboardBar,
  DashboardStat,
  DashboardTrendPoint,
} from "../types";

export type DashboardPeriod = "today" | "week" | "month" | "year";

/**
 * COGS for one sale line. Shared by the dashboard cards and the AI assistant
 * so both quote the same "Total Profit" definition (`sales − COGS`), not
 * sales minus purchases.
 */
export const SALES_COST_EXPRESSION = "COALESCE(cost_price, 0) * quantity";

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

/**
 * Local calendar boundaries for the selected period. `toSqliteTimestamp`
 * converts them to UTC so they compare directly with `sold_at`, which SQLite
 * stores in UTC.
 */
function periodStart(period: DashboardPeriod): Dayjs {
  const now = dayjs();
  if (period === "today") return now.startOf("day");
  if (period === "week") return now.subtract(6, "day").startOf("day");
  if (period === "year") return now.startOf("year");
  return now.startOf("month");
}

/** Converts a local instant to SQLite's UTC `YYYY-MM-DD HH:MM:SS` form. */
function toSqliteTimestamp(date: Dayjs): string {
  return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 19);
}

export type ProfitSummary = {
  totalSales: number;
  totalCost: number;
  profit: number;
};

/**
 * All-time profit using the dashboard's formula (`sales − cost_price ×
 * quantity`). The AI assistant reads this so "profit" means the same thing in
 * both places; subtracting purchases is a different figure.
 */
export async function fetchProfitSummary(): Promise<ProfitSummary> {
  const db = getDatabase();
  if (!db) return { totalSales: 0, totalCost: 0, profit: 0 };

  const row = await db.getFirstAsync<{
    totalSales: number | null;
    totalCost: number | null;
  }>(
    `SELECT COALESCE(SUM(amount), 0) AS totalSales,
            COALESCE(SUM(${SALES_COST_EXPRESSION}), 0) AS totalCost
     FROM sales_entries`,
  );
  const totalSales = row?.totalSales ?? 0;
  const totalCost = row?.totalCost ?? 0;

  return {
    totalSales,
    totalCost,
    profit: calculateProfit(totalSales, totalCost),
  };
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
  // `sold_at` is stored in UTC. The bounds above are local period starts
  // converted to UTC, which filters correctly, but the chart buckets must be
  // converted back to local time too. Otherwise a sale just after local
  // midnight is grouped under the previous UTC weekday or month.
  const rows = await db.getAllAsync<DashboardQueryRow>(
    `SELECT
       'stats' AS rowType,
       (SELECT COALESCE(SUM(amount), 0) FROM sales_entries WHERE sold_at >= ?) AS totalSales,
       (SELECT COALESCE(SUM(${SALES_COST_EXPRESSION}), 0) FROM sales_entries WHERE sold_at >= ?) AS totalCost,
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
       CAST(strftime('%w', sold_at, 'localtime') AS INTEGER) AS weekday,
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
       strftime('%Y-%m', sold_at, 'localtime') AS month
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
    ({ label, weekday }) => {
      const amount = weekdayAmounts.get(weekday) ?? 0;
      return {
        label,
        value: Math.round((amount / maxBarAmount) * 22),
        amount,
      };
    },
  );

  const trendMap = new Map(
    monthTrend.map((point) => [point.month, point.amount]),
  );
  const maxTrendAmount = Math.max(
    1,
    ...monthTrend.map((point) => point.amount),
  );
  const trend: DashboardTrendPoint[] = lastMonths(7).map(
    ({ label, month }) => {
      const amount = trendMap.get(month) ?? 0;
      return {
        label,
        value: Math.round((amount / maxTrendAmount) * 68),
        amount,
      };
    },
  );

  return { stats, bars, trend };
}
