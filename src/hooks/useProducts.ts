import { useQuery } from "@tanstack/react-query";
import { 
  fetchProducts, 
  fetchFeaturedProducts, 
  fetchProductsByCategory,
  fetchProductBySlug,
  fetchProductById
} from "@/services/api";
import { fetchAllProductsForAdmin } from "@/services/adminApi";
import { supabase } from "@/integrations/supabase/client";

// Hook for all products
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });
};

// Hook for featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts
  });
};

// Hook for products by category
export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: () => fetchProductsByCategory(categorySlug),
    enabled: !!categorySlug
  });
};

// Hook for single product by slug (for public product pages)
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug
  });
};

// Hook for single product by ID (for admin edit functionality)
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ["product", "id", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id
  });
};

// Hook for admin to fetch ALL products (including dropped)
export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAllProductsForAdmin
  });
};

// Updated hook for checking product availability with better control
export const useProductAvailability = (productId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["product", "availability", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return {
        isInStock: data.stock_quantity > 0,
        isLowStock: data.stock_quantity > 0 && data.stock_quantity <= 10,
        quantity: data.stock_quantity
      };
    },
    enabled: !!productId && enabled,
    // Only refetch when explicitly needed, not automatically
    refetchInterval: false,
    refetchOnWindowFocus: false,
    // Cache for 2 minutes
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// New hook for real-time availability that can be used when needed
export const useRealTimeProductAvailability = (productId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["product", "availability", "realtime", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return {
        isInStock: data.stock_quantity > 0,
        isLowStock: data.stock_quantity > 0 && data.stock_quantity <= 10,
        quantity: data.stock_quantity
      };
    },
    enabled: !!productId && enabled,
    // Check every 30 seconds only when enabled
    refetchInterval: enabled ? 30000 : false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};
