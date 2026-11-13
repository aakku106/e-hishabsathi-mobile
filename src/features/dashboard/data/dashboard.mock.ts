export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
};

export type DashboardBar = {
  label: string;
  value: number;
};

export type DashboardTrendPoint = {
  label: string;
  value: number;
};

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: "Total Sales", value: "Rs.32,650", change: "10%", changeType: "up" },
  {
    label: "Total Profit",
    value: "Rs.19,550",
    change: "2%",
    changeType: "down",
  },
  { label: "Total Udharo", value: "Rs.49,740", change: "5%", changeType: "down" },
  {
    label: "Stock Value",
    value: "Rs.42,000",
    change: "0%",
    changeType: "up",
  },
];

export const INCOME_BARS: DashboardBar[] = [
  { label: "Mon", value: 5 },
  { label: "Tue", value: 22 },
  { label: "Wed", value: 18 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
  { label: "Sat", value: 0 },
  { label: "Sun", value: 0 },
];

export const MONTH_TREND: DashboardTrendPoint[] = [
  { label: "Baisakh", value: 58 },
  { label: "Jestha", value: 34 },
  { label: "Asar", value: 22 },
  { label: "Sawan", value: 45 },
  { label: "Bhadra", value: 44 },
  { label: "Ashoj", value: 68 },
  { label: "Kartik", value: 54 },
];
