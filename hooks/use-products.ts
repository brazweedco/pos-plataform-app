import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { productsService } from "@/services/products";
import { useProductStore } from "@/stores/product-store";
import {
  Product,
  ProductResponse,
  mapProductResponseToProduct,
} from "@/types/product";

interface UseProductsParams {
  brandId?: string;
  categoryId?: string;
  page?: number;
  size?: number;
}

export function useProducts(params?: UseProductsParams) {
  const setProducts = useProductStore((state) => state.setProducts);
  const setLoading = useProductStore((state) => state.setLoading);
  const setError = useProductStore((state) => state.setError);

  const query = useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await productsService.list(params);
      return response.data.map(mapProductResponseToProduct);
    },
  });

  // Sync with Zustand store
  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.data) {
      setProducts(query.data);
    }
  }, [query.data, setProducts]);

  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
    }
  }, [query.error, setError]);

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useLowStockProducts() {
  const query = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: async () => {
      const response = await productsService.getLowStock();
      return response.map(mapProductResponseToProduct);
    },
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProduct(id: string) {
  const query = useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await productsService.getById(id);
      return mapProductResponseToProduct(response);
    },
    enabled: !!id,
  });

  return {
    product: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useDeleteProduct() {
  const removeProduct = useProductStore((state) => state.removeProduct);

  return useMutation({
    mutationFn: async (id: string) => {
      await productsService.delete(id);
      return id;
    },
    onSuccess: (id) => {
      removeProduct(id);
    },
  });
}
