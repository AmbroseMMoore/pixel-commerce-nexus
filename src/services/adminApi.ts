
import { supabase } from "@/integrations/supabase/client";
import { Product, Category, SubCategory } from "@/types/product";

// Custom error handling helper
const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);
  
  // Enhance error object with additional information
  if (error.code === "23505") { // Unique constraint violation
    error.message = "A record with this value already exists. Please use unique values.";
  } else if (error.code === "42501") { // Permission denied
    error.message = "You don't have permission to perform this action. Please check your admin credentials and make sure you're logged in with admin privileges.";
    // Force refresh the session to ensure we have the latest auth state
    supabase.auth.refreshSession();
  } else if (error.code === "23503") { // Foreign key violation
    error.message = "This product cannot be deleted because it exists in order history. Please move it to 'Dropped Products' to hide it from customers instead.";
  }
  
  throw error;
};

// Admin Functions for Products
export const createProduct = async (productData: any) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateProduct = async (id: string, productData: any) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    // Check if product has any order items
    const { data: orderItems, error: checkError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (orderItems && orderItems.length > 0) {
      throw new Error(
        'This product cannot be deleted because it has been ordered by customers. ' +
        'Please move it to "Dropped Products" instead to hide it from the website.'
      );
    }
    
    // Only delete if no orders exist
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Move product to dropped (set is_active to false)
export const moveToDropped = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Restore product from dropped (set is_active to true)
export const restoreProduct = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_active: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Fetch all products for admin panel (including dropped products)
export const fetchAllProductsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(id, name, slug),
        subcategories!inner(id, name, slug),
        product_colors(
          id, name, color_code,
          product_images(id, image_url, is_primary, display_order)
        ),
        product_sizes(id, name, stock_quantity, in_stock, is_low_stock, price_original, price_discounted, color_id, product_id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the Product interface
    return (data || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      shortDescription: product.short_description || '',
      longDescription: product.long_description || '',
      categoryId: product.category_id,
      subCategoryId: product.subcategory_id,
      price: {
        original: product.price_original,
        discounted: product.price_discounted
      },
      isActive: product.is_active,
      colorVariants: (product.product_colors || []).map((color: any) => ({
        id: color.id,
        name: color.name,
        colorCode: color.color_code,
        images: (color.product_images || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any) => img.image_url),
        sizes: (product.product_sizes || [])
          .filter((size: any) => size.color_id === color.id)
          .map((size: any) => ({
            id: size.id,
            name: size.name,
            inStock: size.in_stock,
            stockQuantity: size.stock_quantity,
            isLowStock: size.is_low_stock,
            priceOriginal: size.price_original,
            priceDiscounted: size.price_discounted
          }))
      })),
      ageRanges: product.age_ranges || [],
      specifications: product.specifications || {},
      sizeChartHeaders: product.size_chart_headers || [],
      sizeChartRows: product.size_chart_rows || [],
      isLowStock: product.is_low_stock || false,
      isOutOfStock: product.is_out_of_stock || false,
      isFeatured: product.is_featured || false,
      isTrending: product.is_trending || false,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    }));
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Admin Functions for Categories
export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error) throw error;
    
    return (data || []).map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      subCategories: [] // Will be populated by useCategories hook
    }));
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const createCategory = async (categoryData: any) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateCategory = async (id: string, categoryData: any) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Admin Functions for SubCategories
export const fetchAllSubcategories = async (): Promise<SubCategory[]> => {
  try {
    console.log("Fetching subcategories...");
    const { data, error } = await supabase
      .from('subcategories')
      .select('*');
      
    if (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
    
    console.log("Fetched subcategories:", data);
    return (data || []).map(subCategory => ({
      id: subCategory.id,
      name: subCategory.name,
      slug: subCategory.slug,
      categoryId: subCategory.category_id
    }));
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const createSubCategory = async (subCategoryData: any) => {
  try {
    console.log("Creating subcategory with data:", subCategoryData);
    
    // Get and log current auth session for debugging
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting session:", sessionError);
    } else {
      console.log("Current user ID:", sessionData.session?.user?.id);
      console.log("Current user email:", sessionData.session?.user?.email);
      console.log("Access token:", sessionData.session?.access_token?.substring(0, 10) + "...");
    }
    
    // Make sure the user is authenticated before proceeding
    if (!sessionData.session?.user) {
      throw new Error("User is not authenticated. Please log in again.");
    }
    
    // Attempt to create the subcategory
    const { data, error } = await supabase
      .from('subcategories')
      .insert(subCategoryData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
    
    console.log("Subcategory created:", data);
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateSubCategory = async (id: string, subCategoryData: any) => {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .update(subCategoryData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteSubCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Admin Functions for Product Colors
export const createProductColor = async (colorData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_colors')
      .insert(colorData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateProductColor = async (id: string, colorData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_colors')
      .update(colorData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Admin Functions for Product Sizes with Pricing Support
export const createProductSize = async (sizeData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .insert({
        ...sizeData,
        price_original: sizeData.price_original || sizeData.priceOriginal,
        price_discounted: sizeData.price_discounted || sizeData.priceDiscounted || null
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateProductSize = async (id: string, sizeData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .update({
        ...sizeData,
        price_original: sizeData.price_original || sizeData.priceOriginal,
        price_discounted: sizeData.price_discounted || sizeData.priceDiscounted || null
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Admin Functions for Product Images
export const createProductImage = async (imageData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .insert(imageData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteProductImage = async (id: string) => {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// Inventory Management Functions
export interface InventoryItem {
  size_id: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  color_id: string;
  color_name: string;
  color_code: string;
  size_name: string;
  stock_quantity: number;
  price_original: number;
  price_discounted: number | null;
  image_url: string | null;
}

export const fetchInventoryData = async (
  searchQuery: string = "",
  stockFilter: "all" | "in-stock" | "low-stock" | "out-of-stock" = "all"
): Promise<InventoryItem[]> => {
  try {
    let query = supabase
      .from('product_sizes')
      .select(`
        id,
        name,
        stock_quantity,
        price_original,
        price_discounted,
        product_id,
        color_id,
        products!inner(
          id,
          title,
          slug,
          is_active
        ),
        product_colors!inner(
          id,
          name,
          color_code,
          product_images(
            image_url,
            is_primary,
            display_order
          )
        )
      `)
      .eq('products.is_active', true)
      .order('stock_quantity', { ascending: true });

    const { data, error } = await query;

    if (error) throw handleSupabaseError(error);

    if (!data) return [];

    // Transform and filter data
    let inventoryItems: InventoryItem[] = data.map((item: any) => {
      const product = item.products;
      const color = item.product_colors;
      
      // Get primary image or first image
      const images = color.product_images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];

      return {
        size_id: item.id,
        product_id: product.id,
        product_title: product.title,
        product_slug: product.slug,
        color_id: color.id,
        color_name: color.name,
        color_code: color.color_code,
        size_name: item.name,
        stock_quantity: item.stock_quantity,
        price_original: item.price_original,
        price_discounted: item.price_discounted,
        image_url: primaryImage?.image_url || null,
      };
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      inventoryItems = inventoryItems.filter(
        (item) =>
          item.product_title.toLowerCase().includes(query) ||
          item.color_name.toLowerCase().includes(query) ||
          item.size_name.toLowerCase().includes(query)
      );
    }

    // Apply stock filter
    if (stockFilter !== "all") {
      inventoryItems = inventoryItems.filter((item) => {
        if (stockFilter === "out-of-stock") return item.stock_quantity === 0;
        if (stockFilter === "low-stock") return item.stock_quantity > 0 && item.stock_quantity <= 10;
        if (stockFilter === "in-stock") return item.stock_quantity > 10;
        return true;
      });
    }

    return inventoryItems;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
};

export const updateStockQuantity = async (sizeId: string, newQuantity: number) => {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .update({ 
        stock_quantity: newQuantity,
        in_stock: newQuantity > 0
      })
      .eq('id', sizeId)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);

    return data;
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    throw error;
  }
};
