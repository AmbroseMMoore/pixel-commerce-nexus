
-- Create zone_regions table for mapping states/districts to delivery zones
CREATE TABLE zone_regions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_zone_id uuid NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  state_name text NOT NULL,
  district_name text, -- Optional for state-level assignments
  region_type text NOT NULL DEFAULT 'state', -- 'state' or 'district'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(delivery_zone_id, state_name, district_name)
);

-- Create index for faster lookups
CREATE INDEX idx_zone_regions_state ON zone_regions(state_name);
CREATE INDEX idx_zone_regions_district ON zone_regions(state_name, district_name);

-- Insert initial zone region mappings based on your existing zones
INSERT INTO zone_regions (delivery_zone_id, state_name, region_type) VALUES
-- Zone 1 - Same City (Vellore)
((SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu - Vellore District', 'district'),

-- Zone 2 - Across Tamil Nadu
((SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'state'),

-- Zone 3 - Bangalore
((SELECT id FROM delivery_zones WHERE zone_number = 3), 'Karnataka - Bangalore Urban', 'district'),

-- Zone 4 - Delhi
((SELECT id FROM delivery_zones WHERE zone_number = 4), 'Delhi', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 4), 'Haryana - Gurgaon', 'district'),
((SELECT id FROM delivery_zones WHERE zone_number = 4), 'Uttar Pradesh - Gautam Buddha Nagar', 'district'),

-- Zone 5 - South India States
((SELECT id FROM delivery_zones WHERE zone_number = 5), 'Andhra Pradesh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 5), 'Telangana', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 5), 'Karnataka', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 5), 'Kerala', 'state'),

-- Zone 6 - Rest of India
((SELECT id FROM delivery_zones WHERE zone_number = 6), 'Maharashtra', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 6), 'Gujarat', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 6), 'Rajasthan', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 6), 'Madhya Pradesh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 6), 'Punjab', 'state'),

-- Zone 7 - Eastern & Northern States
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'West Bengal', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Bihar', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Jharkhand', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Chhattisgarh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Chandigarh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Odisha', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Uttarakhand', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 7), 'Assam', 'state'),

-- Zone 8 - Remote Areas
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Jammu and Kashmir', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Arunachal Pradesh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Himachal Pradesh', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Mizoram', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Meghalaya', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Manipur', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Nagaland', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Sikkim', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Tripura', 'state'),
((SELECT id FROM delivery_zones WHERE zone_number = 8), 'Ladakh', 'state');

-- Create function to get delivery info by pincode using region mapping
CREATE OR REPLACE FUNCTION get_delivery_info_by_pincode_regions(pincode_param text)
RETURNS TABLE(
  zone_id uuid,
  zone_number integer,
  zone_name text,
  delivery_days_min integer,
  delivery_days_max integer,
  delivery_charge numeric,
  state text,
  city text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  pincode_state text;
  pincode_district text;
BEGIN
  -- This function will be called after getting state/district from API
  -- For now, return empty as the API integration will handle the lookup
  RETURN;
END;
$$;
