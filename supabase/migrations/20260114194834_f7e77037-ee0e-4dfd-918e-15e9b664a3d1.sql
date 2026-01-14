
-- Table pour stocker les invitations testeur en attente
CREATE TABLE public.tester_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone
);

-- Activer RLS
ALTER TABLE public.tester_invitations ENABLE ROW LEVEL SECURITY;

-- Policies pour les admins
CREATE POLICY "Admins can view all invitations"
ON public.tester_invitations
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create invitations"
ON public.tester_invitations
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
ON public.tester_invitations
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete invitations"
ON public.tester_invitations
FOR DELETE
USING (is_admin(auth.uid()));

-- Trigger pour auto-assigner le rôle tester lors de l'inscription
CREATE OR REPLACE FUNCTION public.auto_assign_tester_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'email a une invitation en attente
  IF EXISTS (
    SELECT 1 FROM public.tester_invitations 
    WHERE email = NEW.email AND status = 'pending'
  ) THEN
    -- Ajouter le rôle tester
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'tester')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Marquer l'invitation comme acceptée
    UPDATE public.tester_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE email = NEW.email AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_created_assign_tester
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_tester_role();
