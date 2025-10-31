-- Make name and phone nullable since they're optional contact details
ALTER TABLE public.addresses 
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;