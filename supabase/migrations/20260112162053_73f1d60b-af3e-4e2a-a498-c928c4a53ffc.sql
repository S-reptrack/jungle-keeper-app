-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "admin_can_view_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_can_view_own_role" ON public.user_roles;

-- Recréer avec PERMISSIVE (une seule politique suffit)
CREATE POLICY "user_can_view_own_role" ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admin_can_view_all_roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));