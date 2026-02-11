-- Add suspension columns to tester_invitations
ALTER TABLE public.tester_invitations 
ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reactivated_at timestamp with time zone DEFAULT NULL;
