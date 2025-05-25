
import { supabase, validateSession } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAdminOrderActions = () => {
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${status}`);
      
      const session = await validateSession();
      if (!session) {
        throw new Error('Authentication required');
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });

      return true;
      
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update order status.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    updateOrderStatus
  };
};
