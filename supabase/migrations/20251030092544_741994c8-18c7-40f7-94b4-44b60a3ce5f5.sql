-- Drop the existing view
DROP VIEW IF EXISTS public.product_list_view;

-- Recreate the view WITHOUT security definer (safer approach)
-- This view only reads public product data, so it doesn't need elevated privileges
CREATE VIEW public.product_list_view AS
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
  c.name AS category_name,
  c.slug AS category_slug,
  sc.name AS subcategory_name,
  sc.slug AS subcategory_slug,
  (
    SELECT pi.image_url
    FROM product_images pi
    WHERE pi.product_id = p.id AND pi.is_primary = true
    LIMIT 1
  ) AS primary_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id;

-- Grant select to authenticated and anon users (since product data is public)
GRANT SELECT ON public.product_list_view TO authenticated, anon;