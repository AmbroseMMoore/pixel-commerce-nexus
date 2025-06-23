
-- Add new columns to the zone_regions table
ALTER TABLE zone_regions 
ADD COLUMN circle_name text,
ADD COLUMN region_name text,
ADD COLUMN division_name text,
ADD COLUMN office_name text,
ADD COLUMN office_type text,
ADD COLUMN delivery text,
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Create indexes for better performance on frequently queried columns
CREATE INDEX idx_zone_regions_circle_name ON zone_regions(circle_name);
CREATE INDEX idx_zone_regions_region_name ON zone_regions(region_name);
CREATE INDEX idx_zone_regions_division_name ON zone_regions(division_name);
CREATE INDEX idx_zone_regions_office_name ON zone_regions(office_name);
CREATE INDEX idx_zone_regions_office_type ON zone_regions(office_type);
CREATE INDEX idx_zone_regions_delivery ON zone_regions(delivery);
CREATE INDEX idx_zone_regions_coordinates ON zone_regions(latitude, longitude);

-- Example bulk insert format for adding multiple rows
-- Replace the sample data with your actual data
INSERT INTO zone_regions (
    delivery_zone_id,
    state_name,
    district_name,
    region_type,
    circle_name,
    region_name,
    division_name,
    office_name,
    office_type,
    delivery,
    latitude,
    longitude
) VALUES
-- Sample format - replace with your actual data
((SELECT id FROM delivery_zones WHERE zone_number = 1), 'Tamil Nadu', 'Vellore', 'district', 'Chennai Circle', 'Chennai Region', 'Vellore Division', 'Vellore Head Post Office', 'HO', 'Delivery', 12.9165, 79.1325),
((SELECT id FROM delivery_zones WHERE zone_number = 2), 'Tamil Nadu', 'Chennai', 'district', 'Chennai Circle', 'Chennai Region', 'Chennai Division', 'Chennai GPO', 'GPO', 'Delivery', 13.0827, 80.2707),
((SELECT id FROM delivery_zones WHERE zone_number = 3), 'Karnataka', 'Bangalore Urban', 'district', 'Bangalore Circle', 'Bangalore Region', 'Bangalore Division', 'Bangalore GPO', 'GPO', 'Delivery', 12.9716, 77.5946);

-- For bulk inserting 10,000+ rows, you can use this format:
-- INSERT INTO zone_regions (delivery_zone_id, state_name, district_name, region_type, circle_name, region_name, division_name, office_name, office_type, delivery, latitude, longitude) VALUES
-- (uuid_value_1, 'State1', 'District1', 'district', 'Circle1', 'Region1', 'Division1', 'Office1', 'HO', 'Delivery', 12.345, 78.901),
-- (uuid_value_2, 'State2', 'District2', 'state', 'Circle2', 'Region2', 'Division2', 'Office2', 'SO', 'Non-Delivery', 13.456, 79.012),
-- ... continue for all your rows
-- Make sure to end with a semicolon after the last row

-- Alternative approach for very large datasets using COPY command:
-- COPY zone_regions (delivery_zone_id, state_name, district_name, region_type, circle_name, region_name, division_name, office_name, office_type, delivery, latitude, longitude)
-- FROM '/path/to/your/data.csv'
-- WITH (FORMAT csv, HEADER true);
