-- Create feedings table to track meals given to reptiles
CREATE TABLE IF NOT EXISTS public.feedings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rodent_type TEXT NOT NULL,
  rodent_stage TEXT NOT NULL,
  rodent_weight NUMERIC,
  quantity INTEGER NOT NULL DEFAULT 1,
  feeding_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own feedings" 
ON public.feedings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedings" 
ON public.feedings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedings" 
ON public.feedings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedings" 
ON public.feedings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feedings_updated_at
BEFORE UPDATE ON public.feedings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();