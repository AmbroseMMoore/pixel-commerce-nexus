import { supabase } from "@/integrations/supabase/client";
import { Product, Category, SubCategory } from "@/types/product";
import { supabaseManager } from "@/lib/supabaseManager";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Helper function to get cached data or fetch new
const getCachedOrFetch = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  maxAge: number = CACHE_DURATION
): Promise<T> => {
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < maxAge) {
    console.log(`Cache hit for ${cacheKey}`);
    return cached.data;
  }
  
  console.log(`Cache miss for ${cacheKey}, fetching...`);
  const data = await fetchFn();
  cache.set(cacheKey, { data, timestamp: now });
  return data;
};

// Optimized product fetching with pagination
export const fetchProductsOptimized = async (options: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  subCategoryId?: string;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
} = {}): Promise<{ products: Product[]; totalCount: number }> => {
  const {
    page = 1,
    pageSize = 20,
    categoryId,
    subCategoryId,
    featuredOnly = false,
    trendingOnly = false
  } = options;

  const cacheKey = `products-${JSON.stringify(options)}`;
  supabaseManager.trackConnection(cacheKey);

  try {
    return await getCachedOrFetch(cacheKey, async () => {
      console.log('Fetching products with optimized query...');
      
      const { data, error } = await supabase.rpc('get_products_paginated', {
        page_num: page,
        page_size: pageSize,
        category_filter: categoryId || null,
        subcategory_filter: subCategoryId || null,
        featured_only: featuredOnly,
        trending_only: trendingOnly
      });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return { products: [], totalCount: 0 };
      }

      const totalCount = data[0]?.total_count || 0;
      
      // Transform the optimized data
      const products = await Promise.all(data.map(async (item: any) => {
        // Fetch colors with their sizes nested
        const colorVariants = await fetchProductColorsWithSizes(item.id);

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          shortDescription: item.short_description || "",
          longDescription: "", // Only fetch when needed
          price: {
            original: item.price_original,
            discounted: item.price_discounted || undefined
          },
          categoryId: categoryId || "",
          subCategoryId: subCategoryId || "",
          colorVariants,
          ageRanges: [],
          specifications: {},
          isLowStock: item.stock_quantity <= 10,
          isOutOfStock: item.is_out_of_stock || item.stock_quantity <= 0,
          isFeatured: item.is_featured || false,
          isTrending: item.is_trending || false,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.created_at)
        } as Product;
      }));

      return { products, totalCount };
    });
  } finally {
    supabaseManager.untrackConnection(cacheKey);
  }
};

// Optimized product colors fetching with sizes nested
const fetchProductColorsWithSizes = async (productId: string) => {
  const cacheKey = `colors-with-sizes-${productId}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    const { data: colorsData, error: colorsError } = await supabase
      .from('product_colors')
      .select(`
        id, name, color_code,
        product_images (id, image_url, is_primary, display_order)
      `)
      .eq('product_id', productId);

    if (colorsError) throw colorsError;

    // Fetch sizes for all colors
    const { data: sizesData, error: sizesError } = await supabase
      .from('product_sizes')
      .select('id, name, in_stock, price_original, price_discounted, color_id, stock_quantity, is_low_stock')
      .eq('product_id', productId);

    if (sizesError) throw sizesError;

    // Group sizes by color_id
    const sizesByColor = (sizesData || []).reduce((acc: any, size: any) => {
      if (!acc[size.color_id]) {
        acc[size.color_id] = [];
      }
      acc[size.color_id].push({
        id: size.id,
        name: size.name,
        inStock: size.in_stock && size.stock_quantity > 0,
        stockQuantity: size.stock_quantity || 0,
        isLowStock: size.is_low_stock || (size.stock_quantity > 0 && size.stock_quantity <= 5),
        priceOriginal: size.price_original,
        priceDiscounted: size.price_discounted
      });
      return acc;
    }, {});

    return (colorsData || []).map(color => ({
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
        .map((img: any) => img.image_url || '/placeholder.svg'),
      sizes: (sizesByColor[color.id] || []).sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      )
    }));
  });
};

// Optimized featured products
export const fetchFeaturedProductsOptimized = async (): Promise<Product[]> => {
  const result = await fetchProductsOptimized({
    featuredOnly: true,
    pageSize: 12
  });
  return result.products;
};

// Optimized trending products
export const fetchTrendingProductsOptimized = async (): Promise<Product[]> => {
  const result = await fetchProductsOptimized({
    trendingOnly: true,
    pageSize: 12
  });
  return result.products;
};

// Optimized single product fetch
export const fetchProductBySlugOptimized = async (slug: string): Promise<Product> => {
  const cacheKey = `product-slug-${slug}`;
  supabaseManager.trackConnection(cacheKey);

  try {
    return await getCachedOrFetch(cacheKey, async () => {
      console.log(`Fetching product by slug: ${slug}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Product not found");

      // Fetch colors with their sizes nested
      const colorVariants = await fetchProductColorsWithSizes(data.id);

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        shortDescription: data.short_description || "",
        longDescription: data.long_description || "",
        price: {
          original: data.price_original,
          discounted: data.price_discounted || undefined
        },
        categoryId: data.category_id,
        subCategoryId: data.subcategory_id,
        colorVariants,
        ageRanges: data.age_ranges || [],
        specifications: data.specifications || {},
        isLowStock: data.stock_quantity <= 10,
        isOutOfStock: data.is_out_of_stock || data.stock_quantity <= 0,
        isFeatured: data.is_featured || false,
        isTrending: data.is_trending || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Product;
    });
  } finally {
    supabaseManager.untrackConnection(cacheKey);
  }
};

// Cache clearing function
export const clearApiCache = () => {
  cache.clear();
  console.log('API cache cleared');
};
