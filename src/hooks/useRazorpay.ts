
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async (amount: number, receipt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          action: 'create_order',
          amount,
          receipt,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData: any, orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          action: 'verify_payment',
          ...paymentData,
          order_id: orderId,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const initiatePayment = async (
    amount: number,
    orderId: string,
    customerInfo: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: () => void,
    onFailure: (error: any) => void
  ) => {
    setIsLoading(true);
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const orderData = await createOrder(amount, orderId);
      
      if (!orderData.success) {
        throw new Error('Failed to create Razorpay order');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'CUTEBAE',
        description: `Order #${orderId}`,
        order_id: orderData.order.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact,
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async (response: any) => {
          try {
            const verification = await verifyPayment(response, orderId);
            if (verification.success) {
              toast({
                title: "Payment Successful!",
                description: "Your order has been placed successfully.",
              });
              onSuccess();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
            onFailure(error);
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive"
            });
            onFailure(new Error('Payment cancelled'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      onFailure(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiatePayment,
    isLoading,
  };
};
