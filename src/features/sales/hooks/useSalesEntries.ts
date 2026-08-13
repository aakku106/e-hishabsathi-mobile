import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalesEntry,
  deleteSalesEntry,
  fetchSalesEntries,
  fetchSalesSummary,
} from "../data/sales.repository";
import type { CreateSalesEntryInput, SalesSummary } from "../types";

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
    },
  });
}

export function useDeleteSalesEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSalesEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.all });
    },
  });
}
