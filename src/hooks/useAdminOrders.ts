
import { useAdminOrdersData } from './admin/useAdminOrdersData';
import { useAdminOrderActions } from './admin/useAdminOrderActions';

export type { AdminOrder } from './admin/useAdminOrdersData';

export const useAdminOrders = () => {
  const { orders, isLoading, error, refetch } = useAdminOrdersData();
  const { updateOrderStatus } = useAdminOrderActions();

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      await refetch();
    }
  };

  return {
    orders,
    isLoading,
    error,
    updateOrderStatus: handleUpdateOrderStatus,
    refetch
  };
};
