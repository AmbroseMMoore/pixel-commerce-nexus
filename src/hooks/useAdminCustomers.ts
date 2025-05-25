
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
      console.log('Starting to fetch customers...', { user: !!user, isAdmin });
      
      if (!user || !isAdmin) {
        console.log('User not authenticated or not admin, skipping fetch');
        setCustomers([]);
        return;
      }

      // Fetch customers data
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Fetched customers:', customersData?.length || 0, 'customers');

      if (!customersData || customersData.length === 0) {
        console.log('No customers found in database');
        setCustomers([]);
        return;
      }

      // Process customers with order statistics
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            // Fetch order statistics for this customer
            const { data: orderStats, error: statsError } = await supabase
              .from('orders')
              .select('total_amount, created_at')
              .eq('customer_id', customer.id);

            if (statsError) {
              console.error('Error fetching order stats for customer', customer.id, ':', statsError);
              // Continue with zero stats instead of failing
            }

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
          } catch (error) {
            console.error('Error processing customer stats for', customer.id, ':', error);
            return {
              ...customer,
              orders_count: 0,
              total_spent: 0,
              last_order_date: null
            };
          }
        })
      );

      console.log('Processed customers with stats:', customersWithStats.length);
      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAdminCustomers effect triggered', { user: !!user, isAdmin });
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
