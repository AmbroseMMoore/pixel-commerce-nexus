
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLogging } from "./useLogging";

export interface FlashSaleProduct {
  product_id: string;
  product_title: string;
  product_slug: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  flash_sale_title: string;
  flash_sale_end_date: string;
}

export const useFlashSaleProducts = () => {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: async (): Promise<FlashSaleProduct[]> => {
      try {
        const { data, error } = await supabase.rpc('get_active_flash_sale_products');
        
        if (error) {
          logError('flash_sale_fetch_error', { error: error.message });
          throw error;
        }
        
        return data || [];
      } catch (error) {
        logError('flash_sale_fetch_error', { error: error instanceof Error ? error.message : error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdminFlashSales = () => {
  const { logError } = useLogging();

  return useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('flash_sales')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          logError('admin_flash_sales_fetch_error', { error: error.message });
          throw error;
        }
        
        return data || [];
      } catch (error) {
        logError('admin_flash_sales_fetch_error', { error: error instanceof Error ? error.message : error });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
