-- Add status and status_date columns to reptiles table
ALTER TABLE public.reptiles 
ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deceased', 'sold')),
ADD COLUMN status_date date;

-- Add comment to explain the columns
COMMENT ON COLUMN public.reptiles.status IS 'Status of the reptile: active, deceased, or sold';
COMMENT ON COLUMN public.reptiles.status_date IS 'Date when the reptile was marked as deceased or sold';