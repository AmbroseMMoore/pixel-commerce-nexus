
import { supabase } from "@/integrations/supabase/client";

export interface ZoneRegion {
  id: string;
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type: 'state' | 'district';
  circle_name?: string;
  region_name?: string;
  division_name?: string;
  office_name?: string;
  office_type?: string;
  delivery?: string;
  latitude?: string;
  longitude?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
  delivery_zone?: {
    id: string;
    zone_number: number;
    zone_name: string;
    delivery_days_min: number;
    delivery_days_max: number;
    delivery_charge: number;
  };
}

export interface DeliveryInfoByRegion {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  state: string;
  city: string;
}

// Get all zone regions
export const fetchZoneRegions = async (): Promise<ZoneRegion[]> => {
  const { data, error } = await supabase
    .from('zone_regions')
    .select(`
      *,
      delivery_zone:delivery_zones(*)
    `)
    .order('state_name');

  if (error) throw error;
  return (data || []).map(item => ({
    ...item,
    region_type: item.region_type as 'state' | 'district'
  }));
};

export const fetchZoneRegionsByZone = async (zoneId: string): Promise<ZoneRegion[]> => {
  const { data, error } = await supabase
    .from('zone_regions')
    .select(`
      *,
      delivery_zone:delivery_zones(*)
    `)
    .eq('delivery_zone_id', zoneId)
    .order('state_name');

  if (error) throw error;
  return (data || []).map(item => ({
    ...item,
    region_type: item.region_type as 'state' | 'district'
  }));
};

export const addZoneRegion = async (zoneRegion: {
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type: 'state' | 'district';
  circle_name?: string;
  region_name?: string;
  division_name?: string;
  office_name?: string;
  office_type?: string;
  delivery?: string;
  latitude?: string;
  longitude?: string;
  pincode?: string;
}): Promise<ZoneRegion> => {
  const { data, error } = await supabase
    .from('zone_regions')
    .insert(zoneRegion)
    .select(`
      *,
      delivery_zone:delivery_zones(*)
    `)
    .single();

  if (error) throw error;
  return {
    ...data,
    region_type: data.region_type as 'state' | 'district'
  };
};

export const removeZoneRegion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('zone_regions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Simplified delivery info lookup using direct pincode match
export const getDeliveryInfoByPincodeRegion = async (pincode: string): Promise<DeliveryInfoByRegion | null> => {
  try {
    console.log(`Getting delivery info for pincode: ${pincode} from zone_regions`);
    
    // Direct pincode lookup in zone_regions table
    const { data: zoneRegions, error } = await supabase
      .from('zone_regions')
      .select(`
        *,
        delivery_zone:delivery_zones(*)
      `)
      .eq('pincode', pincode)
      .order('id', { ascending: true }); // Get first row consistently

    if (error) {
      console.error('Query error:', error);
      throw new Error('Error checking pincode availability');
    }

    if (!zoneRegions || zoneRegions.length === 0) {
      console.log(`No data found for pincode: ${pincode}`);
      return null;
    }

    // Take the first row as specified in requirements
    const firstRegion = zoneRegions[0];
    
    if (!firstRegion.delivery_zone) {
      console.log(`No delivery zone found for pincode: ${pincode}`);
      return null;
    }

    const result: DeliveryInfoByRegion = {
      zone_id: firstRegion.delivery_zone.id,
      zone_number: firstRegion.delivery_zone.zone_number,
      zone_name: firstRegion.delivery_zone.zone_name,
      delivery_days_min: firstRegion.delivery_zone.delivery_days_min,
      delivery_days_max: firstRegion.delivery_zone.delivery_days_max,
      delivery_charge: firstRegion.delivery_zone.delivery_charge,
      state: firstRegion.state_name,
      city: firstRegion.district_name || firstRegion.state_name
    };

    console.log(`Delivery info found:`, result);
    return result;
  } catch (error) {
    console.error('Error getting delivery info by pincode:', error);
    throw new Error(error instanceof Error ? error.message : 'Unable to check delivery availability');
  }
};
