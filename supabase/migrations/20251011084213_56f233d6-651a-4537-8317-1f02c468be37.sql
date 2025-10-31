-- Fix RLS for products table (was incorrectly set on profiles table twice)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;