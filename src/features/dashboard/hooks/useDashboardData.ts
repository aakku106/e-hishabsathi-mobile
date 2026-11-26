import { useQuery } from "@tanstack/react-query";

import { useSQLite } from "@/shared/hooks/useSQLite";

import {
  fetchDashboardData,
  fetchProfitSummary,
} from "../data/dashboard.repository";
import type {
  DashboardPeriod,
  ProfitSummary,
} from "../data/dashboard.repository";
import type { DashboardBar, DashboardStat, DashboardTrendPoint } from "../types";

type DashboardData = {
  stats: DashboardStat[];
  bars: DashboardBar[];
  trend: DashboardTrendPoint[];
};

export function useDashboardData(period: DashboardPeriod = "today") {
  const { db, ready, error: databaseError } = useSQLite();
  const databaseReady = ready && db !== null;
  const query = useQuery<DashboardData>({
    queryKey: ["dashboard", "overview", period],
    queryFn: () => fetchDashboardData(period),
    enabled: databaseReady,
    staleTime: 0,
  });
  const error =
    databaseError ??
    (ready && !databaseReady ?
      new Error("The local database is unavailable.")
    : query.error);

  return {
    stats: query.data?.stats ?? [],
    bars: query.data?.bars ?? [],
    trend: query.data?.trend ?? [],
    isLoading:
      query.data === undefined &&
      (!ready || (databaseReady && query.isLoading)),
    isFetching: query.isFetching,
    error,
    databaseReady,
    refetch: query.refetch,
  };
}

/**
 * All-time profit for the AI assistant. Shares the dashboard's COGS formula
 * so both screens quote the same definition of profit.
 */
export function useProfitSummary() {
  return useQuery<ProfitSummary>({
    queryKey: ["dashboard", "profit"],
    queryFn: fetchProfitSummary,
    staleTime: 0,
  });
}
