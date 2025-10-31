-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- Allow everyone to view products
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);