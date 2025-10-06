-- Create table for reproduction observations
CREATE TABLE public.reproduction_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  observation_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reproduction_observations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own observations"
ON public.reproduction_observations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations"
ON public.reproduction_observations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations"
ON public.reproduction_observations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
ON public.reproduction_observations
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_reproduction_observations_updated_at
BEFORE UPDATE ON public.reproduction_observations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();