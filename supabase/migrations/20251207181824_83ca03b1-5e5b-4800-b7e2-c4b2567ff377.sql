-- Allow transfer recipients to see reptiles being transferred to them
CREATE POLICY "Recipients can view reptiles being transferred to them"
ON public.reptiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM animal_transfers at
    WHERE at.reptile_id = reptiles.id
    AND at.status = 'pending'
    AND (
      at.to_user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.email = at.to_user_email
      )
    )
  )
);