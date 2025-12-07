-- Update the transfer acceptance trigger to set status to 'active'
CREATE OR REPLACE FUNCTION public.handle_transfer_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update reptile ownership, reset status to active, and keep track of previous owner
    UPDATE public.reptiles
    SET user_id = NEW.to_user_id,
        previous_owner_id = NEW.from_user_id,
        transferred_at = now(),
        status = 'active',
        status_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = NEW.reptile_id;
    
    -- Transfer all associated records to new owner
    UPDATE public.feedings SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.health_records SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.weight_records SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.reproduction_observations SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
  END IF;
  
  RETURN NEW;
END;
$$;