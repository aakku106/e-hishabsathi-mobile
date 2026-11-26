export type DashboardStat = {
  label: string;
  value: string;
  /**
   * Optional badge for a real, non-placeholder signal (currently the
   * low-stock count). Percentage trends are omitted until they are computed
   * from actual period-over-period data.
   */
  change?: string;
  changeType?: "up" | "down";
};

export type DashboardBar = {
  label: string;
  /** Normalized chart height (0–22). */
  value: number;
  /** Actual sales amount for this period, from SQLite. */
  amount: number;
};

export type DashboardTrendPoint = {
  label: string;
  /** Normalized chart height (0–68). */
  value: number;
  /** Actual sales amount for this month, from SQLite. */
  amount: number;
};
