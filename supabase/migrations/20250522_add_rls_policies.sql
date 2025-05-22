
-- Create RLS policies for admin operations

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY "Allow public read access for categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for categories" 
  ON public.categories 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for categories" 
  ON public.categories 
  FOR DELETE 
  USING (true);

-- Subcategories
CREATE POLICY "Allow public read access for subcategories" 
  ON public.subcategories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for subcategories" 
  ON public.subcategories 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for subcategories" 
  ON public.subcategories 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for subcategories" 
  ON public.subcategories 
  FOR DELETE 
  USING (true);

-- Products
CREATE POLICY "Allow public read access for products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for products" 
  ON public.products 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for products" 
  ON public.products 
  FOR DELETE 
  USING (true);

-- Product Colors
CREATE POLICY "Allow public read access for product colors" 
  ON public.product_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for product colors" 
  ON public.product_colors 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for product colors" 
  ON public.product_colors 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for product colors" 
  ON public.product_colors 
  FOR DELETE 
  USING (true);

-- Product Sizes
CREATE POLICY "Allow public read access for product sizes" 
  ON public.product_sizes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for product sizes" 
  ON public.product_sizes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for product sizes" 
  ON public.product_sizes 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for product sizes" 
  ON public.product_sizes 
  FOR DELETE 
  USING (true);

-- Product Images
CREATE POLICY "Allow public read access for product images" 
  ON public.product_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public CREATE operations for product images" 
  ON public.product_images 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public UPDATE operations for product images" 
  ON public.product_images 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public DELETE operations for product images" 
  ON public.product_images 
  FOR DELETE 
  USING (true);
