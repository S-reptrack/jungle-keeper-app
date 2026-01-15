-- Table pour les feedbacks des testeurs
CREATE TABLE public.tester_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'general',
  feedback TEXT NOT NULL,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le suivi d'activité des testeurs
CREATE TABLE public.tester_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_tester_feedback_user_id ON public.tester_feedback(user_id);
CREATE INDEX idx_tester_feedback_created_at ON public.tester_feedback(created_at DESC);
CREATE INDEX idx_tester_activity_user_id ON public.tester_activity(user_id);
CREATE INDEX idx_tester_activity_created_at ON public.tester_activity(created_at DESC);

-- Enable RLS
ALTER TABLE public.tester_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_activity ENABLE ROW LEVEL SECURITY;

-- Policies pour tester_feedback
CREATE POLICY "Testers can create their own feedback"
ON public.tester_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_tester(auth.uid()));

CREATE POLICY "Testers can view their own feedback"
ON public.tester_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.tester_feedback
FOR SELECT
USING (is_admin(auth.uid()));

-- Policies pour tester_activity
CREATE POLICY "System can insert activity for testers"
ON public.tester_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id AND (is_tester(auth.uid()) OR is_admin(auth.uid())));

CREATE POLICY "Testers can view their own activity"
ON public.tester_activity
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.tester_activity
FOR SELECT
USING (is_admin(auth.uid()));