
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    // Don't fetch if auth is still loading or user is not available
    if (authLoading || !user) {
      console.log('Auth still loading or no user, skipping fetch');
      return;
    }

    try {
      console.log('=== Starting customer fetch ===');
      setIsLoading(true);
      
      // First, test basic connection
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('customers')
        .select('count(*)')
        .limit(1);
        
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        throw testError;
      }
      
      console.log('✅ Supabase connection successful, customer count test:', testData);

      // Fetch customers with optimized query using joins
      console.log('Fetching customers with order statistics...');
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          last_name,
          email,
          mobile_number,
          created_at,
          orders(
            id,
            total_amount,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        throw customersError;
      }

      if (!customersData) {
        console.log('⚠️ No customers data returned');
        setCustomers([]);
        return;
      }

      console.log('✅ Raw customers data:', customersData);

      // Process customers with order statistics
      const processedCustomers = customersData.map((customer: any) => {
        const orders = customer.orders || [];
        const ordersCount = orders.length;
        const totalSpent = orders.reduce((sum: number, order: any) => 
          sum + Number(order.total_amount || 0), 0);
        const lastOrderDate = orders.length > 0 
          ? orders.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].created_at
          : null;

        return {
          id: customer.id,
          name: customer.name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          mobile_number: customer.mobile_number || '',
          created_at: customer.created_at,
          orders_count: ordersCount,
          total_spent: totalSpent,
          last_order_date: lastOrderDate
        };
      });

      console.log('✅ Processed customers:', processedCustomers);
      setCustomers(processedCustomers);
      
    } catch (error: any) {
      console.error('❌ Error in fetchCustomers:', error);
      toast({
        title: "Error",
        description: `Failed to load customers: ${error.message}`,
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== useAdminCustomers hook mounted ===');
    console.log('Auth loading:', authLoading, 'User:', !!user);
    
    // Only fetch when auth is done loading and user exists
    if (!authLoading && user) {
      fetchCustomers();
    } else if (!authLoading && !user) {
      // Auth finished loading but no user - stop loading
      setIsLoading(false);
      setCustomers([]);
    }
  }, [authLoading, user]);

  return {
    customers,
    isLoading: authLoading || isLoading,
    refetch: fetchCustomers
  };
};
