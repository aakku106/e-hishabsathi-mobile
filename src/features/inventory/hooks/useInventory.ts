import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  fetchProducts,
  fetchProductSummary,
  updateProduct,
} from "../data/inventory.repository";
import type { CreateProductInput } from "../types";

export const inventoryQueryKeys = {
  all: ["inventory"] as const,
  products: ["inventory", "products"] as const,
  summary: ["inventory", "summary"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: inventoryQueryKeys.products,
    queryFn: fetchProducts,
  });
}

export function useProductSummary() {
  return useQuery({
    queryKey: inventoryQueryKeys.summary,
    queryFn: fetchProductSummary,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateProductInput> }) =>
      updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}

export function useAdjustProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) =>
      adjustProductStock(id, delta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}
