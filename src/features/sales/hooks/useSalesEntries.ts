import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalesBatch,
  createSalesEntry,
  deleteSalesEntry,
  fetchSalesEntries,
  fetchSalesSummary,
} from "../data/sales.repository";
import type {
  CreateSalesBatchInput,
  CreateSalesEntryInput,
  SalesSummary,
} from "../types";

export const salesQueryKeys = {
  all: ["sales"] as const,
  entries: ["sales", "entries"] as const,
  summary: ["sales", "summary"] as const,
};

export function useSalesEntries() {
  return useQuery({
    queryKey: salesQueryKeys.entries,
    queryFn: fetchSalesEntries,
  });
}

export function useSalesSummary() {
  return useQuery<SalesSummary>({
    queryKey: salesQueryKeys.summary,
    queryFn: fetchSalesSummary,
  });
}

export function useCreateSalesEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSalesEntryInput) => createSalesEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateSalesBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSalesBatchInput) => createSalesBatch(input),
    onSuccess: () => {
      // A checkout moves inventory, may create an udharo receivable, and
      // changes the dashboard totals.
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["udharo"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteSalesEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSalesEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
