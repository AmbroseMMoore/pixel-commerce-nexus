-- Fix RLS for delivery-related tables (these are public reference data, safe to read)
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincode_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_server_api_table ENABLE ROW LEVEL SECURITY;

-- Create public read policies for delivery/zone data (reference data, no sensitive info)
CREATE POLICY "Public read access for delivery zones"
  ON public.delivery_zones FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage delivery zones"
  ON public.delivery_zones FOR ALL
  USING (is_admin());

CREATE POLICY "Public read access for pincode zones"
  ON public.pincode_zones FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pincode zones"
  ON public.pincode_zones FOR ALL
  USING (is_admin());

CREATE POLICY "Public read access for zone regions"
  ON public.zone_regions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage zone regions"
  ON public.zone_regions FOR ALL
  USING (is_admin());

CREATE POLICY "Public read access for media server config"
  ON public.media_server_api_table FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage media server config"
  ON public.media_server_api_table FOR ALL
  USING (is_admin());

-- CRITICAL FIX: Remove dangerous public access policies from profiles table
-- This fixes the customer email exposure vulnerability
DROP POLICY IF EXISTS "Allow public read access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public CREATE operations for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public UPDATE operations for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public DELETE operations for profiles" ON public.profiles;

-- Ensure profiles table has proper RLS policies (users can only access their own data)
-- Keep the existing secure policies:
-- "Users can read their own profile" - already exists
-- "Users can update their own profile" - already exists
-- "Admins can read all profiles" - already exists