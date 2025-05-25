
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
    colorVariants: (product.product_colors || []).map(color => ({
      id: color.id,
      name: color.name,
      colorCode: color.color_code,
      images: (color.product_images || []).map(img => img.image_url)
    })),
    sizeVariants: (product.product_sizes || []).map(size => ({
      id: size.id,
      name: size.name,
      inStock: size.in_stock
    })),
    specifications: product.specifications || {},
    isLowStock: product.stock_quantity <= 10,
    isOutOfStock: product.stock_quantity <= 0,
    isFeatured: product.is_featured || false,
    isTrending: product.is_trending || false,
    isNewArrival: product.is_new_arrival || false,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  };
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ["newArrivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_colors (
            id, name, color_code,
            product_images (id, image_url, is_primary)
          ),
          product_sizes (id, name, in_stock)
        `)
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(transformProductData);
    }
  });
};
