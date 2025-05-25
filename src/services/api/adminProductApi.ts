
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./adminApiBase";

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
