-- Ajouter des colonnes pour tracer les transferts
ALTER TABLE public.reptiles 
ADD COLUMN previous_owner_id UUID REFERENCES auth.users(id),
ADD COLUMN transferred_at TIMESTAMP WITH TIME ZONE;

-- Modifier la fonction de gestion de transfert pour conserver la trace
CREATE OR REPLACE FUNCTION public.handle_transfer_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update reptile ownership and keep track of previous owner
    UPDATE public.reptiles
    SET user_id = NEW.to_user_id,
        previous_owner_id = NEW.from_user_id,
        transferred_at = now(),
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
$function$;

-- Mettre à jour les RLS policies pour reptiles
DROP POLICY IF EXISTS "Users can view their own reptiles" ON public.reptiles;
CREATE POLICY "Users can view their own reptiles" 
ON public.reptiles 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = previous_owner_id);

-- Les anciens propriétaires ne peuvent PAS modifier
DROP POLICY IF EXISTS "Users can update their own reptiles" ON public.reptiles;
CREATE POLICY "Users can update their own reptiles" 
ON public.reptiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Mettre à jour les RLS policies pour feedings (lecture seule pour anciens propriétaires)
DROP POLICY IF EXISTS "Users can view their own feedings" ON public.feedings;
CREATE POLICY "Users can view their own feedings" 
ON public.feedings 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = feedings.reptile_id 
    AND reptiles.previous_owner_id = auth.uid()
  )
);

-- Les anciens propriétaires ne peuvent PAS créer de nouveaux feedings
DROP POLICY IF EXISTS "Users can create their own feedings" ON public.feedings;
CREATE POLICY "Users can create their own feedings" 
ON public.feedings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = feedings.reptile_id 
    AND reptiles.user_id = auth.uid()
  )
);

-- Mettre à jour les RLS policies pour health_records
DROP POLICY IF EXISTS "Users can view their own health records" ON public.health_records;
CREATE POLICY "Users can view their own health records" 
ON public.health_records 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = health_records.reptile_id 
    AND reptiles.previous_owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own health records" ON public.health_records;
CREATE POLICY "Users can create their own health records" 
ON public.health_records 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = health_records.reptile_id 
    AND reptiles.user_id = auth.uid()
  )
);

-- Mettre à jour les RLS policies pour weight_records
DROP POLICY IF EXISTS "Users can view their own weight records" ON public.weight_records;
CREATE POLICY "Users can view their own weight records" 
ON public.weight_records 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = weight_records.reptile_id 
    AND reptiles.previous_owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own weight records" ON public.weight_records;
CREATE POLICY "Users can create their own weight records" 
ON public.weight_records 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = weight_records.reptile_id 
    AND reptiles.user_id = auth.uid()
  )
);

-- Mettre à jour les RLS policies pour reproduction_observations
DROP POLICY IF EXISTS "Users can view their own observations" ON public.reproduction_observations;
CREATE POLICY "Users can view their own observations" 
ON public.reproduction_observations 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = reproduction_observations.reptile_id 
    AND reptiles.previous_owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own observations" ON public.reproduction_observations;
CREATE POLICY "Users can create their own observations" 
ON public.reproduction_observations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = reproduction_observations.reptile_id 
    AND reptiles.user_id = auth.uid()
  )
);