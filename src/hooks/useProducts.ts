
import { useQuery } from "@tanstack/react-query";
import { 
  fetchProducts, 
  fetchFeaturedProducts, 
  fetchProductsByCategory,
  fetchProductBySlug
} from "@/services/api";
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

// Hook for single product
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug
  });
};

// Hook for checking product availability in real-time
export const useProductAvailability = (productId: string) => {
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
    enabled: !!productId,
    // Check more frequently for real-time stock updates
    refetchInterval: 30000 // Check every 30 seconds
  });
};
