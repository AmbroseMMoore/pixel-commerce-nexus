
import { supabase } from "@/integrations/supabase/client";
import { fetchPincodeDetails } from "./pincodeApi";

export interface ZoneRegion {
  id: string;
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type: 'state' | 'district';
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

// Get regions for a specific zone
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

// Add a region to a zone
export const addZoneRegion = async (zoneRegion: {
  delivery_zone_id: string;
  state_name: string;
  district_name?: string;
  region_type: 'state' | 'district';
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

// Remove a region from a zone
export const removeZoneRegion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('zone_regions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Get delivery info by pincode using API + region matching
export const getDeliveryInfoByPincodeRegion = async (pincode: string): Promise<DeliveryInfoByRegion | null> => {
  try {
    // First, get location details from PostalPincode.in API
    const pincodeResponse = await fetchPincodeDetails(pincode);
    
    if (pincodeResponse.Status !== "Success" || !pincodeResponse.PostOffice || pincodeResponse.PostOffice.length === 0) {
      return null;
    }

    const postOffice = pincodeResponse.PostOffice[0];
    const state = postOffice.State;
    const district = postOffice.District;

    // Get all zone regions to match against
    const zoneRegions = await fetchZoneRegions();

    // Find matching zone region
    let matchedRegion: ZoneRegion | null = null;

    // First, try to match by specific district
    matchedRegion = zoneRegions.find(region => 
      region.region_type === 'district' && 
      region.state_name.toLowerCase().includes(state.toLowerCase()) &&
      region.state_name.toLowerCase().includes(district.toLowerCase())
    ) || null;

    // If no district match, try to match by state
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.region_type === 'state' && 
        region.state_name.toLowerCase() === state.toLowerCase()
      ) || null;
    }

    // If still no match, try partial state matching
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.state_name.toLowerCase().includes(state.toLowerCase()) ||
        state.toLowerCase().includes(region.state_name.toLowerCase())
      ) || null;
    }

    if (!matchedRegion || !matchedRegion.delivery_zone) {
      return null;
    }

    return {
      zone_id: matchedRegion.delivery_zone.id,
      zone_number: matchedRegion.delivery_zone.zone_number,
      zone_name: matchedRegion.delivery_zone.zone_name,
      delivery_days_min: matchedRegion.delivery_zone.delivery_days_min,
      delivery_days_max: matchedRegion.delivery_zone.delivery_days_max,
      delivery_charge: matchedRegion.delivery_zone.delivery_charge,
      state: state,
      city: district
    };
  } catch (error) {
    console.error('Error getting delivery info by pincode:', error);
    return null;
  }
};
