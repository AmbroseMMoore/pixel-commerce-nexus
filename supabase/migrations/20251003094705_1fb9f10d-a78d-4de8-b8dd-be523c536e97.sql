-- Update delivery charges for all zones as per new pricing structure

-- Zone 1: ₹80
UPDATE delivery_zones 
SET delivery_charge = 80, updated_at = now()
WHERE zone_number = 1;

-- Zones 2, 3, 5: ₹150
UPDATE delivery_zones 
SET delivery_charge = 150, updated_at = now()
WHERE zone_number IN (2, 3, 5);

-- Zones 4, 6, 7, 8: ₹200
UPDATE delivery_zones 
SET delivery_charge = 200, updated_at = now()
WHERE zone_number IN (4, 6, 7, 8);