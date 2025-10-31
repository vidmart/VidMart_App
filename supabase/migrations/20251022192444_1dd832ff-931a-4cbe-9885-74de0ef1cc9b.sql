-- Add landmark column to addresses table
ALTER TABLE public.addresses 
ADD COLUMN landmark text;