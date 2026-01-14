-- Créer une fonction pour vérifier si un utilisateur est testeur ou admin
CREATE OR REPLACE FUNCTION public.is_tester(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'tester'
  )
$$;