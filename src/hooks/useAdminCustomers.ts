
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
      console.log('=== Starting customer fetch ===');
      console.log('User authenticated:', !!user, 'Is admin:', isAdmin);
      
      if (!user || !isAdmin) {
        console.log('Not authorized - clearing customers');
        setCustomers([]);
        return;
      }

      // Test database connection
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('customers')
        .select('count(*)', { count: 'exact', head: true });

      if (testError) {
        console.error('Database connection test failed:', testError);
        toast({
          title: "Database Connection Error",
          description: "Unable to connect to the database. Please check your connection.",
          variant: "destructive"
        });
        return;
      }

      console.log('Database connection successful, customer count:', testData);

      // Fetch customers data
      console.log('Fetching customers data...');
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast({
          title: "Database Error",
          description: `Failed to fetch customers: ${customersError.message}`,
          variant: "destructive"
        });
        setCustomers([]);
        return;
      }

      console.log('Raw customers data:', customersData);

      if (!customersData || customersData.length === 0) {
        console.log('No customers found in database');
        setCustomers([]);
        return;
      }

      // Process customers with order statistics
      console.log(`Processing ${customersData.length} customers...`);
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            // Fetch order statistics
            const { data: orderStats, error: statsError } = await supabase
              .from('orders')
              .select('total_amount, created_at')
              .eq('customer_id', customer.id);

            if (statsError) {
              console.warn(`Error fetching orders for customer ${customer.id}:`, statsError);
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

      console.log('Processed customers with stats:', customersWithStats);
      setCustomers(customersWithStats);
      
      toast({
        title: "Success",
        description: `Loaded ${customersWithStats.length} customers`,
      });
      
    } catch (error) {
      console.error('Unexpected error in fetchCustomers:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while loading customers.",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== useAdminCustomers effect triggered ===', { 
      hasUser: !!user, 
      userId: user?.id,
      isAdmin,
      userEmail: user?.email 
    });
    
    if (user && isAdmin) {
      fetchCustomers();
    } else {
      console.log('Skipping fetch - not authenticated or not admin');
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
