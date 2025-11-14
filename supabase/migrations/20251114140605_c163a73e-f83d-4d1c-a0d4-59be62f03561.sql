-- Add 'for_sale' as a valid status for reptiles
ALTER TABLE public.reptiles
DROP CONSTRAINT IF EXISTS reptiles_status_check;

ALTER TABLE public.reptiles
ADD CONSTRAINT reptiles_status_check 
CHECK (status IN ('active', 'for_sale', 'deceased', 'sold'));