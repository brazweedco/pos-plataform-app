import { useQuery } from "@tanstack/react-query";

import { brandsService } from "@/services/products";

export function useBrands() {
  const query = useQuery({
    queryKey: ["brands", "active"],
    queryFn: async () => {
      const response = await brandsService.listActive();
      return response.data ?? [];
    },
  });

  return {
    brands: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
