
-- Database Checkpoint: Add indexes and optimize performance
-- This will improve query performance and resolve timeout issues

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_trending ON products(is_trending);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_color_id ON product_images(color_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create optimized view for product listings
CREATE OR REPLACE VIEW product_list_view AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.price_original,
    p.price_discounted,
    p.short_description,
    p.is_featured,
    p.is_trending,
    p.stock_quantity,
    p.is_out_of_stock,
    p.created_at,
    c.name as category_name,
    c.slug as category_slug,
    sc.name as subcategory_name,
    sc.slug as subcategory_slug,
    (
        SELECT pi.image_url 
        FROM product_images pi 
        WHERE pi.product_id = p.id 
        AND pi.is_primary = true 
        LIMIT 1
    ) as primary_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id;

-- Create function to get products with pagination
CREATE OR REPLACE FUNCTION get_products_paginated(
    page_num integer DEFAULT 1,
    page_size integer DEFAULT 20,
    category_filter uuid DEFAULT NULL,
    subcategory_filter uuid DEFAULT NULL,
    featured_only boolean DEFAULT FALSE,
    trending_only boolean DEFAULT FALSE
)
RETURNS TABLE(
    id uuid,
    title text,
    slug text,
    price_original numeric,
    price_discounted numeric,
    short_description text,
    is_featured boolean,
    is_trending boolean,
    stock_quantity integer,
    is_out_of_stock boolean,
    created_at timestamp with time zone,
    category_name text,
    category_slug text,
    subcategory_name text,
    subcategory_slug text,
    primary_image text,
    total_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    offset_val integer;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    SELECT 
        plv.*,
        COUNT(*) OVER() as total_count
    FROM product_list_view plv
    WHERE 
        (category_filter IS NULL OR plv.id IN (
            SELECT p.id FROM products p WHERE p.category_id = category_filter
        ))
        AND (subcategory_filter IS NULL OR plv.id IN (
            SELECT p.id FROM products p WHERE p.subcategory_id = subcategory_filter
        ))
        AND (NOT featured_only OR plv.is_featured = true)
        AND (NOT trending_only OR plv.is_trending = true)
    ORDER BY plv.created_at DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$$;

-- Add function to clean up orphaned records
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Remove product images without valid products
    DELETE FROM product_images 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    -- Remove product colors without valid products
    DELETE FROM product_colors 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    -- Remove product sizes without valid products
    DELETE FROM product_sizes 
    WHERE product_id NOT IN (SELECT id FROM products);
    
    -- Remove subcategories without valid categories
    DELETE FROM subcategories 
    WHERE category_id NOT IN (SELECT id FROM categories);
    
    RAISE NOTICE 'Orphaned records cleanup completed';
END;
$$;

-- Run cleanup
SELECT cleanup_orphaned_records();

-- Update table statistics for better query planning
ANALYZE products;
ANALYZE product_images;
ANALYZE product_colors;
ANALYZE product_sizes;
ANALYZE categories;
ANALYZE subcategories;
