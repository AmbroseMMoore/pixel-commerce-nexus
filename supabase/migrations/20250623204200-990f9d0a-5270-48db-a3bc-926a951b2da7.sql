
-- Add new columns to the product_images table
ALTER TABLE product_images 
ADD COLUMN image_name text UNIQUE,
ADD COLUMN custom_media_crud_url text DEFAULT 'https://bucket.ezeelux.in/cutebae_app',
ADD COLUMN image_file_type text;

-- Create indexes for better performance
CREATE INDEX idx_product_images_image_name ON product_images(image_name);
CREATE INDEX idx_product_images_file_type ON product_images(image_file_type);

-- Update existing records to have default values
UPDATE product_images 
SET 
  image_name = CONCAT('img_', id::text, '_', EXTRACT(EPOCH FROM NOW())::text),
  image_file_type = CASE 
    WHEN image_url LIKE '%.jpg' OR image_url LIKE '%.jpeg' THEN 'jpeg'
    WHEN image_url LIKE '%.png' THEN 'png'
    WHEN image_url LIKE '%.gif' THEN 'gif'
    WHEN image_url LIKE '%.webp' THEN 'webp'
    ELSE 'jpeg'
  END
WHERE image_name IS NULL;
