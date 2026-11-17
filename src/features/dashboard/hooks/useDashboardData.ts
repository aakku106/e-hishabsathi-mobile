import { useQuery } from "@tanstack/react-query";

import { fetchDashboardData } from "../data/dashboard.repository";
import type { DashboardPeriod } from "../data/dashboard.repository";
import type { DashboardBar, DashboardStat, DashboardTrendPoint } from "../data/dashboard.mock";

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
    stats: query.data?.stats ?? [],
    bars: query.data?.bars ?? [],
    trend: query.data?.trend ?? [],
    isLoading: query.isLoading,
  };
}
