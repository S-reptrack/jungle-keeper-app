-- Add beta_tester to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'beta_tester';