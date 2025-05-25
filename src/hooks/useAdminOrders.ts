
import { useState, useEffect } from 'react';
import { supabase, validateSession } from '@/integrations/supabase/client';
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

interface UseAdminOrdersResult {
  orders: AdminOrder[];
  isLoading: boolean;
  error: string | null;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAdminOrders = (): UseAdminOrdersResult => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching orders...');
      
      // Validate session before making request
      const session = await validateSession();
      if (!session) {
        throw new Error('Authentication required');
      }
      
      // Fetch orders with customer data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers!inner (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log('⚠️ No orders found');
        setOrders([]);
        return;
      }

      console.log(`✅ Fetched ${ordersData.length} orders`);

      // Process orders with items
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Fetch order items with product details
            const { data: itemsData } = await supabase
              .from('order_items')
              .select(`
                id,
                quantity,
                unit_price,
                total_price,
                products!inner (
                  title
                ),
                product_colors (
                  name
                ),
                product_sizes (
                  name
                )
              `)
              .eq('order_id', order.id);

            const processedItems = (itemsData || []).map(item => ({
              id: item.id,
              quantity: item.quantity || 0,
              unit_price: Number(item.unit_price || 0),
              total_price: Number(item.total_price || 0),
              product: item.products ? { title: item.products.title } : { title: 'Unknown Product' },
              color: item.product_colors ? { name: item.product_colors.name } : { name: 'N/A' },
              size: item.product_sizes ? { name: item.product_sizes.name } : { name: 'N/A' }
            }));

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
              customer: order.customers ? {
                name: order.customers.name || 'Unknown Customer',
                email: order.customers.email || 'No email'
              } : { name: 'Unknown Customer', email: 'No email' },
              order_items: processedItems
            };
          } catch (error) {
            console.error(`❌ Error processing order ${order.id}:`, error);
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

      console.log('✅ Successfully processed all orders');
      setOrders(ordersWithDetails);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load orders';
      console.error('❌ Error in fetchOrders:', error);
      setError(errorMessage);
      
      toast({
        title: "Error Loading Orders",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${status}`);
      
      // Validate session before making request
      const session = await validateSession();
      if (!session) {
        throw new Error('Authentication required');
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });

      // Refresh orders list
      await fetchOrders();
      
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Remove dependencies to prevent infinite loops

  return {
    orders,
    isLoading,
    error,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
