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
  { label: "Total Sells", value: "Rs.32,650", change: "", changeType: "up" },
  {
    label: "Total Products sold",
    value: "37",
    change: "10%",
    changeType: "up",
  },
  { label: "Total Customers", value: "12", change: "3%", changeType: "down" },
  {
    label: "Total Profit",
    value: "Rs.19,550",
    change: "2%",
    changeType: "down",
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
