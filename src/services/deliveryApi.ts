
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

export interface ZoneRegion {
  id: string;
  pincode?: string;
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type: 'state' | 'district';
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

// Type for creating/updating delivery zones
interface DeliveryZoneInput {
  id?: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  description?: string;
  is_active: boolean;
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

// Get delivery info by pincode using zone_regions table
export const getDeliveryInfoByPincode = async (pincode: string): Promise<DeliveryInfo | null> => {
  try {
    console.log(`Checking pincode: ${pincode} in zone_regions table`);
    
    // Get all rows for this pincode from zone_regions
    const { data: zoneRegions, error: queryError } = await supabase
      .from('zone_regions')
      .select(`
        id,
        state_name,
        district_name,
        pincode,
        delivery_zone:delivery_zones(
          id,
          zone_number,
          zone_name,
          delivery_days_min,
          delivery_days_max,
          delivery_charge,
          is_active
        )
      `)
      .eq('pincode', pincode)
      .order('id', { ascending: true }); // Get first row consistently

    if (queryError) {
      console.error('Query error:', queryError);
      throw new Error('Error checking pincode availability');
    }

    if (!zoneRegions || zoneRegions.length === 0) {
      throw new Error('Delivery not available for this pincode');
    }

    // Take the first row as specified
    const firstRegion = zoneRegions[0];
    
    if (!firstRegion.delivery_zone || !firstRegion.delivery_zone.is_active) {
      throw new Error('Delivery zone is not active for this pincode');
    }

    const result: DeliveryInfo = {
      zone_id: firstRegion.delivery_zone.id,
      zone_number: firstRegion.delivery_zone.zone_number,
      zone_name: firstRegion.delivery_zone.zone_name,
      delivery_days_min: firstRegion.delivery_zone.delivery_days_min,
      delivery_days_max: firstRegion.delivery_zone.delivery_days_max,
      delivery_charge: firstRegion.delivery_zone.delivery_charge,
      state: firstRegion.state_name,
      city: firstRegion.district_name
    };

    console.log('Delivery info found:', result);
    return result;
  } catch (err) {
    console.error('Error checking pincode:', err);
    throw new Error(err instanceof Error ? err.message : 'Unable to check delivery for this pincode');
  }
};

// Create or update delivery zone
export const upsertDeliveryZone = async (zone: DeliveryZoneInput): Promise<DeliveryZone> => {
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

// Get zone regions with pagination (replaces pincode zones functionality)
export const fetchZoneRegions = async (options: {
  page?: number;
  pageSize?: number;
  zoneId?: string;
  search?: string;
} = {}): Promise<{ zoneRegions: ZoneRegion[]; totalCount: number }> => {
  const { page = 1, pageSize = 50, zoneId, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('zone_regions')
    .select(`
      *,
      delivery_zone:delivery_zones(*)
    `, { count: 'exact' })
    .order('pincode');

  if (zoneId) {
    query = query.eq('delivery_zone_id', zoneId);
  }

  if (search) {
    query = query.or(`pincode.ilike.%${search}%,district_name.ilike.%${search}%,state_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    zoneRegions: (data || []).map(item => ({
      ...item,
      region_type: item.region_type as 'state' | 'district'
    })),
    totalCount: count || 0
  };
};

// Bulk upload zone regions (replaces pincode zones functionality)
export const bulkUploadZoneRegions = async (zoneRegions: Array<{
  pincode: string;
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type?: 'state' | 'district';
  circle_name?: string;
  region_name?: string;
  division_name?: string;
  office_name?: string;
  office_type?: string;
  delivery?: string;
  latitude?: string;
  longitude?: string;
}>): Promise<void> => {
  // Add default values for required fields
  const formattedData = zoneRegions.map(item => ({
    ...item,
    region_type: item.region_type || 'district'
  }));

  const { error } = await supabase
    .from('zone_regions')
    .upsert(formattedData, { onConflict: 'pincode' });

  if (error) throw error;
};

// Delete zone region
export const deleteZoneRegion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('zone_regions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
