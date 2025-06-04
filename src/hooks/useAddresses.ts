
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  customer_id: string;
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useAddresses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading, error } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user?.id,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id' | 'customer_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('addresses')
        .insert({
          ...newAddress,
          customer_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Address added",
        description: "Your address has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add address.",
        variant: "destructive"
      });
    }
  });

  return {
    addresses,
    isLoading,
    error,
    addAddress: addAddressMutation.mutate,
    isAddingAddress: addAddressMutation.isPending,
  };
};
