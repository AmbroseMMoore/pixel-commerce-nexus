-- Safer cleanup migration for duplicate colors
-- This only removes duplicates that are NOT referenced in orders

-- First, identify which duplicate colors are safe to delete (not in orders)
CREATE TEMP TABLE safe_duplicates AS
WITH duplicates AS (
  SELECT 
    pc.id,
    pc.product_id,
    pc.name,
    pc.color_code,
    ROW_NUMBER() OVER (
      PARTITION BY pc.product_id, pc.name, pc.color_code 
      ORDER BY pc.id
    ) as rn
  FROM product_colors pc
),
colors_in_orders AS (
  SELECT DISTINCT oi.color_id
  FROM order_items oi
)
SELECT d.id
FROM duplicates d
WHERE d.rn > 1
  AND d.id NOT IN (SELECT color_id FROM colors_in_orders);

-- Delete sizes for safe duplicate colors
DELETE FROM product_sizes 
WHERE color_id IN (SELECT id FROM safe_duplicates);

-- Delete images for safe duplicate colors
DELETE FROM product_images 
WHERE color_id IN (SELECT id FROM safe_duplicates);

-- Delete the safe duplicate colors themselves
DELETE FROM product_colors 
WHERE id IN (SELECT id FROM safe_duplicates);

-- Report what was cleaned
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deleted_count FROM safe_duplicates;
  RAISE NOTICE 'Cleaned up % duplicate color variants that were not referenced in orders', deleted_count;
END $$;

DROP TABLE safe_duplicates;