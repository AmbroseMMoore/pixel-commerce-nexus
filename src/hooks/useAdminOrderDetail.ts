import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OrderDetailItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    title: string;
    slug: string;
  } | null;
  color: {
    id: string;
    name: string;
    color_code: string;
  } | null;
  size: {
    id: string;
    name: string;
  } | null;
  images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

export interface OrderDetailAddress {
  id: string;
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  changed_at: string;
  notes?: string | null;
  delivery_partner_name?: string | null;
  delivery_date?: string | null;
  shipment_id?: string | null;
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  delivery_partner_name?: string;
  delivery_date?: string;
  shipment_id?: string;
  delivery_charge?: number;
  estimated_delivery_days?: number;
  delivery_pincode?: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    mobile_number: string;
  } | null;
  delivery_address: OrderDetailAddress | null;
  delivery_zone: {
    zone_name: string;
    zone_number: number;
    delivery_days_min: number;
    delivery_days_max: number;
  } | null;
  order_items: OrderDetailItem[];
  status_history: OrderStatusHistoryItem[];
}

export const useAdminOrderDetail = (orderId: string) => {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderDetail = async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch order with all related data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            mobile_number
          ),
          addresses!orders_delivery_address_id_fkey (
            id,
            full_name,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            phone_number
          ),
          delivery_zones (
            zone_name,
            zone_number,
            delivery_days_min,
            delivery_days_max
          )
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) {
        toast({
          title: 'Order not found',
          description: 'The requested order could not be found.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          color_id,
          size_id,
          products (
            id,
            title,
            slug
          ),
          product_colors (
            id,
            name,
            color_code
          ),
          product_sizes (
            id,
            name
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Fetch product images for each item
      const itemsWithImages = await Promise.all(
        (itemsData || []).map(async (item: any) => {
          if (!item.product_id || !item.color_id) {
            return {
              ...item,
              product: item.products,
              color: item.product_colors,
              size: item.product_sizes,
              images: [],
            };
          }

          const { data: imagesData } = await supabase
            .from('product_images')
            .select('image_url, is_primary')
            .eq('product_id', item.product_id)
            .eq('color_id', item.color_id)
            .order('is_primary', { ascending: false })
            .order('display_order', { ascending: true })
            .limit(1);

          return {
            id: item.id,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
            product: item.products,
            color: item.product_colors,
            size: item.product_sizes,
            images: imagesData || [],
          };
        })
      );

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;

      const processedOrder: AdminOrderDetail = {
        id: orderData.id,
        order_number: orderData.order_number,
        customer_id: orderData.customer_id,
        total_amount: Number(orderData.total_amount),
        status: orderData.status,
        payment_status: orderData.payment_status,
        payment_method: orderData.payment_method,
        razorpay_order_id: orderData.razorpay_order_id,
        razorpay_payment_id: orderData.razorpay_payment_id,
        delivery_partner_name: orderData.delivery_partner_name,
        delivery_date: orderData.delivery_date,
        shipment_id: orderData.shipment_id,
        delivery_charge: orderData.delivery_charge ? Number(orderData.delivery_charge) : undefined,
        estimated_delivery_days: orderData.estimated_delivery_days,
        delivery_pincode: orderData.delivery_pincode,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        customer: orderData.customers,
        delivery_address: orderData.addresses,
        delivery_zone: orderData.delivery_zones,
        order_items: itemsWithImages,
        status_history: historyData || [],
      };

      setOrder(processedOrder);
    } catch (error: any) {
      console.error('Error fetching order detail:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load order details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  return {
    order,
    isLoading,
    refetch: fetchOrderDetail,
  };
};
