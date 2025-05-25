
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
      
      if (!user || !isAdmin) {
        setOrders([]);
        return;
      }

      // Fetch orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive"
        });
        return;
      }

      if (!ordersData) {
        setOrders([]);
        return;
      }

      // Process orders with customer and item details
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          // Fetch customer details
          const { data: customerData } = await supabase
            .from('customers')
            .select('name, email')
            .eq('id', order.customer_id)
            .single();

          // Fetch order items
          const { data: orderItemsData } = await supabase
            .from('order_items')
            .select(`
              id, quantity, unit_price, total_price,
              products(title),
              product_colors(name),
              product_sizes(name)
            `)
            .eq('order_id', order.id);

          const itemsWithDetails = (orderItemsData || []).map(item => ({
            ...item,
            product: item.products || { title: 'Unknown Product' },
            color: item.product_colors || { name: 'N/A' },
            size: item.product_sizes || { name: 'N/A' }
          }));

          return {
            ...order,
            customer: customerData || { name: 'Unknown Customer', email: 'No email' },
            order_items: itemsWithDetails
          };
        })
      );

      setOrders(ordersWithDetails);
      
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
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
