-- Create a function to check if user is a beta tester
CREATE OR REPLACE FUNCTION public.is_beta_tester(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'beta_tester'
  )
$$;

-- Allow admins to insert beta_tester roles
CREATE POLICY "admin_can_insert_beta_tester_roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated 
WITH CHECK (is_admin(auth.uid()) AND role = 'beta_tester');

-- Allow admins to delete beta_tester roles
CREATE POLICY "admin_can_delete_beta_tester_roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated 
USING (is_admin(auth.uid()) AND role = 'beta_tester');