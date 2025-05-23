
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
    console.log('Starting to fetch customers...');
    console.log('User:', user);
    console.log('IsAdmin:', isAdmin);

    if (!user) {
      console.log('No authenticated user');
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching customers from Supabase...');
      
      // Fetch all customers
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Raw customers data:', customersData);

      if (!customersData || customersData.length === 0) {
        console.log('No customers found in database');
        setCustomers([]);
        setIsLoading(false);
        return;
      }

      // Fetch order statistics for each customer
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            console.log('Fetching stats for customer:', customer.id);
            
            const { data: orderStats, error: statsError } = await supabase
              .from('orders')
              .select('total_amount, created_at')
              .eq('customer_id', customer.id);

            if (statsError) {
              console.error('Error fetching customer stats for', customer.id, ':', statsError);
              // Continue with default values instead of failing
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

      console.log('Customers with stats:', customersWithStats);
      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching admin customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please check your permissions and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always try to fetch customers when component mounts or user changes
    fetchCustomers();
  }, [user]);

  return {
    customers,
    isLoading,
    refetch: fetchCustomers
  };
};
