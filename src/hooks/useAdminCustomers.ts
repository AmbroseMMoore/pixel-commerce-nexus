
import { useState, useEffect } from 'react';
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

export const useAdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      console.log('=== Starting customer fetch ===');
      setIsLoading(true);
      
      // First fetch customers
      console.log('Fetching customers...');
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
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

      console.log('✅ Customers fetched:', customersData.length);

      // Then fetch orders for each customer
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          try {
            const { data: ordersData, error: ordersError } = await supabase
              .from('orders')
              .select('id, total_amount, created_at')
              .eq('customer_id', customer.id);

            if (ordersError) {
              console.error('Error fetching orders for customer:', customer.id, ordersError);
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
            console.error('Error processing customer:', customer.id, error);
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

      console.log('✅ Processed customers with stats:', customersWithStats.length);
      setCustomers(customersWithStats);
      
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
    fetchCustomers();
  }, []);

  return {
    customers,
    isLoading,
    refetch: fetchCustomers
  };
};
