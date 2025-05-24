
import { supabase } from "@/integrations/supabase/client";
import { testProductData, boysCategory, test4Subcategory } from "@/data/testData";

export const createTestProduct = async () => {
  try {
    console.log("Starting test product creation process...");

    // Step 1: Check if Boys category exists, if not create it
    let { data: existingCategory, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', 'Boys')
      .single();

    let categoryId: string;

    if (categoryError && categoryError.code === 'PGRST116') {
      // Category doesn't exist, create it
      console.log("Boys category not found, creating it...");
      const { data: newCategory, error: createCategoryError } = await supabase
        .from('categories')
        .insert(boysCategory)
        .select()
        .single();

      if (createCategoryError) {
        console.error("Error creating Boys category:", createCategoryError);
        throw createCategoryError;
      }

      categoryId = newCategory.id;
      console.log("Boys category created with ID:", categoryId);
    } else if (categoryError) {
      console.error("Error checking for Boys category:", categoryError);
      throw categoryError;
    } else {
      categoryId = existingCategory.id;
      console.log("Boys category found with ID:", categoryId);
    }

    // Step 2: Check if Test 4 subcategory exists, if not create it
    let { data: existingSubcategory, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('*')
      .eq('name', 'Test 4')
      .eq('category_id', categoryId)
      .single();

    let subcategoryId: string;

    if (subcategoryError && subcategoryError.code === 'PGRST116') {
      // Subcategory doesn't exist, create it
      console.log("Test 4 subcategory not found, creating it...");
      const subcategoryToCreate = {
        ...test4Subcategory,
        category_id: categoryId
      };

      const { data: newSubcategory, error: createSubcategoryError } = await supabase
        .from('subcategories')
        .insert(subcategoryToCreate)
        .select()
        .single();

      if (createSubcategoryError) {
        console.error("Error creating Test 4 subcategory:", createSubcategoryError);
        throw createSubcategoryError;
      }

      subcategoryId = newSubcategory.id;
      console.log("Test 4 subcategory created with ID:", subcategoryId);
    } else if (subcategoryError) {
      console.error("Error checking for Test 4 subcategory:", subcategoryError);
      throw subcategoryError;
    } else {
      subcategoryId = existingSubcategory.id;
      console.log("Test 4 subcategory found with ID:", subcategoryId);
    }

    // Step 3: Check if test product already exists
    const { data: existingProduct, error: productCheckError } = await supabase
      .from('products')
      .select('*')
      .eq('title', 'Test Product')
      .eq('category_id', categoryId)
      .eq('subcategory_id', subcategoryId)
      .single();

    if (existingProduct) {
      console.log("Test product already exists with ID:", existingProduct.id);
      return existingProduct;
    }

    // Step 4: Create the test product
    console.log("Creating test product...");
    const productToCreate = {
      ...testProductData,
      category_id: categoryId,
      subcategory_id: subcategoryId
    };

    const { data: newProduct, error: createProductError } = await supabase
      .from('products')
      .insert(productToCreate)
      .select()
      .single();

    if (createProductError) {
      console.error("Error creating test product:", createProductError);
      throw createProductError;
    }

    console.log("Test product created successfully with ID:", newProduct.id);
    return newProduct;

  } catch (error) {
    console.error("Error in createTestProduct:", error);
    throw error;
  }
};
