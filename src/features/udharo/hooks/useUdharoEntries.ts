import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUdharoEntry,
  deleteUdharoEntry,
  fetchUdharoEntries,
  fetchUdharoSummary,
} from "../data/udharo.repository";
import type { CreateUdharoEntryInput } from "../types";

export const udharoQueryKeys = {
  all: ["udharo"] as const,
  entries: ["udharo", "entries"] as const,
  summary: ["udharo", "summary"] as const,
};

export function useUdharoEntries() {
  return useQuery({
    queryKey: udharoQueryKeys.entries,
    queryFn: fetchUdharoEntries,
  });
}

export function useUdharoSummary() {
  return useQuery({
    queryKey: udharoQueryKeys.summary,
    queryFn: fetchUdharoSummary,
  });
}

export function useCreateUdharoEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUdharoEntryInput) => createUdharoEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: udharoQueryKeys.all });
    },
  });
}

export function useDeleteUdharoEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUdharoEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: udharoQueryKeys.all });
    },
  });
}
