
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
    error.message = "Invalid reference. The item you're referencing may not exist.";
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
