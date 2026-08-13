import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPurchaseEntry,
  deletePurchaseEntry,
  fetchPurchaseEntries,
  fetchPurchaseSummary,
} from "../data/purchase.repository";
import type { CreatePurchaseEntryInput } from "../types";

export const purchaseQueryKeys = {
  all: ["purchases"] as const,
  entries: ["purchases", "entries"] as const,
  summary: ["purchases", "summary"] as const,
};

export function usePurchaseEntries() {
  return useQuery({
    queryKey: purchaseQueryKeys.entries,
    queryFn: fetchPurchaseEntries,
  });
}

export function usePurchaseSummary() {
  return useQuery({
    queryKey: purchaseQueryKeys.summary,
    queryFn: fetchPurchaseSummary,
  });
}

export function useCreatePurchaseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePurchaseEntryInput) =>
      createPurchaseEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all });
    },
  });
}

export function useDeletePurchaseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePurchaseEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all });
    },
  });
}
