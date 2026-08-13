import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBusiness,
  fetchBusiness,
  updateBusiness,
  updateBusinessType,
} from "../data/business.repository";
import type { CreateBusinessInput } from "../types";
import type { BusinessType } from "@/shared/constants/businessTypes";

export const businessQueryKeys = {
  all: ["business"] as const,
  current: ["business", "current"] as const,
};

export function useBusiness() {
  return useQuery({
    queryKey: businessQueryKeys.current,
    queryFn: fetchBusiness,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBusinessInput) => createBusiness(input),
    onSuccess: (business) => {
      queryClient.setQueryData(businessQueryKeys.current, business);
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
    },
  });
}

export function useUpdateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type }: { id: number; type: BusinessType }) =>
      updateBusinessType(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<CreateBusinessInput>;
    }) => updateBusiness(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
    },
  });
}
