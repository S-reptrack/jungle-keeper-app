CREATE OR REPLACE FUNCTION public.sync_register_exit()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status IN ('sold','deceased') THEN
    IF NEW.exit_type IS NULL OR (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.exit_type IN ('sale','death')) THEN
      NEW.exit_type := CASE NEW.status WHEN 'sold' THEN 'sale' ELSE 'death' END;
    END IF;
    IF NEW.exit_date IS NULL THEN
      NEW.exit_date := COALESCE(NEW.status_date, CURRENT_DATE);
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER reptiles_sync_register_exit
BEFORE INSERT OR UPDATE ON public.reptiles
FOR EACH ROW EXECUTE FUNCTION public.sync_register_exit();