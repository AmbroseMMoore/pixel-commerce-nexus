
import { supabase } from "@/integrations/supabase/client";

export interface DeliveryZone {
  id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PincodeZone {
  id: string;
  pincode: string;
  delivery_zone_id: string;
  state?: string;
  city?: string;
  created_at: string;
  delivery_zone?: DeliveryZone;
}

export interface DeliveryInfo {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  state?: string;
  city?: string;
}

// Get all delivery zones
export const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('zone_number');

  if (error) throw error;
  return data || [];
};

// Get delivery info by pincode
export const getDeliveryInfoByPincode = async (pincode: string): Promise<DeliveryInfo | null> => {
  const { data, error } = await supabase.rpc('get_delivery_info_by_pincode', {
    pincode_param: pincode
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Create or update delivery zone
export const upsertDeliveryZone = async (zone: Partial<DeliveryZone>): Promise<DeliveryZone> => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .upsert(zone)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete delivery zone
export const deleteDeliveryZone = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Get pincode zones with pagination
export const fetchPincodeZones = async (options: {
  page?: number;
  pageSize?: number;
  zoneId?: string;
  search?: string;
} = {}): Promise<{ pincodeZones: PincodeZone[]; totalCount: number }> => {
  const { page = 1, pageSize = 50, zoneId, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('pincode_zones')
    .select(`
      *,
      delivery_zone:delivery_zones(*)
    `, { count: 'exact' })
    .order('pincode');

  if (zoneId) {
    query = query.eq('delivery_zone_id', zoneId);
  }

  if (search) {
    query = query.or(`pincode.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    pincodeZones: data || [],
    totalCount: count || 0
  };
};

// Bulk upload pincodes
export const bulkUploadPincodes = async (pincodes: Array<{
  pincode: string;
  delivery_zone_id: string;
  state?: string;
  city?: string;
}>): Promise<void> => {
  const { error } = await supabase
    .from('pincode_zones')
    .upsert(pincodes, { onConflict: 'pincode' });

  if (error) throw error;
};

// Delete pincode zone
export const deletePincodeZone = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pincode_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
