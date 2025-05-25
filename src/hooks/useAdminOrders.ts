
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      title: string;
    } | null;
    color: {
      name: string;
    } | null;
    size: {
      name: string;
    } | null;
  }>;
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to fetch orders...', { user: !!user, isAdmin });
      
      if (!user || !isAdmin) {
        console.log('User not authenticated or not admin, skipping fetch');
        setOrders([]);
        return;
      }

      // Fetch orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Fetched orders:', ordersData?.length || 0, 'orders');

      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found in database');
        setOrders([]);
        return;
      }

      // Process orders with customer and item details
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Fetch customer details
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('name, email')
              .eq('id', order.customer_id)
              .maybeSingle();

            if (customerError) {
              console.error('Error fetching customer for order', order.id, ':', customerError);
            }

            // Fetch order items
            const { data: orderItemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('id, quantity, unit_price, total_price, product_id, color_id, size_id')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error('Error fetching order items for order', order.id, ':', itemsError);
            }

            // Fetch related product, color, and size data for items
            const itemsWithDetails = await Promise.all(
              (orderItemsData || []).map(async (item) => {
                try {
                  const [productResult, colorResult, sizeResult] = await Promise.all([
                    item.product_id ? supabase.from('products').select('title').eq('id', item.product_id).maybeSingle() : Promise.resolve({ data: null }),
                    item.color_id ? supabase.from('product_colors').select('name').eq('id', item.color_id).maybeSingle() : Promise.resolve({ data: null }),
                    item.size_id ? supabase.from('product_sizes').select('name').eq('id', item.size_id).maybeSingle() : Promise.resolve({ data: null })
                  ]);

                  return {
                    ...item,
                    product: productResult.data,
                    color: colorResult.data,
                    size: sizeResult.data
                  };
                } catch (error) {
                  console.error('Error fetching item details:', error);
                  return {
                    ...item,
                    product: null,
                    color: null,
                    size: null
                  };
                }
              })
            );

            return {
              ...order,
              customer: customerData,
              order_items: itemsWithDetails
            };
          } catch (error) {
            console.error('Error processing order details for order', order.id, ':', error);
            return {
              ...order,
              customer: null,
              order_items: []
            };
          }
        })
      );

      console.log('Processed orders with details:', ordersWithDetails.length);
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('useAdminOrders effect triggered', { user: !!user, isAdmin });
    if (user && isAdmin) {
      fetchOrders();
    } else {
      setOrders([]);
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  return {
    orders,
    isLoading,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
