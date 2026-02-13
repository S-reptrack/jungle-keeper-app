
-- Table pour enregistrer les mues des reptiles
CREATE TABLE public.shedding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  shedding_date DATE NOT NULL,
  quality TEXT NOT NULL DEFAULT 'complete',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_shedding_records_reptile_id ON public.shedding_records(reptile_id);
CREATE INDEX idx_shedding_records_user_id ON public.shedding_records(user_id);

-- Enable RLS
ALTER TABLE public.shedding_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own shedding records"
ON public.shedding_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shedding records"
ON public.shedding_records FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM reptiles WHERE reptiles.id = shedding_records.reptile_id AND reptiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own shedding records"
ON public.shedding_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shedding records"
ON public.shedding_records FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_shedding_records_updated_at
BEFORE UPDATE ON public.shedding_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
