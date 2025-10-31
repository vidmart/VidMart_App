-- Rename postal_code to pin_code for consistency with the form
ALTER TABLE public.addresses 
RENAME COLUMN postal_code TO pin_code;