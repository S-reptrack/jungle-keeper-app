-- Add incubation tracking fields to reproduction_observations table
ALTER TABLE public.reproduction_observations
ADD COLUMN incubation_days integer,
ADD COLUMN expected_hatch_date date,
ADD COLUMN notification_days_before integer DEFAULT 7;