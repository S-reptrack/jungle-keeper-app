-- Politique pour permettre aux admins d'ajouter des rôles testeur
CREATE POLICY "admin_can_insert_tester_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) 
  AND role = 'tester'::app_role
);

-- Politique pour permettre aux admins de supprimer des rôles testeur
CREATE POLICY "admin_can_delete_tester_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) 
  AND role = 'tester'::app_role
);