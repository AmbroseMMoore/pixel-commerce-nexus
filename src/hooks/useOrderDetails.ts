
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OrderStatusHistoryItem {
  status: string;
  changed_at: string;
  notes?: string | null;
  delivery_partner_name?: string | null;
  delivery_date?: string | null;
  shipment_id?: string | null;
}

export const useOrderDetails = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderStatusHistory = useCallback(async (orderId: string) => {
    if (!orderId) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data as OrderStatusHistoryItem[];
    } catch (error) {
      console.error('Error fetching order status history:', error);
      toast({
        title: 'Error',
        description: 'Could not load order status history',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchOrderStatusHistory,
    isLoading,
  };
};
