
import { useQuery } from "@tanstack/react-query";
import { 
  fetchProducts, 
  fetchFeaturedProducts, 
  fetchProductsByCategory,
  fetchProductBySlug
} from "@/services/api";

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
