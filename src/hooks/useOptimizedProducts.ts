
import { useQuery } from "@tanstack/react-query";
import { 
  fetchProductsOptimized,
  fetchFeaturedProductsOptimized,
  fetchTrendingProductsOptimized,
  fetchProductBySlugOptimized
} from "@/services/optimizedApi";

// Hook for paginated products with better error handling
export const useOptimizedProducts = (options: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  subCategoryId?: string;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
  enabled?: boolean;
} = {}) => {
  const { enabled = true, ...fetchOptions } = options;
  
  return useQuery({
    queryKey: ["optimized-products", fetchOptions],
    queryFn: () => fetchProductsOptimized(fetchOptions),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for featured products
export const useOptimizedFeaturedProducts = () => {
  return useQuery({
    queryKey: ["optimized-featured-products"],
    queryFn: fetchFeaturedProductsOptimized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for trending products
export const useOptimizedTrendingProducts = () => {
  return useQuery({
    queryKey: ["optimized-trending-products"],
    queryFn: fetchTrendingProductsOptimized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for single product
export const useOptimizedProduct = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["optimized-product", slug],
    queryFn: () => fetchProductBySlugOptimized(slug),
    enabled: !!slug && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
