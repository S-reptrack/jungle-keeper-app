-- Create table for rodent inventory
CREATE TABLE public.rodents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'rat', 'mouse', 'rabbit'
  stage TEXT NOT NULL, -- 'pinky', 'fuzzy', 'hopper', etc.
  weight DECIMAL,
  quantity INTEGER NOT NULL DEFAULT 0,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rodents ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own rodents"
ON public.rodents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rodents"
ON public.rodents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rodents"
ON public.rodents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rodents"
ON public.rodents
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_rodents_updated_at
BEFORE UPDATE ON public.rodents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();