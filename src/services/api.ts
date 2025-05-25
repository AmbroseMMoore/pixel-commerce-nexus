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
          product_images (id, image_url, is_primary)
        ),
        product_sizes (id, name, in_stock)
      `);

    if (error) throw error;
    
    return (data || []).map(transformProductData);
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
          product_images (id, image_url, is_primary)
        ),
        product_sizes (id, name, in_stock)
      `)
      .eq('is_featured', true);

    if (error) throw error;
    
    return (data || []).map(transformProductData);
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
          product_images (id, image_url, is_primary)
        ),
        product_sizes (id, name, in_stock)
      `)
      .eq('category_id', categoryData.id);

    if (error) throw error;
    
    return (data || []).map(transformProductData);
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
          product_images (id, image_url, is_primary)
        ),
        product_sizes (id, name, in_stock)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Product not found");
    
    return transformProductData(data);
  } finally {
    cleanup();
  }
};

// Updated Single Product by ID with connection tracking
export const fetchProductById = async (id: string): Promise<Product> => {
  const cleanup = trackApiCall(`product-id-${id}`);
  
  try {
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
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Product not found");
    
    return transformProductData(data);
  } finally {
    cleanup();
  }
};
