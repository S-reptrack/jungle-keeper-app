-- Fix infinite recursion in user_roles policies
-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Create simple, non-recursive policies for user_roles
-- Users can view their own roles (direct check, no function call)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only allow insert through trigger (no direct insert policy)
-- This prevents recursion since the trigger runs with security definer

-- No update or delete policies for regular users
-- Role management should be done by admins through a secure function or trigger