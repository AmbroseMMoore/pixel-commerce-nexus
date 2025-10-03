-- Update age ranges to more granular months
-- Step 1: Split 0-6 months into 0-3 months and 3-6 months
UPDATE products 
SET age_ranges = array_cat(
  array_remove(age_ranges, '0-6 months'),
  ARRAY['0-3 months', '3-6 months']
)
WHERE '0-6 months' = ANY(age_ranges);

-- Step 2: Split 6-12 months into 6-9 months and 9-12 months
UPDATE products 
SET age_ranges = array_cat(
  array_remove(age_ranges, '6-12 months'),
  ARRAY['6-9 months', '9-12 months']
)
WHERE '6-12 months' = ANY(age_ranges);