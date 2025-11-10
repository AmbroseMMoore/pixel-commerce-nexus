import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventoryData, updateStockQuantity } from "@/services/adminApi";

interface UseInventoryOptions {
  searchQuery?: string;
  stockFilter?: "all" | "in-stock" | "low-stock" | "out-of-stock";
}

export const useInventory = (options: UseInventoryOptions = {}) => {
  const queryClient = useQueryClient();
  const { searchQuery = "", stockFilter = "all" } = options;

  // Fetch inventory data
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventory", searchQuery, stockFilter],
    queryFn: () => fetchInventoryData(searchQuery, stockFilter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ sizeId, newQuantity }: { sizeId: string; newQuantity: number }) =>
      updateStockQuantity(sizeId, newQuantity),
    onSuccess: () => {
      // Invalidate all inventory queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      // Also invalidate product queries to reflect updated stock
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-products"] });
    },
  });

  return {
    inventoryData,
    isLoading,
    error,
    updateStockMutation,
  };
};
