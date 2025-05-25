
import { useAdminCustomersData } from './admin/useAdminCustomersData';

export type { AdminCustomer } from './admin/useAdminCustomersData';

export const useAdminCustomers = () => {
  const { customers, isLoading, error, refetch } = useAdminCustomersData();

  return {
    customers,
    isLoading,
    error,
    refetch
  };
};
