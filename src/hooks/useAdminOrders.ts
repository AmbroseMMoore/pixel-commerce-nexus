
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
      console.log('Fetching orders - User authenticated:', !!user, 'Is admin:', isAdmin);
      
      if (!user || !isAdmin) {
        console.log('Not authorized to fetch orders');
        setOrders([]);
        return;
      }

      // Get current session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        setOrders([]);
        return;
      }

      console.log('Session valid, fetching orders...');

      // Fetch orders data with a limit to avoid performance issues
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('Orders query result:', { data: ordersData, error: ordersError });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Database Error",
          description: `Failed to fetch orders: ${ordersError.message}`,
          variant: "destructive"
        });
        setOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found in database');
        setOrders([]);
        return;
      }

      console.log(`Found ${ordersData.length} orders, fetching customer and item details...`);

      // Process orders with customer and item details
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            console.log(`Processing order ${order.id}`);
            
            // Fetch customer details
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('name, email')
              .eq('id', order.customer_id)
              .maybeSingle();

            if (customerError) {
              console.error(`Error fetching customer for order ${order.id}:`, customerError);
            }

            // Fetch order items with a simplified query
            const { data: orderItemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('id, quantity, unit_price, total_price, product_id, color_id, size_id')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error(`Error fetching order items for order ${order.id}:`, itemsError);
            }

            // For now, return basic item data without fetching related tables to avoid complexity
            const itemsWithDetails = (orderItemsData || []).map(item => ({
              ...item,
              product: { title: 'Product details loading...' },
              color: { name: 'Color loading...' },
              size: { name: 'Size loading...' }
            }));

            console.log(`Processed order ${order.id} with ${itemsWithDetails.length} items`);

            return {
              ...order,
              customer: customerData || { name: 'Unknown Customer', email: 'No email' },
              order_items: itemsWithDetails
            };
          } catch (error) {
            console.error(`Error processing order ${order.id}:`, error);
            return {
              ...order,
              customer: { name: 'Error loading customer', email: 'No email' },
              order_items: []
            };
          }
        })
      );

      console.log(`Processed ${ordersWithDetails.length} orders with details`);
      setOrders(ordersWithDetails);
      
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please check your connection and try again.",
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
    console.log('useAdminOrders effect triggered', { 
      user: !!user, 
      userId: user?.id,
      isAdmin,
      userEmail: user?.email 
    });
    
    if (user && isAdmin) {
      fetchOrders();
    } else {
      console.log('Skipping fetch - user not authenticated or not admin');
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
