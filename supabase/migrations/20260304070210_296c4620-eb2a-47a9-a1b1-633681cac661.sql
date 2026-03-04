
-- 1. Update South India delivery charge to ₹100
UPDATE delivery_zones SET delivery_charge = 100, updated_at = NOW()
WHERE zone_number = 5;

-- 2. Update get_products_paginated to sort trending products oldest first
CREATE OR REPLACE FUNCTION public.get_products_paginated(
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 20,
  category_filter uuid DEFAULT NULL::uuid,
  subcategory_filter uuid DEFAULT NULL::uuid,
  featured_only boolean DEFAULT false,
  trending_only boolean DEFAULT false
)
RETURNS TABLE(
  id uuid, title text, slug text, price_original numeric, price_discounted numeric,
  short_description text, is_featured boolean, is_trending boolean, stock_quantity integer,
  is_out_of_stock boolean, created_at timestamp with time zone, category_name text,
  category_slug text, subcategory_name text, subcategory_slug text, primary_image text,
  total_count bigint
)
LANGUAGE plpgsql STABLE
AS $function$
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
    ORDER BY 
        CASE WHEN trending_only THEN plv.created_at END ASC,
        CASE WHEN NOT trending_only THEN plv.created_at END DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$function$;
