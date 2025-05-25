
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
    try {
      setIsLoading(true);
      
      if (!user || !isAdmin) {
        setCustomers([]);
        return;
      }

      // Fetch customers data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive"
        });
        return;
      }

      if (!customersData) {
        setCustomers([]);
        return;
      }

      // Process customers with order statistics
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          // Fetch order statistics
          const { data: orderStats } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('customer_id', customer.id);

          const orders = orderStats || [];
          const ordersCount = orders.length;
          const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
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
      console.error('Error in fetchCustomers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  return {
    customers,
    isLoading,
    refetch: fetchCustomers
  };
};
