-- Fix stock management issues
-- 1. Change default stock quantity from 100 to 0
-- 2. Clean up existing data inconsistencies

-- Change the default value for stock_quantity from 100 to 0
ALTER TABLE product_sizes 
ALTER COLUMN stock_quantity SET DEFAULT 0;

-- Fix products where in_stock=false but stock_quantity > 0
-- These should have 0 stock if marked as out of stock
UPDATE product_sizes 
SET stock_quantity = 0 
WHERE in_stock = false AND stock_quantity > 0;

-- Ensure in_stock is true when stock_quantity > 0
-- This fixes the opposite problem
UPDATE product_sizes 
SET in_stock = true 
WHERE stock_quantity > 0 AND in_stock = false;

-- Report what was fixed
DO $$
DECLARE
  zeroed_count INTEGER;
  restocked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO zeroed_count 
  FROM product_sizes 
  WHERE in_stock = false AND stock_quantity > 0;
  
  SELECT COUNT(*) INTO restocked_count 
  FROM product_sizes 
  WHERE stock_quantity > 0 AND in_stock = false;
  
  RAISE NOTICE 'Stock management fixed:';
  RAISE NOTICE '- Changed default stock quantity from 100 to 0';
  RAISE NOTICE '- Set stock to 0 for % products marked as out of stock', zeroed_count;
  RAISE NOTICE '- Set in_stock=true for % products with stock > 0', restocked_count;
END $$;