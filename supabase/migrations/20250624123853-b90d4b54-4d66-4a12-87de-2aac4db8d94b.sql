
-- Add price columns to product_sizes table
ALTER TABLE product_sizes 
ADD COLUMN price_original numeric,
ADD COLUMN price_discounted numeric;

-- Update existing size records to use the product's base price
UPDATE product_sizes 
SET price_original = (
  SELECT price_original 
  FROM products 
  WHERE products.id = product_sizes.product_id
),
price_discounted = (
  SELECT price_discounted 
  FROM products 
  WHERE products.id = product_sizes.product_id
);

-- Make price_original required for new records
ALTER TABLE product_sizes 
ALTER COLUMN price_original SET NOT NULL;
