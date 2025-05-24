
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AdminCustomer {
  id: string;
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export const useAdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchCustomers = async () => {
    if (!user || !isAdmin) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          last_name,
          email,
          mobile_number,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch order statistics for each customer
      const customersWithStats = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: orderStats, error: statsError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('customer_id', customer.id);

          if (statsError) {
            console.error('Error fetching customer stats:', statsError);
            return {
              ...customer,
              orders_count: 0,
              total_spent: 0,
              last_order_date: null
            };
          }

          const orders = orderStats || [];
          const ordersCount = orders.length;
          const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
          const lastOrderDate = orders.length > 0 
            ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null;

          return {
            ...customer,
            orders_count: ordersCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching admin customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user, isAdmin]);

  return {
    customers,
    isLoading,
    refetch: fetchCustomers
  };
};
