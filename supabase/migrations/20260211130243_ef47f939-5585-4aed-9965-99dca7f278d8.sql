
CREATE OR REPLACE FUNCTION public.get_tester_last_activity(tester_user_ids uuid[])
RETURNS TABLE(user_id uuid, last_activity timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.uid, MAX(t.activity_date) as last_activity
  FROM (
    SELECT r.user_id as uid, r.updated_at as activity_date
    FROM reptiles r WHERE r.user_id = ANY(tester_user_ids)
    UNION ALL
    SELECT f.user_id, f.created_at
    FROM feedings f WHERE f.user_id = ANY(tester_user_ids)
    UNION ALL
    SELECT w.user_id, w.created_at
    FROM weight_records w WHERE w.user_id = ANY(tester_user_ids)
    UNION ALL
    SELECT h.user_id, h.created_at
    FROM health_records h WHERE h.user_id = ANY(tester_user_ids)
    UNION ALL
    SELECT ta.user_id, ta.created_at
    FROM tester_activity ta WHERE ta.user_id = ANY(tester_user_ids)
  ) t
  GROUP BY t.uid;
END;
$$;
