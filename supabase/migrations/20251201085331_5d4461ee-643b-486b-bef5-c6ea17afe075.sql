-- Add size chart columns to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS size_chart_headers jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS size_chart_rows jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN products.size_chart_headers IS 'Array of column headers for size chart, e.g., ["Size", "Age", "Height (cm)"]';
COMMENT ON COLUMN products.size_chart_rows IS 'Array of rows for size chart, e.g., [["2-3Y", "2-3 years", "92-98"]]';