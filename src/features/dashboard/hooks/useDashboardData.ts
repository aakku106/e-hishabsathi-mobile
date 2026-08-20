import { useQuery } from "@tanstack/react-query";

import { fetchDashboardData } from "../data/dashboard.repository";
import type { DashboardPeriod } from "../data/dashboard.repository";
import type {
  DashboardBar,
  DashboardStat,
  DashboardTrendPoint,
} from "../data/dashboard.mock";
import {
  DASHBOARD_STATS,
  INCOME_BARS,
  MONTH_TREND,
} from "../data/dashboard.mock";

type DashboardData = {
  stats: DashboardStat[];
  bars: DashboardBar[];
  trend: DashboardTrendPoint[];
};

export function useDashboardData(period: DashboardPeriod = "today") {
  const query = useQuery<DashboardData>({
    queryKey: ["dashboard", "overview", period],
    queryFn: () => fetchDashboardData(period),
  });

  return {
    stats: query.data?.stats ?? DASHBOARD_STATS,
    bars: query.data?.bars ?? INCOME_BARS,
    trend: query.data?.trend ?? MONTH_TREND,
    isLoading: query.isLoading,
  };
}
