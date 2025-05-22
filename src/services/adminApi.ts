import { supabase } from "@/integrations/supabase/client";
import { Product, Category, SubCategory } from "@/types/product";

// Custom error handling helper
const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);
  
  // Enhance error object with additional information
  if (error.code === "23505") { // Unique constraint violation
    error.message = "A record with this value already exists. Please use unique values.";
  } else if (error.code === "42501") { // Permission denied
    error.message = "You don't have permission to perform this action. Please check your admin credentials and make sure you're logged in.";
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
    const { data, error } = await supabase
      .from('subcategories')
      .select('*');
      
    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from('subcategories')
      .insert(subCategoryData)
      .select()
      .single();
      
    if (error) throw error;
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

// Admin Functions for Product Sizes
export const createProductSize = async (sizeData: any) => {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .insert(sizeData)
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
      .update(sizeData)
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
