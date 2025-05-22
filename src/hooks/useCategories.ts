
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchSubCategories } from "@/services/api";
import { Category, SubCategory } from "@/types/product";
import { useEffect, useState } from "react";

export const useCategories = () => {
  const [mergedCategories, setMergedCategories] = useState<Category[]>([]);
  
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });
  
  const subCategoriesQuery = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubCategories
  });
  
  useEffect(() => {
    if (categoriesQuery.data && subCategoriesQuery.data) {
      // Merge subcategories into their parent categories
      const categories = [...categoriesQuery.data];
      
      categories.forEach(category => {
        category.subCategories = subCategoriesQuery.data.filter(
          subCategory => subCategory.categoryId === category.id
        );
      });
      
      setMergedCategories(categories);
    }
  }, [categoriesQuery.data, subCategoriesQuery.data]);
  
  return {
    categories: mergedCategories,
    isLoading: categoriesQuery.isLoading || subCategoriesQuery.isLoading,
    error: categoriesQuery.error || subCategoriesQuery.error,
    refetch: () => {
      categoriesQuery.refetch();
      subCategoriesQuery.refetch();
    }
  };
};

// Hook for subcategories of a specific category
export const useSubcategoriesByCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["subcategories", "byCategory", categoryId],
    queryFn: () => fetchSubCategories(),
    select: (data) => data.filter(subCategory => subCategory.categoryId === categoryId),
    enabled: !!categoryId
  });
};
