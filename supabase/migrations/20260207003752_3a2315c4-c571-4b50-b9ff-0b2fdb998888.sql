ALTER TABLE public.reproduction_observations
  ADD COLUMN IF NOT EXISTS fertilized_eggs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unfertilized_eggs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS slugs integer DEFAULT 0;