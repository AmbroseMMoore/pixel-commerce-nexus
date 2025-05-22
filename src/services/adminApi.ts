
import { supabase } from "@/integrations/supabase/client";
import { Product, Category, SubCategory } from "@/types/product";

// Admin Functions for Products
export const createProduct = async (productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// Admin Functions for Categories
export const createCategory = async (categoryData: any) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// Admin Functions for SubCategories
export const createSubCategory = async (subCategoryData: any) => {
  const { data, error } = await supabase
    .from('subcategories')
    .insert(subCategoryData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateSubCategory = async (id: string, subCategoryData: any) => {
  const { data, error } = await supabase
    .from('subcategories')
    .update(subCategoryData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteSubCategory = async (id: string) => {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// Admin Functions for Product Colors
export const createProductColor = async (colorData: any) => {
  const { data, error } = await supabase
    .from('product_colors')
    .insert(colorData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProductColor = async (id: string, colorData: any) => {
  const { data, error } = await supabase
    .from('product_colors')
    .update(colorData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Admin Functions for Product Sizes
export const createProductSize = async (sizeData: any) => {
  const { data, error } = await supabase
    .from('product_sizes')
    .insert(sizeData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProductSize = async (id: string, sizeData: any) => {
  const { data, error } = await supabase
    .from('product_sizes')
    .update(sizeData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
