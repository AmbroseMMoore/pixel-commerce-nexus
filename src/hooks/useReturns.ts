
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ReturnItem {
  id: string;
  order_id: string;
  order_item_id: string;
  reason: string;
  status: string;
  return_type: string;
  created_at: string;
  updated_at: string;
  order: {
    order_number: string;
    created_at: string;
  };
  order_item: {
    product: {
      title: string;
    };
    color: {
      name: string;
    };
    size: {
      name: string;
    };
    quantity: number;
    unit_price: number;
  };
}

export const useReturns = () => {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchReturns = async () => {
    if (!user) {
      setReturns([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          id,
          order_id,
          order_item_id,
          reason,
          status,
          return_type,
          created_at,
          updated_at
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const returnsWithDetails = await Promise.all(
        (data || []).map(async (returnItem) => {
          // Fetch order details
          const { data: order } = await supabase
            .from('orders')
            .select('order_number, created_at')
            .eq('id', returnItem.order_id)
            .single();

          // Fetch order item details
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('quantity, unit_price, product_id, color_id, size_id')
            .eq('id', returnItem.order_item_id)
            .single();

          let orderItemDetails = {
            product: { title: '' },
            color: { name: '' },
            size: { name: '' },
            quantity: 0,
            unit_price: 0
          };

          if (orderItem) {
            // Fetch product, color, and size details
            const [productRes, colorRes, sizeRes] = await Promise.all([
              supabase.from('products').select('title').eq('id', orderItem.product_id).single(),
              supabase.from('product_colors').select('name').eq('id', orderItem.color_id).single(),
              supabase.from('product_sizes').select('name').eq('id', orderItem.size_id).single()
            ]);

            orderItemDetails = {
              product: { title: productRes.data?.title || '' },
              color: { name: colorRes.data?.name || '' },
              size: { name: sizeRes.data?.name || '' },
              quantity: orderItem.quantity,
              unit_price: orderItem.unit_price
            };
          }

          return {
            ...returnItem,
            order: order || { order_number: '', created_at: '' },
            order_item: orderItemDetails
          };
        })
      );

      setReturns(returnsWithDetails);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast({
        title: "Error",
        description: "Failed to load returns.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReturn = async (orderItemId: string, reason: string, returnType: 'return' | 'replace' = 'return') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a return.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First get the order item to find the order_id
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', orderItemId)
        .single();

      if (orderItemError) throw orderItemError;

      const { error } = await supabase
        .from('returns')
        .insert({
          order_id: orderItem.order_id,
          order_item_id: orderItemId,
          customer_id: user.id,
          reason,
          return_type: returnType
        });

      if (error) throw error;

      toast({
        title: `${returnType === 'return' ? 'Return' : 'Replacement'} Request Created`,
        description: `Your ${returnType} request has been submitted successfully.`,
      });

      fetchReturns();
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Error",
        description: `Failed to create ${returnType} request.`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [user]);

  return {
    returns,
    isLoading,
    createReturn,
    refetch: fetchReturns
  };
};
