import { useQuery } from "@tanstack/react-query";

import { fetchDashboardData } from "../data/dashboard.repository";
import {
  DASHBOARD_STATS,
  INCOME_BARS,
  MONTH_TREND,
} from "../data/dashboard.mock";

export function useDashboardData() {
  const query = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardData,
  });

  return {
    stats: query.data?.stats ?? DASHBOARD_STATS,
    bars: query.data?.bars ?? INCOME_BARS,
    trend: query.data?.trend ?? MONTH_TREND,
    isLoading: query.isLoading,
  };
}
