-- Fonction pour masquer partiellement les emails
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  local_part text;
  domain_part text;
  masked_local text;
BEGIN
  IF email IS NULL OR email = '' THEN
    RETURN email;
  END IF;
  
  -- Séparer la partie locale et le domaine
  local_part := split_part(email, '@', 1);
  domain_part := split_part(email, '@', 2);
  
  -- Masquer la partie locale (garder 1er et dernier caractère)
  IF length(local_part) <= 2 THEN
    masked_local := local_part;
  ELSE
    masked_local := substring(local_part, 1, 1) || 
                    repeat('*', GREATEST(length(local_part) - 2, 1)) || 
                    substring(local_part, length(local_part), 1);
  END IF;
  
  RETURN masked_local || '@' || domain_part;
END;
$$;