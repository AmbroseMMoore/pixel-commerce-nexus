
import { supabase } from "@/integrations/supabase/client";
import { fetchPincodeDetails } from "./pincodeApi";

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
  latitude?: string; // Changed from number to string to match database
  longitude?: string; // Changed from number to string to match database
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
  latitude?: string; // Changed from number to string
  longitude?: string; // Changed from number to string
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

// Improved delivery info lookup with better error handling
export const getDeliveryInfoByPincodeRegion = async (pincode: string): Promise<DeliveryInfoByRegion | null> => {
  try {
    console.log(`Getting delivery info for pincode: ${pincode}`);
    
    // Get location details from the improved pincode API
    const pincodeResponse = await fetchPincodeDetails(pincode);
    
    if (pincodeResponse.Status !== "Success" || !pincodeResponse.PostOffice || pincodeResponse.PostOffice.length === 0) {
      console.log(`No data found for pincode: ${pincode}`);
      return null;
    }

    const postOffice = pincodeResponse.PostOffice[0];
    const state = postOffice.State;
    const district = postOffice.District;
    
    console.log(`Found location: ${district}, ${state}`);

    // Get all zone regions to match against
    const zoneRegions = await fetchZoneRegions();
    console.log(`Loaded ${zoneRegions.length} zone regions`);

    // Find matching zone region with improved logic
    let matchedRegion: ZoneRegion | null = null;

    // Step 1: Try exact district match first
    matchedRegion = zoneRegions.find(region => 
      region.region_type === 'district' && 
      region.state_name.toLowerCase().includes(state.toLowerCase()) &&
      (region.district_name?.toLowerCase() === district.toLowerCase() ||
       region.state_name.toLowerCase().includes(district.toLowerCase()))
    ) || null;

    if (matchedRegion) {
      console.log(`Found exact district match: ${matchedRegion.state_name}`);
    }

    // Step 2: Try partial district matching
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.region_type === 'district' && 
        (region.state_name.toLowerCase().includes(district.toLowerCase()) ||
         district.toLowerCase().includes(region.state_name.toLowerCase().split(' - ')[1] || '') ||
         region.district_name?.toLowerCase().includes(district.toLowerCase()))
      ) || null;
      
      if (matchedRegion) {
        console.log(`Found partial district match: ${matchedRegion.state_name}`);
      }
    }

    // Step 3: Try exact state match
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.region_type === 'state' && 
        region.state_name.toLowerCase() === state.toLowerCase()
      ) || null;
      
      if (matchedRegion) {
        console.log(`Found exact state match: ${matchedRegion.state_name}`);
      }
    }

    // Step 4: Try partial state matching
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.state_name.toLowerCase().includes(state.toLowerCase()) ||
        state.toLowerCase().includes(region.state_name.toLowerCase())
      ) || null;
      
      if (matchedRegion) {
        console.log(`Found partial state match: ${matchedRegion.state_name}`);
      }
    }

    // Step 5: If still no match, try a default zone (if available)
    if (!matchedRegion) {
      matchedRegion = zoneRegions.find(region => 
        region.delivery_zone?.zone_name?.toLowerCase().includes('default') ||
        region.state_name.toLowerCase().includes('general')
      ) || null;
      
      if (matchedRegion) {
        console.log(`Using default zone: ${matchedRegion.state_name}`);
      }
    }

    if (!matchedRegion || !matchedRegion.delivery_zone) {
      console.log(`No matching region found for ${district}, ${state}`);
      return null;
    }

    const result = {
      zone_id: matchedRegion.delivery_zone.id,
      zone_number: matchedRegion.delivery_zone.zone_number,
      zone_name: matchedRegion.delivery_zone.zone_name,
      delivery_days_min: matchedRegion.delivery_zone.delivery_days_min,
      delivery_days_max: matchedRegion.delivery_zone.delivery_days_max,
      delivery_charge: matchedRegion.delivery_zone.delivery_charge,
      state: state,
      city: district
    };

    console.log(`Delivery info found:`, result);
    return result;
  } catch (error) {
    console.error('Error getting delivery info by pincode:', error);
    
    // Return a more user-friendly error message
    if (error instanceof Error) {
      throw new Error(`Unable to check delivery for this pincode: ${error.message}`);
    }
    
    throw new Error('Unable to check delivery availability. Please try again later.');
  }
};
