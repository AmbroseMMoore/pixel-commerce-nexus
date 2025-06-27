
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

  // Transform color variants with context-aware image handling
  const colorVariants = (product.product_colors || []).map((color: any) => {
    console.log('Processing color variant:', color);
    console.log('Raw images for color:', color.product_images);

    // Transform images based on context
    const images = (color.product_images || []).map((img: any) => {
      console.log('Processing image:', img);
      
      if (isAdminContext) {
        // For admin context, return full metadata for editing
        return {
          id: img.id,
          url: img.image_url || '/placeholder.svg',
          filename: img.media_file_name || '',
          fileType: img.media_file_type || 'jpg'
        };
      } else {
        // For customer context, return simple URL string
        return img.image_url || '/placeholder.svg';
      }
    });

    return {
      id: color.id,
      name: color.name || '',
      colorCode: color.color_code || '#ffffff',
      images: images
    };
  });

  console.log('Transformed color variants:', colorVariants);

  // Transform size variants and sort by name
  const sizeVariants = (product.product_sizes || []).map((size: any) => ({
    id: size.id,
    name: size.name,
    inStock: size.in_stock !== false,
    priceOriginal: size.price_original || product.price_original,
    priceDiscounted: size.price_discounted || product.price_discounted || undefined
  })).sort((a: any, b: any) => a.name.localeCompare(b.name));

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
    sizeVariants: sizeVariants,
    ageRanges: product.age_ranges || [],
    specifications: product.specifications || {},
    isLowStock: product.stock_quantity <= 10,
    isOutOfStock: product.stock_quantity <= 0,
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
          product_images (id, image_url, is_primary, media_file_name, media_file_type)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
      `);

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
          product_images (id, image_url, is_primary, media_file_name, media_file_type)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
      `)
      .eq('is_featured', true);

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
          product_images (id, image_url, is_primary, media_file_name, media_file_type)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
      `)
      .eq('category_id', categoryData.id);

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
          product_images (id, image_url, is_primary, media_file_name, media_file_type)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
      `)
      .eq('slug', slug)
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
          product_images (id, image_url, is_primary, media_file_name, media_file_type)
        ),
        product_sizes (id, name, in_stock, price_original, price_discounted)
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
