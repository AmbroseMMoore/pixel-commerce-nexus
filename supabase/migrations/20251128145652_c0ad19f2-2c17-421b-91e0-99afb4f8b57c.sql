-- Update get_delivery_info_by_pincode to check both zone_regions and pincode_zones
CREATE OR REPLACE FUNCTION public.get_delivery_info_by_pincode(pincode_param text)
RETURNS TABLE(zone_id uuid, zone_number integer, zone_name text, delivery_days_min integer, delivery_days_max integer, delivery_charge numeric, state text, city text)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- First try zone_regions table (has more comprehensive pincode data - 165,635 pincodes)
  RETURN QUERY
  SELECT 
    dz.id as zone_id,
    dz.zone_number,
    dz.zone_name,
    dz.delivery_days_min,
    dz.delivery_days_max,
    dz.delivery_charge,
    zr.state_name as state,
    zr.district_name as city
  FROM zone_regions zr
  JOIN delivery_zones dz ON zr.delivery_zone_id = dz.id
  WHERE zr.pincode = pincode_param AND dz.is_active = true
  LIMIT 1;
  
  -- If found in zone_regions, exit
  IF FOUND THEN 
    RETURN; 
  END IF;
  
  -- Fallback to pincode_zones table (148 pincodes)
  RETURN QUERY
  SELECT 
    dz.id as zone_id,
    dz.zone_number,
    dz.zone_name,
    dz.delivery_days_min,
    dz.delivery_days_max,
    dz.delivery_charge,
    pz.state,
    pz.city
  FROM pincode_zones pz
  JOIN delivery_zones dz ON pz.delivery_zone_id = dz.id
  WHERE pz.pincode = pincode_param AND dz.is_active = true
  LIMIT 1;
END;
$$;