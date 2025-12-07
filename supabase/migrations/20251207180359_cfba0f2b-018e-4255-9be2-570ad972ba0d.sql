-- Drop the existing policies that use subqueries on profiles
DROP POLICY IF EXISTS "Users can view transfers sent to them" ON animal_transfers;
DROP POLICY IF EXISTS "Users can update transfers sent to them" ON animal_transfers;

-- Create a security definer function to check if current user's email matches
CREATE OR REPLACE FUNCTION public.is_transfer_recipient(transfer_to_email TEXT, transfer_to_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (transfer_to_user_id IS NOT NULL AND transfer_to_user_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND email = transfer_to_email
    );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view transfers sent to them" 
ON animal_transfers 
FOR SELECT 
USING (public.is_transfer_recipient(to_user_email, to_user_id));

CREATE POLICY "Users can update transfers sent to them" 
ON animal_transfers 
FOR UPDATE 
USING (public.is_transfer_recipient(to_user_email, to_user_id));