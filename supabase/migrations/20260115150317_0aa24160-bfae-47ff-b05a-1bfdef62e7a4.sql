-- Add trial_end_date to tester_invitations
ALTER TABLE public.tester_invitations 
ADD COLUMN trial_end_date date DEFAULT (CURRENT_DATE + INTERVAL '28 days');

-- Update existing accepted invitations with Feb 15, 2025 deadline
UPDATE public.tester_invitations 
SET trial_end_date = '2025-02-15'
WHERE status = 'accepted';

-- Create a function to remove tester role when user subscribes
CREATE OR REPLACE FUNCTION public.remove_tester_role_on_subscribe(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user_id from profiles
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Remove tester role
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'tester';
  END IF;
END;
$$;