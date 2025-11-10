-- Phase 1: Add color_id and stock management to product_sizes table

-- Add color_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_sizes' AND column_name = 'color_id'
  ) THEN
    ALTER TABLE product_sizes 
    ADD COLUMN color_id UUID REFERENCES product_colors(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Add stock quantity column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_sizes' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE product_sizes 
    ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 100;
  END IF;
END$$;

-- Add is_low_stock computed column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_sizes' AND column_name = 'is_low_stock'
  ) THEN
    ALTER TABLE product_sizes
    ADD COLUMN is_low_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity > 0 AND stock_quantity <= 5) STORED;
  END IF;
END$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_sizes_color ON product_sizes(color_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_stock ON product_sizes(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_color ON product_sizes(product_id, color_id);

-- Add comments
COMMENT ON COLUMN product_sizes.color_id IS 'Links size to a specific color variant';
COMMENT ON COLUMN product_sizes.stock_quantity IS 'Available stock for this color+size combination';

-- Clean up and migrate function
CREATE OR REPLACE FUNCTION migrate_and_cleanup_sizes() 
RETURNS void AS $$
DECLARE
  prod RECORD;
  first_color_id UUID;
  size_record RECORD;
  other_color RECORD;
BEGIN
  -- Step 1: Link existing unlinked sizes to first color of each product
  FOR prod IN SELECT DISTINCT product_id FROM product_sizes WHERE color_id IS NULL LOOP
    -- Get first color for this product
    SELECT id INTO first_color_id 
    FROM product_colors 
    WHERE product_id = prod.product_id 
    ORDER BY id 
    LIMIT 1;
    
    -- Skip if no colors exist
    IF first_color_id IS NULL THEN
      RAISE NOTICE 'No colors found for product %, skipping', prod.product_id;
      CONTINUE;
    END IF;
    
    -- Update unlinked sizes to use first color
    UPDATE product_sizes 
    SET color_id = first_color_id
    WHERE product_id = prod.product_id AND color_id IS NULL;
    
  END LOOP;
  
  -- Step 2: Create sizes for other colors (avoiding duplicates)
  FOR prod IN SELECT DISTINCT product_id FROM product_sizes LOOP
    -- Get first color (already has sizes)
    SELECT id INTO first_color_id 
    FROM product_colors 
    WHERE product_id = prod.product_id 
    ORDER BY id 
    LIMIT 1;
    
    IF first_color_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Get sizes for first color
    FOR size_record IN 
      SELECT DISTINCT ON (name) id, name, price_original, price_discounted, stock_quantity
      FROM product_sizes 
      WHERE product_id = prod.product_id AND color_id = first_color_id
    LOOP
      -- Create same size for other colors if it doesn't exist
      FOR other_color IN 
        SELECT id FROM product_colors 
        WHERE product_id = prod.product_id AND id != first_color_id
      LOOP
        -- Only insert if not exists
        INSERT INTO product_sizes (
          product_id, 
          color_id, 
          name, 
          price_original, 
          price_discounted, 
          stock_quantity,
          in_stock
        ) 
        SELECT 
          prod.product_id,
          other_color.id,
          size_record.name,
          size_record.price_original,
          size_record.price_discounted,
          COALESCE(size_record.stock_quantity, 100),
          true
        WHERE NOT EXISTS (
          SELECT 1 FROM product_sizes 
          WHERE product_id = prod.product_id 
          AND color_id = other_color.id 
          AND name = size_record.name
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  -- Step 3: Clean up any remaining duplicates (keep the one with highest stock or first by id)
  DELETE FROM product_sizes a
  USING product_sizes b
  WHERE a.id < b.id
  AND a.product_id = b.product_id
  AND a.color_id = b.color_id
  AND a.name = b.name;
  
  RAISE NOTICE 'Migration and cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Run migration
SELECT migrate_and_cleanup_sizes();

-- Drop migration function
DROP FUNCTION migrate_and_cleanup_sizes();

-- Make color_id required
ALTER TABLE product_sizes 
ALTER COLUMN color_id SET NOT NULL;

-- Drop old unique constraint if exists
ALTER TABLE product_sizes
DROP CONSTRAINT IF EXISTS product_sizes_product_id_name_key;

-- Add new unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_sizes_product_color_name_unique'
  ) THEN
    ALTER TABLE product_sizes
    ADD CONSTRAINT product_sizes_product_color_name_unique 
    UNIQUE (product_id, color_id, name);
  END IF;
END$$;

-- Phase 2: Create stock management functions

CREATE OR REPLACE FUNCTION deduct_stock(
  p_size_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO v_current_stock
  FROM product_sizes
  WHERE id = p_size_id;
  
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE product_sizes
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_size_id
  AND stock_quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_stock(
  p_size_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE product_sizes
  SET stock_quantity = stock_quantity + p_quantity
  WHERE id = p_size_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_stock_availability(
  p_size_id UUID,
  p_required_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_available_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO v_available_stock
  FROM product_sizes
  WHERE id = p_size_id;
  
  RETURN v_available_stock >= p_required_quantity;
END;
$$ LANGUAGE plpgsql STABLE;