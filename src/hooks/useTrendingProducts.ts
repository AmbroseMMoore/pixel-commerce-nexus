
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

// Helper function to transform product data
const transformProductData = (product: any): Product => {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: product.short_description || "",
    longDescription: product.long_description || "",
    price: {
      original: product.price_original,
      discounted: product.price_discounted || undefined
    },
    categoryId: product.category_id,
    subCategoryId: product.subcategory_id,
    colorVariants: (product.product_colors || []).map((color: any) => ({
      id: color.id,
      name: color.name,
      colorCode: color.color_code,
      images: (color.product_images || [])
        .sort((a: any, b: any) => {
          const orderA = a.display_order ?? 999;
          const orderB = b.display_order ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          return (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0);
        })
        .map((img: any) => img.image_url),
      sizes: (product.product_sizes || [])
        .filter((size: any) => size.color_id === color.id)
        .map((size: any) => ({
          id: size.id,
          name: size.name,
          inStock: size.stock_quantity > 0,
          stockQuantity: size.stock_quantity || 0,
          isLowStock: size.stock_quantity > 0 && size.stock_quantity <= 5,
          priceOriginal: size.price_original || product.price_original,
          priceDiscounted: size.price_discounted || product.price_discounted
        }))
    })),
    ageRanges: product.age_ranges || [],
    specifications: product.specifications || {},
    isLowStock: product.stock_quantity <= 10,
    isOutOfStock: product.stock_quantity <= 0,
    isFeatured: product.is_featured || false,
    isTrending: product.is_trending || false,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  };
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ["trendingProducts"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_colors (
            id, name, color_code,
            product_images (id, image_url, color_id, is_primary, display_order)
          ),
          product_sizes (id, product_id, color_id, name, stock_quantity, in_stock, price_original, price_discounted)
        `)
        .eq('is_trending', true);

      if (error) throw error;
      
      return (data || []).map(transformProductData);
    }
  });
};
