
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchSubCategories } from "@/services/api";
import { Category, SubCategory } from "@/types/product";

// Hook for all categories
export const useCategories = () => {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });
  
  const subCategoriesQuery = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubCategories
  });
  
  // Compute the merged categories array that includes subcategories
  const mergedCategories = React.useMemo(() => {
    if (!categoriesQuery.data || !subCategoriesQuery.data) return [];
    
    const categories = [...categoriesQuery.data];
    categories.forEach(category => {
      category.subCategories = subCategoriesQuery.data.filter(
        subCategory => subCategory.categoryId === category.id
      );
    });
    
    return categories;
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
    queryFn: fetchSubCategories,
    select: (data) => data.filter(subCategory => subCategory.categoryId === categoryId),
    enabled: !!categoryId
  });
};
