-- Make city and state nullable to match the simplified address form
ALTER TABLE public.addresses 
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL;