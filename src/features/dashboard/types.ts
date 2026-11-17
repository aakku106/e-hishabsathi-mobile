export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
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
