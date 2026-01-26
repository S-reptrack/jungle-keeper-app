
-- Ajouter une politique RLS pour permettre aux testeurs/admins de mettre à jour leurs propres activités
CREATE POLICY "Testers can update their own activity"
ON public.tester_activity
FOR UPDATE
USING (auth.uid() = user_id AND (is_tester(auth.uid()) OR is_admin(auth.uid())))
WITH CHECK (auth.uid() = user_id AND (is_tester(auth.uid()) OR is_admin(auth.uid())));
