import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useSQLite } from "@/shared/hooks/useSQLite";
import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  fetchProducts,
  fetchProductsPage,
  fetchProductSummary,
  PRODUCTS_PAGE_SIZE,
  updateProduct,
} from "../data/inventory.repository";
import type { CreateProductInput } from "../types";

export const inventoryQueryKeys = {
  all: ["inventory"] as const,
  products: ["inventory", "products"] as const,
  pagedProducts: ["inventory", "products", "paged"] as const,
  summary: ["inventory", "summary"] as const,
};

export function useProducts() {
  const { db, ready } = useSQLite();
  return useQuery({
    queryKey: inventoryQueryKeys.products,
    queryFn: fetchProducts,
    enabled: ready && db !== null,
  });
}

export function usePagedProducts() {
  const { db, ready, error: databaseError } = useSQLite();
  const databaseReady = ready && db !== null;
  const query = useInfiniteQuery({
    queryKey: inventoryQueryKeys.pagedProducts,
    queryFn: ({ pageParam }) =>
      fetchProductsPage(PRODUCTS_PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < PRODUCTS_PAGE_SIZE ?
        undefined
      : lastPageParam + lastPage.length,
    enabled: databaseReady,
  });

  const error =
    databaseError ??
    (ready && !databaseReady ?
      new Error("The local database is unavailable.")
    : query.error);

  // Keep the flat list identity stable across renders so FlatList and the
  // memoized product rows only update when a page actually changes.
  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data],
  );

  return {
    ...query,
    products,
    isLoading: !ready || (databaseReady && query.isLoading),
    error,
    databaseReady,
  };
}

export function useProductSummary() {
  const { db, ready, error: databaseError } = useSQLite();
  const databaseReady = ready && db !== null;
  const query = useQuery({
    queryKey: inventoryQueryKeys.summary,
    queryFn: fetchProductSummary,
    enabled: databaseReady,
  });

  const error =
    databaseError ??
    (ready && !databaseReady ?
      new Error("The local database is unavailable.")
    : query.error);

  return {
    ...query,
    isLoading: !ready || (databaseReady && query.isLoading),
    error,
  };
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<CreateProductInput>;
    }) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
