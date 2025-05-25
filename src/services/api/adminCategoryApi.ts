
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./adminApiBase";
import { Category, SubCategory } from "@/types/product";

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
      subCategories: []
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
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting session:", sessionError);
    } else {
      console.log("Current user ID:", sessionData.session?.user?.id);
      console.log("Current user email:", sessionData.session?.user?.email);
      console.log("Access token:", sessionData.session?.access_token?.substring(0, 10) + "...");
    }
    
    if (!sessionData.session?.user) {
      throw new Error("User is not authenticated. Please log in again.");
    }
    
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
