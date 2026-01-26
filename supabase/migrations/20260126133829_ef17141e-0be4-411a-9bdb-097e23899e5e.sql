-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "System can insert activity for testers" ON public.tester_activity;
DROP POLICY IF EXISTS "Testers can update their own activity" ON public.tester_activity;
DROP POLICY IF EXISTS "Testers can view their own activity" ON public.tester_activity;
DROP POLICY IF EXISTS "Testers can create their own feedback" ON public.tester_feedback;
DROP POLICY IF EXISTS "Testers can view their own feedback" ON public.tester_feedback;

-- Nouvelles politiques pour tester_activity - ouvertes à tous les utilisateurs authentifiés
CREATE POLICY "Users can insert their own activity"
ON public.tester_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
ON public.tester_activity
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity"
ON public.tester_activity
FOR SELECT
USING (auth.uid() = user_id);

-- Nouvelles politiques pour tester_feedback - ouvertes à tous les utilisateurs authentifiés
CREATE POLICY "Users can create their own feedback"
ON public.tester_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.tester_feedback
FOR SELECT
USING (auth.uid() = user_id);