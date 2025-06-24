
import { useState, useCallback } from 'react';

interface DeliveryInfo {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  state?: string;
  city?: string;
}

export const useDeliveryInfo = () => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);

  const handleDeliveryInfoChange = useCallback((info: DeliveryInfo | null) => {
    console.log('Delivery info changed:', info);
    setDeliveryInfo(info);
  }, []);

  const clearDeliveryInfo = useCallback(() => {
    console.log('Clearing delivery info');
    setDeliveryInfo(null);
  }, []);

  const getDeliveryCharge = useCallback(() => {
    return deliveryInfo?.delivery_charge || 0;
  }, [deliveryInfo]);

  const getDeliveryDays = useCallback(() => {
    if (!deliveryInfo) return null;
    
    return deliveryInfo.delivery_days_min === deliveryInfo.delivery_days_max 
      ? `${deliveryInfo.delivery_days_min} days`
      : `${deliveryInfo.delivery_days_min}-${deliveryInfo.delivery_days_max} days`;
  }, [deliveryInfo]);

  return {
    deliveryInfo,
    handleDeliveryInfoChange,
    clearDeliveryInfo,
    getDeliveryCharge,
    getDeliveryDays
  };
};
