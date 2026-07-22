import {
  DASHBOARD_STATS,
  INCOME_BARS,
  MONTH_TREND,
} from "../data/dashboard.mock";

export function useDashboardData() {
  return {
    stats: DASHBOARD_STATS,
    bars: INCOME_BARS,
    trend: MONTH_TREND,
  };
}
