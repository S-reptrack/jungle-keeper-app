
CREATE OR REPLACE FUNCTION public.get_tester_usage_stats(tester_user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  reptiles_count bigint,
  feedings_count bigint,
  weights_count bigint,
  health_count bigint,
  reproduction_count bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.uid as user_id,
    (SELECT COUNT(*) FROM reptiles r WHERE r.user_id = t.uid) as reptiles_count,
    (SELECT COUNT(*) FROM feedings f WHERE f.user_id = t.uid) as feedings_count,
    (SELECT COUNT(*) FROM weight_records w WHERE w.user_id = t.uid) as weights_count,
    (SELECT COUNT(*) FROM health_records h WHERE h.user_id = t.uid) as health_count,
    (SELECT COUNT(*) FROM reproduction_observations ro WHERE ro.user_id = t.uid) as reproduction_count
  FROM unnest(tester_user_ids) AS t(uid);
END;
$$;
