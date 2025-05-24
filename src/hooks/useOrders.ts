
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      title: string;
    };
    color: {
      name: string;
    };
    size: {
      name: string;
    };
  }>;
}

export const useOrders = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          created_at,
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            product:products(title),
            color:product_colors(name),
            size:product_sizes(name)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id,
  });

  return {
    orders,
    isLoading,
    error
  };
};
