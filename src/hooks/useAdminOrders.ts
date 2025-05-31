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
    if (authLoading || !user) {
      console.log('⏳ Auth still loading or no user, skipping orders fetch');
      return;
    }

    try {
      console.log('🚀 Starting orders fetch for user:', user.id);
      setIsLoading(true);

      // --- STEP 1: Confirm session works ---
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔐 Session check:', sessionData);

      // --- STEP 2: Fetch orders with joins ---
      console.log('📦 Fetching orders with related joins...');
      const { data: ordersData, error: ordersError, status } = await supabase
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
          customers (
            name,
            email
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (title),
            product_colors (name),
            product_sizes (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // console.log('📊 Raw Supabase Response Status:', status);
      // console.log('📊 Raw Supabase Data:', ordersData);
      // console.log('📊 Supabase Error:', ordersError);

      if (ordersError) {
        console.error('❌ Supabase error fetching orders:', ordersError);
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        console.warn('⚠️ No orders returned from query.');
        setOrders([]);
        return;
      }

      // --- STEP 3: Map and transform data ---
      console.log('🔧 Processing fetched order data...');
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
        customer: order.customers
          ? {
              name: order.customers.name || 'Unknown',
              email: order.customers.email || 'No email',
            }
          : { name: 'Unknown', email: 'No email' },
        order_items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          quantity: item.quantity || 0,
          unit_price: Number(item.unit_price || 0),
          total_price: Number(item.total_price || 0),
          product: item.products
            ? { title: item.products.title }
            : { title: 'Unknown Product' },
          color: item.product_colors
            ? { name: item.product_colors.name }
            : { name: 'N/A' },
          size: item.product_sizes
            ? { name: item.product_sizes.name }
            : { name: 'N/A' },
        })),
      }));

      console.log('✅ Orders processed successfully:', processedOrders);
      setOrders(processedOrders);

    } catch (error: any) {
      console.error('❌ Exception in fetchOrders:', error);
      toast({
        title: "Fetch Error",
        description: error.message || 'Failed to load orders.',
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('📝 Updating order status to', status, 'for ID:', orderId);
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
      console.error('❌ Error updating order status:', error);
      toast({
        title: "Update Error",
        description: error.message || "Failed to update order.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('📦 useAdminOrders hook mounted');
    console.log('🔄 Auth loading:', authLoading, 'User:', !!user);
    
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setOrders([]);
      setIsLoading(false);
    }
  }, [authLoading, user]);

  return {
    orders,
    isLoading: authLoading || isLoading,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
