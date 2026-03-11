import { useQuery } from "@tanstack/react-query";

import { categoriesService } from "@/services/products";
import { Category } from "@/types/category";

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const response = await categoriesService.listActive();
      return response.data ?? [];
    },
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
