-- 1. Remove overly permissive SELECT policy on reptile-images bucket
DROP POLICY IF EXISTS "Users can view reptile images" ON storage.objects;

-- 2. Stop broadcasting tester_invitations over Realtime (admins still query directly)
ALTER PUBLICATION supabase_realtime DROP TABLE public.tester_invitations;