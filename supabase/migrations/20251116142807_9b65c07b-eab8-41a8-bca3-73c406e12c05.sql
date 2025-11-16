-- Add is_active column to products table for soft delete functionality
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Set all existing products to active
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN products.is_active IS 'False means product is dropped/inactive and hidden from customer website but retained in database';