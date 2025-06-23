
-- Create delivery_zones table
CREATE TABLE delivery_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_number integer NOT NULL UNIQUE,
  zone_name text NOT NULL,
  delivery_days_min integer NOT NULL,
  delivery_days_max integer NOT NULL,
  delivery_charge numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pincode_zones table for mapping pincodes to zones
CREATE TABLE pincode_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode text NOT NULL,
  delivery_zone_id uuid NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  state text,
  city text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(pincode)
);

-- Create index for faster pincode lookups
CREATE INDEX idx_pincode_zones_pincode ON pincode_zones(pincode);

-- Add delivery-related columns to orders table
ALTER TABLE orders 
ADD COLUMN delivery_zone_id uuid REFERENCES delivery_zones(id),
ADD COLUMN delivery_charge numeric DEFAULT 0,
ADD COLUMN estimated_delivery_days integer,
ADD COLUMN delivery_pincode text;

-- Insert initial delivery zones based on your requirements
INSERT INTO delivery_zones (zone_number, zone_name, delivery_days_min, delivery_days_max, delivery_charge, description) VALUES
(1, 'Same City (Vellore)', 1, 2, 75, 'Vellore city delivery'),
(2, 'Across Tamil Nadu', 2, 3, 100, 'Tamil Nadu state delivery'),
(3, 'Bangalore', 3, 3, 125, 'Bangalore city delivery'),
(4, 'Delhi', 4, 4, 145, 'Delhi NCR delivery'),
(5, 'South India States', 4, 4, 175, 'Andhra Pradesh, Telangana, Karnataka, Kerala'),
(6, 'Rest of India', 5, 5, 240, 'Other major cities and states'),
(7, 'Eastern & Northern States', 6, 8, 260, 'Assam, Bihar, Jharkhand, Chhattisgarh, Chandigarh, Odisha, Uttarakhand, West Bengal'),
(8, 'Remote Areas', 10, 10, 270, 'Jammu & Kashmir, Arunachal Pradesh, Himachal Pradesh, Mizoram, Meghalaya, Manipur, Nagaland, Sikkim');

-- Insert some sample pincode mappings (you can add more)
INSERT INTO pincode_zones (pincode, delivery_zone_id, state, city) VALUES
-- Zone 1 - Vellore
('632001', (SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu', 'Vellore'),
('632002', (SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu', 'Vellore'),
('632003', (SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu', 'Vellore'),
('632004', (SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu', 'Vellore'),

-- Zone 2 - Tamil Nadu (sample pincodes)
('600001', (SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'Chennai'),
('641001', (SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'Coimbatore'),
('620001', (SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'Tiruchirappalli'),
('625001', (SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'Madurai'),

-- Zone 3 - Bangalore
('560001', (SELECT id FROM delivery_zones WHERE zone_number = 3), 'Karnataka', 'Bangalore'),
('560002', (SELECT id FROM delivery_zones WHERE zone_number = 3), 'Karnataka', 'Bangalore'),
('560025', (SELECT id FROM delivery_zones WHERE zone_number = 3), 'Karnataka', 'Bangalore'),

-- Zone 4 - Delhi
('110001', (SELECT id FROM delivery_zones WHERE zone_number = 4), 'Delhi', 'New Delhi'),
('110002', (SELECT id FROM delivery_zones WHERE zone_number = 4), 'Delhi', 'Delhi'),
('201301', (SELECT id FROM delivery_zones WHERE zone_number = 4), 'Uttar Pradesh', 'Noida'),

-- Zone 5 - South India States (sample)
('500001', (SELECT id FROM delivery_zones WHERE zone_number = 5), 'Telangana', 'Hyderabad'),
('682001', (SELECT id FROM delivery_zones WHERE zone_number = 5), 'Kerala', 'Kochi'),
('530001', (SELECT id FROM delivery_zones WHERE zone_number = 5), 'Andhra Pradesh', 'Visakhapatnam'),

-- Zone 6 - Rest of India (sample)
('400001', (SELECT id FROM delivery_zones WHERE zone_number = 6), 'Maharashtra', 'Mumbai'),
('411001', (SELECT id FROM delivery_zones WHERE zone_number = 6), 'Maharashtra', 'Pune'),
('380001', (SELECT id FROM delivery_zones WHERE zone_number = 6), 'Gujarat', 'Ahmedabad'),

-- Zone 7 - Eastern & Northern States (sample)
('700001', (SELECT id FROM delivery_zones WHERE zone_number = 7), 'West Bengal', 'Kolkata'),
('800001', (SELECT id FROM delivery_zones WHERE zone_number = 7), 'Bihar', 'Patna'),
('781001', (SELECT id FROM delivery_zones WHERE zone_number = 7), 'Assam', 'Guwahati'),

-- Zone 8 - Remote Areas (sample)
('190001', (SELECT id FROM delivery_zones WHERE zone_number = 8), 'Jammu & Kashmir', 'Srinagar'),
('171001', (SELECT id FROM delivery_zones WHERE zone_number = 8), 'Himachal Pradesh', 'Shimla'),
('790001', (SELECT id FROM delivery_zones WHERE zone_number = 8), 'Arunachal Pradesh', 'Itanagar');

-- Create function to get delivery info by pincode
CREATE OR REPLACE FUNCTION get_delivery_info_by_pincode(pincode_param text)
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
BEGIN
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
  WHERE pz.pincode = pincode_param AND dz.is_active = true;
END;
$$;
