
-- Create media_server_api_table
CREATE TABLE public.media_server_api_table (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_url text NOT NULL DEFAULT 'bucket.trulle.in/cutebae_app/',
  active_or_no boolean NOT NULL DEFAULT true,
  order_of_procedence integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert the default row
INSERT INTO public.media_server_api_table (api_url, active_or_no, order_of_procedence)
VALUES ('bucket.trulle.in/cutebae_app/', true, 0);

-- Add new columns to product_images table
ALTER TABLE public.product_images 
ADD COLUMN media_server_api_url_fk uuid REFERENCES public.media_server_api_table(id),
ADD COLUMN media_file_name varchar(300),
ADD COLUMN media_file_type varchar(50) DEFAULT 'jpg';

-- Create index for better performance
CREATE INDEX idx_product_images_media_server_fk ON public.product_images(media_server_api_url_fk);

-- Update existing records to reference the media server
UPDATE public.product_images 
SET media_server_api_url_fk = (SELECT id FROM public.media_server_api_table LIMIT 1)
WHERE media_server_api_url_fk IS NULL;
