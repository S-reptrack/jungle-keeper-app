ALTER TABLE public.reptiles
  ADD COLUMN IF NOT EXISTS entry_type text,
  ADD COLUMN IF NOT EXISTS entry_origin text,
  ADD COLUMN IF NOT EXISTS identification_number text,
  ADD COLUMN IF NOT EXISTS cites_number text,
  ADD COLUMN IF NOT EXISTS exit_type text,
  ADD COLUMN IF NOT EXISTS exit_date date,
  ADD COLUMN IF NOT EXISTS exit_destination text;