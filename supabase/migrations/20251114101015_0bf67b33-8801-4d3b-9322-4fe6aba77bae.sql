-- Add hatching closure fields to reproduction_observations
ALTER TABLE public.reproduction_observations
  ADD COLUMN IF NOT EXISTS closed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS closed_at date,
  ADD COLUMN IF NOT EXISTS hatched_eggs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unhatched_eggs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stillborn_juveniles integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outcome_notes text;