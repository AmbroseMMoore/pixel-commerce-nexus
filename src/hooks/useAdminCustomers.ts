
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface UseAdminCustomersResult {
  customers: AdminCustomer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminCustomers = (): UseAdminCustomersResult => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching customers with order statistics...');
      
      // Single optimized query using SQL to get customers with their order stats
      const { data, error: queryError } = await supabase.rpc('get_customers_with_stats');
      
      if (queryError) {
        // Fallback to basic query if RPC doesn't exist
        console.warn('RPC function not found, using fallback query');
        return await fetchCustomersBasic();
      }

      if (!data) {
        console.log('⚠️ No customer data returned');
        setCustomers([]);
        return;
      }

      console.log(`✅ Successfully fetched ${data.length} customers`);
      setCustomers(data);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load customers';
      console.error('❌ Error fetching customers:', error);
      setError(errorMessage);
      
      toast({
        title: "Error Loading Customers",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomersBasic = async () => {
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;
      if (!customersData) {
        setCustomers([]);
        return;
      }

      // Process customers with order statistics
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            const { data: ordersData } = await supabase
              .from('orders')
              .select('id, total_amount, created_at')
              .eq('customer_id', customer.id);

            const orders = ordersData || [];
            const ordersCount = orders.length;
            const totalSpent = orders.reduce((sum, order) => 
              sum + Number(order.total_amount || 0), 0);
            const lastOrderDate = orders.length > 0 
              ? orders.sort((a, b) => 
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
          } catch (error) {
            console.error(`Error processing customer ${customer.id}:`, error);
            return {
              id: customer.id,
              name: customer.name || '',
              last_name: customer.last_name || '',
              email: customer.email || '',
              mobile_number: customer.mobile_number || '',
              created_at: customer.created_at,
              orders_count: 0,
              total_spent: 0,
              last_order_date: null
            };
          }
        })
      );

      setCustomers(customersWithStats);
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    refetch: fetchCustomers
  };
};
