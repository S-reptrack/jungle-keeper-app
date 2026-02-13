
CREATE TABLE public.bowel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bowel_date DATE NOT NULL,
  consistency TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bowel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bowel records"
ON public.bowel_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bowel records"
ON public.bowel_records FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM reptiles WHERE reptiles.id = bowel_records.reptile_id AND reptiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own bowel records"
ON public.bowel_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bowel records"
ON public.bowel_records FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_bowel_records_updated_at
BEFORE UPDATE ON public.bowel_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
