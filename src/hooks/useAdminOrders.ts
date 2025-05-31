
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    // Don't fetch if auth is still loading or user is not available
    if (authLoading || !user) {
      console.log('Auth still loading or no user, skipping orders fetch');
      return;
    }

    try {
      console.log('=== Starting orders fetch ===');
      setIsLoading(true);
      
      // // Test basic connection
      // console.log('Testing orders table connection...');
      // const { data: testData, error: testError } = await supabase
      //   .from('orders')
      //   .select('count(*)')
      //   .limit(1);
        
      // if (testError) {
      //   console.error('❌ Orders connection test failed:', testError);
      //   throw testError;
      // }
      
      // console.log('✅ Orders connection successful, count test:', testData);

      // Fetch orders with optimized query using joins
      console.log('Fetching orders with related data...');
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_id,
          total_amount,
          status,
          payment_status,
          payment_method,
          created_at,
          updated_at,
          customers(
            name,
            email
          ),
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            products(title),
            product_colors(name),
            product_sizes(name)
          )
        `)
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

      console.log('✅ Raw orders data:', ordersData);

      // Process orders with proper structure
      const processedOrders = ordersData.map((order: any) => ({
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
        order_items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          quantity: item.quantity || 0,
          unit_price: Number(item.unit_price || 0),
          total_price: Number(item.total_price || 0),
          product: item.products ? { title: item.products.title } : { title: 'Unknown Product' },
          color: item.product_colors ? { name: item.product_colors.name } : { name: 'N/A' },
          size: item.product_sizes ? { name: item.product_sizes.name } : { name: 'N/A' }
        }))
      }));

      console.log('✅ Processed orders:', processedOrders);
      setOrders(processedOrders);
      
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
    console.log('Auth loading:', authLoading, 'User:', !!user);
    
    // Only fetch when auth is done loading and user exists
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      // Auth finished loading but no user - stop loading
      setIsLoading(false);
      setOrders([]);
    }
  }, [authLoading, user]);

  return {
    orders,
    isLoading: authLoading || isLoading,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
