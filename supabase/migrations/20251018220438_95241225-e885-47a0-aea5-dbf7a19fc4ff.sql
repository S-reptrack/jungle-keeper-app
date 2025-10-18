-- Create enum for transfer status
CREATE TYPE public.transfer_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Create animal_transfers table
CREATE TABLE public.animal_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_email TEXT NOT NULL,
  to_user_id UUID,
  status transfer_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.animal_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view transfers they sent"
ON public.animal_transfers
FOR SELECT
USING (auth.uid() = from_user_id);

CREATE POLICY "Users can view transfers sent to them"
ON public.animal_transfers
FOR SELECT
USING (
  auth.uid() = to_user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = animal_transfers.to_user_email
  )
);

CREATE POLICY "Users can create transfers for their reptiles"
ON public.animal_transfers
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id 
  AND EXISTS (
    SELECT 1 FROM public.reptiles 
    WHERE reptiles.id = reptile_id 
    AND reptiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update transfers sent to them"
ON public.animal_transfers
FOR UPDATE
USING (
  auth.uid() = to_user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = animal_transfers.to_user_email
  )
);

CREATE POLICY "Users can cancel their own transfers"
ON public.animal_transfers
FOR UPDATE
USING (auth.uid() = from_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_animal_transfers_updated_at
BEFORE UPDATE ON public.animal_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle accepted transfer
CREATE OR REPLACE FUNCTION public.handle_transfer_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update reptile ownership
    UPDATE public.reptiles
    SET user_id = NEW.to_user_id,
        updated_at = now()
    WHERE id = NEW.reptile_id;
    
    -- Also transfer all associated records
    UPDATE public.feedings SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.health_records SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.weight_records SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
    UPDATE public.reproduction_observations SET user_id = NEW.to_user_id WHERE reptile_id = NEW.reptile_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to execute transfer when accepted
CREATE TRIGGER on_transfer_accepted
AFTER UPDATE ON public.animal_transfers
FOR EACH ROW
EXECUTE FUNCTION public.handle_transfer_acceptance();