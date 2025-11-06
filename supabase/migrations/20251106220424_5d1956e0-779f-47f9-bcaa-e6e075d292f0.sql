-- Add feeding_interval_days column to reptiles table
ALTER TABLE public.reptiles ADD COLUMN feeding_interval_days integer;

-- Add a comment to describe the column
COMMENT ON COLUMN public.reptiles.feeding_interval_days IS 'Number of days between feedings for this reptile';