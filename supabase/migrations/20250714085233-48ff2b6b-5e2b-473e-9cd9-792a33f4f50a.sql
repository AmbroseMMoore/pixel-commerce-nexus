-- Add display_order column to product_images table for proper image ordering
ALTER TABLE product_images 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing records to have incremental display_order values per product/color combination
-- Using id for ordering since there's no created_at column
WITH ordered_images AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY product_id, color_id ORDER BY is_primary DESC, id) - 1 AS new_order
  FROM product_images
)
UPDATE product_images 
SET display_order = ordered_images.new_order
FROM ordered_images
WHERE product_images.id = ordered_images.id;

-- Create index for better performance when ordering images
CREATE INDEX idx_product_images_display_order ON product_images(product_id, color_id, display_order);