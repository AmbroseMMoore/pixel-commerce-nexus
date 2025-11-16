
import { supabase } from "@/integrations/supabase/client";
import { Product, Category, SubCategory } from "@/types/product";
import { supabaseManager } from "@/lib/supabaseManager";

// Helper function to track API calls
const trackApiCall = (queryKey: string) => {
  supabaseManager.trackConnection(queryKey);
  return () => supabaseManager.untrackConnection(queryKey);
};

// Categories API
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) throw error;
  
  // Format the data to match our Category type
  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    subCategories: [] // Will be populated by fetchSubCategories
  }));
};

// Subcategories API
export const fetchSubCategories = async (): Promise<SubCategory[]> => {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*');

  if (error) throw error;
  
  // Format the data to match our SubCategory type
  return (data || []).map(subCategory => ({
    id: subCategory.id,
    name: subCategory.name,
    slug: subCategory.slug,
    categoryId: subCategory.category_id
  }));
};

// Helper function to transform product data with context-aware image handling
const transformProductData = (product: any, isAdminContext: boolean = false): Product => {
  console.log('Transforming product data:', product);
  console.log('Raw color variants:', product.product_colors);
  console.log('Admin context:', isAdminContext);

  // Build color map with images and sizes
  const colorMap = new Map<string, any>();
  
  // First, build color map with basic info
  (product.product_colors || []).forEach((color: any) => {
    colorMap.set(color.id, {
      id: color.id,
      name: color.name || '',
      colorCode: color.color_code || '#ffffff',
      images: [],
      sizes: []
    });
  });
  
  // Add images to colors (use nested product_images under each color)
  (product.product_colors || []).forEach((color: any) => {
    const target = colorMap.get(color.id);
    if (!target) return;

    (color.product_images || []).forEach((img: any) => {
      const imageData = isAdminContext
        ? {
            id: img.id,
            url: img.image_url || '/placeholder.svg',
            filename: img.media_file_name || '',
            fileType: img.media_file_type || 'jpg'
          }
        : (img.image_url || '/placeholder.svg');

      target.images.push({
        data: imageData,
        order: img.display_order ?? 999,
        isPrimary: img.is_primary
      });
    });
  });
  
  // Sort images by display_order and extract data
  colorMap.forEach((color) => {
    color.images = color.images
      .sort((a: any, b: any) => {
        if (a.order !== b.order) return a.order - b.order;
        return (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0);
      })
      .map((img: any) => img.data);
  });
  
  // Add sizes to their respective colors
  (product.product_sizes || []).forEach((size: any) => {
    if (size.color_id && colorMap.has(size.color_id)) {
      colorMap.get(size.color_id).sizes.push({
        id: size.id,
        name: size.name,
        inStock: size.stock_quantity > 0,
        stockQuantity: size.stock_quantity || 0,
        isLowStock: size.stock_quantity > 0 && size.stock_quantity <= 5,
        priceOriginal: size.price_original || product.price_original,
        priceDiscounted: size.price_discounted || product.price_discounted || undefined
      });
    }
  });
  
  // Sort sizes by name for each color
  colorMap.forEach((color) => {
    color.sizes.sort((a: any, b: any) => a.name.localeCompare(b.name));
  });
  
  const colorVariants = Array.from(colorMap.values());
  
  // Calculate product-level stock status
  const allSizes = colorVariants.flatMap(c => c.sizes);
  const totalStock = allSizes.reduce((sum, s) => sum + s.stockQuantity, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && allSizes.some(s => s.isLowStock);

  const transformedProduct = {
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
    colorVariants: colorVariants,
    ageRanges: product.age_ranges || [],
    specifications: product.specifications || {},
    isLowStock: isLowStock,
    isOutOfStock: isOutOfStock,
    isFeatured: product.is_featured || false,
    isTrending: product.is_trending || false,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  };

  console.log('Final transformed product:', transformedProduct);
  return transformedProduct;
};

// Updated Products API with connection tracking
export const fetchProducts = async (): Promise<Product[]> => {
  const cleanup = trackApiCall('products-all');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_colors (
          id, name, color_code,
          product_images (id, image_url, color_id, is_primary, media_file_name, media_file_type, display_order)
        ),
        product_sizes (id, product_id, color_id, name, stock_quantity, in_stock, price_original, price_discounted)
      `)
      .eq('is_active', true);

    if (error) throw error;
    
    return (data || []).map(product => transformProductData(product, false));
  } finally {
    cleanup();
  }
};

// Updated Featured Products with connection tracking
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const cleanup = trackApiCall('products-featured');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_colors (
          id, name, color_code,
          product_images (id, image_url, is_primary, media_file_name, media_file_type, display_order)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
      `)
      .eq('is_featured', true)
      .eq('is_active', true);

    if (error) throw error;
    
    return (data || []).map(product => transformProductData(product, false));
  } finally {
    cleanup();
  }
};

// Updated Products by Category with connection tracking
export const fetchProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  const cleanup = trackApiCall(`products-category-${categorySlug}`);
  
  try {
    // First, get the category ID from the slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) throw categoryError;
    if (!categoryData) throw new Error("Category not found");

    // Then, get the products for that category
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_colors (
          id, name, color_code,
          product_images (id, image_url, color_id, is_primary, media_file_name, media_file_type, display_order)
        ),
        product_sizes (id, product_id, color_id, name, stock_quantity, in_stock, price_original, price_discounted)
      `)
      .eq('category_id', categoryData.id)
      .eq('is_active', true);

    if (error) throw error;
    
    return (data || []).map(product => transformProductData(product, false));
  } finally {
    cleanup();
  }
};

// Updated Single Product by Slug with connection tracking
export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const cleanup = trackApiCall(`product-slug-${slug}`);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_colors (
          id, name, color_code,
          product_images (id, image_url, color_id, is_primary, media_file_name, media_file_type, display_order)
        ),
        product_sizes (id, product_id, color_id, name, stock_quantity, in_stock, price_original, price_discounted)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Product not found");
    
    return transformProductData(data, false);
  } finally {
    cleanup();
  }
};

// Updated Single Product by ID with connection tracking and admin context
export const fetchProductById = async (id: string): Promise<Product> => {
  const cleanup = trackApiCall(`product-id-${id}`);
  
  try {
    console.log('Fetching product by ID for admin context:', id);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_colors (
          id, name, color_code,
          product_images (id, image_url, color_id, is_primary, media_file_name, media_file_type, display_order)
        ),
        product_sizes (id, product_id, color_id, name, stock_quantity, in_stock, price_original, price_discounted)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    if (!data) {
      console.error('No product data found for ID:', id);
      throw new Error("Product not found");
    }

    console.log('Raw product data from database:', data);
    
    // Use admin context for proper image metadata
    return transformProductData(data, true);
  } finally {
    cleanup();
  }
};
