
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

      // Check if user already has 2 addresses
      const { data: existingAddresses, error: countError } = await supabase
        .from('addresses')
        .select('id')
        .eq('customer_id', user.id);

      if (countError) throw countError;

      if (existingAddresses && existingAddresses.length >= 2) {
        throw new Error('You can only have a maximum of 2 delivery addresses');
      }

      // If this is the first address or is_default is true, make sure to unset other defaults
      if (newAddress.is_default || (existingAddresses && existingAddresses.length === 0)) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('customer_id', user.id);
      }

      const { error } = await supabase
        .from('addresses')
        .insert({
          ...newAddress,
          customer_id: user.id,
          is_default: newAddress.is_default || (existingAddresses && existingAddresses.length === 0)
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add address.",
        variant: "destructive"
      });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Address> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // If setting as default, unset other defaults first
      if (updateData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('customer_id', user.id)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('addresses')
        .update(updateData)
        .eq('id', id)
        .eq('customer_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update address.",
        variant: "destructive"
      });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address.",
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
    updateAddress: updateAddressMutation.mutate,
    isUpdatingAddress: updateAddressMutation.isPending,
    deleteAddress: deleteAddressMutation.mutate,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
};
