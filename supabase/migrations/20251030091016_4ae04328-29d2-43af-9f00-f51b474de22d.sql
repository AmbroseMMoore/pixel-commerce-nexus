-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Step 4: Create security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Replace is_admin() function to use user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Step 6: Migrate existing admin users from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert all existing users as 'user' role if they don't have admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM public.profiles
WHERE role = 'user' OR role IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 7: Update policies that directly check profiles.role to use is_admin()

-- Update returns table policies
DROP POLICY IF EXISTS "Admins can view all returns" ON returns;
CREATE POLICY "Admins can view all returns"
ON returns
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all returns" ON returns;
CREATE POLICY "Admins can update all returns"
ON returns
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Update frontend_logs table policies
DROP POLICY IF EXISTS "Admin users can view all logs" ON frontend_logs;
CREATE POLICY "Admin users can view all logs"
ON frontend_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin users can create logs" ON frontend_logs;
CREATE POLICY "Admin users can create logs"
ON frontend_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Frontend log Read policy" ON frontend_logs;
CREATE POLICY "Frontend log Read policy"
ON frontend_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Frontend log Update policy" ON frontend_logs;
CREATE POLICY "Frontend log Update policy"
ON frontend_logs
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Update admin_settings table policies
DROP POLICY IF EXISTS "Admin users can manage settings" ON admin_settings;
CREATE POLICY "Admin users can manage settings"
ON admin_settings
FOR ALL
TO authenticated
USING (public.is_admin());

-- Update orders table policies
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
CREATE POLICY "Admin can read all orders"
ON orders
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update all orders" ON orders;
CREATE POLICY "Admin can update all orders"
ON orders
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Update order_status_history table policies
DROP POLICY IF EXISTS "Admins can manage order status history" ON order_status_history;
CREATE POLICY "Admins can manage order status history"
ON order_status_history
FOR ALL
TO authenticated
USING (public.is_admin());

-- Step 8: Update handle_new_user() trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table (without role)
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'name', 
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  );
  
  -- Insert into user_roles based on email
  IF new.email = 'kon22kuruvi@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Insert into customers table
  INSERT INTO public.customers (id, name, last_name, mobile_number, email)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'given_name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'family_name',
      ''
    ),
    COALESCE(
      new.raw_user_meta_data->>'mobile_number',
      new.raw_user_meta_data->>'phone',
      ''
    ),
    new.email
  );
  
  RETURN new;
END;
$function$;

-- Step 9: Add RLS policy for admins to view all order items
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Step 10: Now safe to remove role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;