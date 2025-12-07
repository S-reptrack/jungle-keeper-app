-- Allow users to see sender profiles for transfers they received
CREATE POLICY "Users can view sender profiles for their transfers"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM animal_transfers at
    WHERE at.from_user_id = profiles.user_id
    AND (at.to_user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.email = at.to_user_email
    ))
  )
);