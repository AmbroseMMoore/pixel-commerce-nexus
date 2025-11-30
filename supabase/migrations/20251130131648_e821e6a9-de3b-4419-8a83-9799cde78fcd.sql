-- Step 1: Make size_id and color_id nullable in order_items to support SET NULL
ALTER TABLE order_items ALTER COLUMN size_id DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN color_id DROP NOT NULL;

-- Step 2: Drop existing foreign key constraints
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_size_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_color_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_color_id_fkey1;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 3: Recreate foreign keys with ON DELETE SET NULL for size and color
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_size_id_fkey 
  FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE SET NULL;

ALTER TABLE order_items 
  ADD CONSTRAINT order_items_color_id_fkey 
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE SET NULL;

-- Keep product_id with CASCADE since if product is deleted, order items should reference it
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Step 4: Add denormalized columns to preserve historical order data
ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS size_name text,
  ADD COLUMN IF NOT EXISTS color_name text,
  ADD COLUMN IF NOT EXISTS color_code text;

-- Step 5: Backfill existing order_items with current size/color data
UPDATE order_items oi
SET 
  size_name = ps.name,
  color_name = pc.name,
  color_code = pc.color_code
FROM product_sizes ps
JOIN product_colors pc ON ps.color_id = pc.id
WHERE oi.size_id = ps.id AND oi.color_id = pc.id
  AND (oi.size_name IS NULL OR oi.color_name IS NULL OR oi.color_code IS NULL);