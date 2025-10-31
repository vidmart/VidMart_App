-- Allow users to update their own orders so merged items can be saved
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);