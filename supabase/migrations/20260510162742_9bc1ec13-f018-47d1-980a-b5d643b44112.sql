-- 1. Drop overly broad INSERT policy on reptile-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload reptile images" ON storage.objects;

-- 2. Restrict Realtime channel subscriptions to user's own topic namespace
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to own topic" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to own topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = (SELECT auth.uid()::text)
  OR realtime.topic() LIKE (SELECT auth.uid()::text) || ':%'
);

DROP POLICY IF EXISTS "Authenticated users can broadcast to own topic" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast to own topic"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = (SELECT auth.uid()::text)
  OR realtime.topic() LIKE (SELECT auth.uid()::text) || ':%'
);

-- 3. Restrict health_records SELECT to current owner only (no previous_owner access)
DROP POLICY IF EXISTS "Users can view their own health records" ON public.health_records;
CREATE POLICY "Users can view their own health records"
ON public.health_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix can_see_transfer_sender to also match by email (consistent with is_transfer_recipient)
CREATE OR REPLACE FUNCTION public.can_see_transfer_sender(sender_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.animal_transfers at
    WHERE at.from_user_id = sender_user_id
      AND (
        at.to_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid() AND p.email = at.to_user_email
        )
      )
  );
$$;