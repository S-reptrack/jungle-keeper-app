-- Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "Users can view sender profiles for their transfers" ON public.profiles;

-- Create a security definer function to check if user can see sender profile
CREATE OR REPLACE FUNCTION public.can_see_transfer_sender(sender_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM animal_transfers at
    WHERE at.from_user_id = sender_user_id
    AND (at.to_user_id = auth.uid())
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view sender profiles for their transfers"
ON public.profiles
FOR SELECT
USING (
  public.can_see_transfer_sender(user_id)
);