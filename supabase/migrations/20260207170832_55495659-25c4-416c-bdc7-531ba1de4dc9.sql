
-- Add calcium and vitamin supplement fields to feedings table
ALTER TABLE public.feedings 
ADD COLUMN calcium boolean NOT NULL DEFAULT false,
ADD COLUMN vitamins boolean NOT NULL DEFAULT false;
