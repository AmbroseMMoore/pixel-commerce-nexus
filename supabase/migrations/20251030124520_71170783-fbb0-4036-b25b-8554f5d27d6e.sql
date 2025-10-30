-- Allow admins to read all addresses for order management
CREATE POLICY "Admins can read all addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (public.is_admin());

COMMENT ON POLICY "Admins can read all addresses" ON public.addresses 
IS 'Allows admin users to view all delivery addresses when managing orders';