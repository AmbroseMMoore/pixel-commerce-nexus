
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
      console.log('Fetching customers - User authenticated:', !!user, 'Is admin:', isAdmin);
      
      if (!user || !isAdmin) {
        console.log('Not authorized to fetch customers');
        setCustomers([]);
        return;
      }

      // Get current session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        setCustomers([]);
        return;
      }

      console.log('Session valid, fetching customers...');

      // Fetch customers data with a simplified query
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Customers query result:', { data: customersData, error });

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Database Error",
          description: `Failed to fetch customers: ${error.message}`,
          variant: "destructive"
        });
        setCustomers([]);
        return;
      }

      if (!customersData || customersData.length === 0) {
        console.log('No customers found in database');
        setCustomers([]);
        return;
      }

      console.log(`Found ${customersData.length} customers, calculating order statistics...`);

      // Process customers with order statistics
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            console.log(`Fetching orders for customer ${customer.id}`);
            
            // Fetch order statistics for this customer
            const { data: orderStats, error: statsError } = await supabase
              .from('orders')
              .select('total_amount, created_at')
              .eq('customer_id', customer.id);

            if (statsError) {
              console.error(`Error fetching orders for customer ${customer.id}:`, statsError);
              // Continue with zero stats instead of failing
            }

            const orders = orderStats || [];
            const ordersCount = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
            const lastOrderDate = orders.length > 0 
              ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
              : null;

            console.log(`Customer ${customer.id} stats:`, { ordersCount, totalSpent, lastOrderDate });

            return {
              ...customer,
              orders_count: ordersCount,
              total_spent: totalSpent,
              last_order_date: lastOrderDate
            };
          } catch (error) {
            console.error(`Error processing customer ${customer.id}:`, error);
            return {
              ...customer,
              orders_count: 0,
              total_spent: 0,
              last_order_date: null
            };
          }
        })
      );

      console.log(`Processed ${customersWithStats.length} customers with statistics`);
      setCustomers(customersWithStats);
      
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please check your connection and try again.",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAdminCustomers effect triggered', { 
      user: !!user, 
      userId: user?.id,
      isAdmin,
      userEmail: user?.email 
    });
    
    if (user && isAdmin) {
      fetchCustomers();
    } else {
      console.log('Skipping fetch - user not authenticated or not admin');
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
