
import { useState, useCallback } from 'react';

interface DeliveryInfo {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  state: string;
  city: string;
}

export const useDeliveryInfo = () => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);

  const handleDeliveryInfoChange = useCallback((info: DeliveryInfo | null) => {
    setDeliveryInfo(info);
  }, []);

  const clearDeliveryInfo = useCallback(() => {
    setDeliveryInfo(null);
  }, []);

  return {
    deliveryInfo,
    handleDeliveryInfoChange,
    clearDeliveryInfo
  };
};
