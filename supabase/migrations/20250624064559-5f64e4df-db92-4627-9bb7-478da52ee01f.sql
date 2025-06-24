
-- Remove unnecessary columns from product_images table
ALTER TABLE public.product_images 
DROP COLUMN IF EXISTS custom_media_crud_url,
DROP COLUMN IF EXISTS image_file_type;
