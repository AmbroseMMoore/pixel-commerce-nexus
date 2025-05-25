
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const fetchOrders = async () => {
    try {
      console.log('=== Starting orders fetch ===');
      setIsLoading(true);
      
      // First fetch orders
      console.log('Fetching orders...');
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!ordersData) {
        console.log('⚠️ No orders data returned');
        setOrders([]);
        return;
      }

      console.log('✅ Orders fetched:', ordersData.length);

      // Process orders with customer and item data
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Fetch customer data
            const { data: customerData } = await supabase
              .from('customers')
              .select('name, email')
              .eq('id', order.customer_id)
              .single();

            // Fetch order items
            const { data: itemsData } = await supabase
              .from('order_items')
              .select(`
                id,
                quantity,
                unit_price,
                total_price,
                product_id,
                color_id,
                size_id
              `)
              .eq('order_id', order.id);

            // Fetch product, color, and size details for items
            const itemsWithDetails = await Promise.all(
              (itemsData || []).map(async (item) => {
                const [productData, colorData, sizeData] = await Promise.all([
                  supabase.from('products').select('title').eq('id', item.product_id).single(),
                  supabase.from('product_colors').select('name').eq('id', item.color_id).single(),
                  supabase.from('product_sizes').select('name').eq('id', item.size_id).single()
                ]);

                return {
                  id: item.id,
                  quantity: item.quantity || 0,
                  unit_price: Number(item.unit_price || 0),
                  total_price: Number(item.total_price || 0),
                  product: productData.data ? { title: productData.data.title } : { title: 'Unknown Product' },
                  color: colorData.data ? { name: colorData.data.name } : { name: 'N/A' },
                  size: sizeData.data ? { name: sizeData.data.name } : { name: 'N/A' }
                };
              })
            );

            return {
              id: order.id,
              order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
              customer_id: order.customer_id,
              total_amount: Number(order.total_amount || 0),
              status: order.status || 'pending',
              payment_status: order.payment_status || 'pending',
              payment_method: order.payment_method || 'unknown',
              created_at: order.created_at,
              updated_at: order.updated_at,
              customer: customerData ? {
                name: customerData.name || 'Unknown Customer',
                email: customerData.email || 'No email'
              } : { name: 'Unknown Customer', email: 'No email' },
              order_items: itemsWithDetails
            };
          } catch (error) {
            console.error('Error processing order:', order.id, error);
            return {
              id: order.id,
              order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
              customer_id: order.customer_id,
              total_amount: Number(order.total_amount || 0),
              status: order.status || 'pending',
              payment_status: order.payment_status || 'pending',
              payment_method: order.payment_method || 'unknown',
              created_at: order.created_at,
              updated_at: order.updated_at,
              customer: { name: 'Unknown Customer', email: 'No email' },
              order_items: []
            };
          }
        })
      );

      console.log('✅ Processed orders with details:', ordersWithDetails.length);
      setOrders(ordersWithDetails);
      
    } catch (error: any) {
      console.error('❌ Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: `Failed to load orders: ${error.message}`,
        variant: "destructive"
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('Updating order status:', orderId, status);
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
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('=== useAdminOrders hook mounted ===');
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
