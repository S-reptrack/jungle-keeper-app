-- Create weight_records table for tracking reptile weight over time
CREATE TABLE public.weight_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  weight NUMERIC NOT NULL,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own weight records" 
ON public.weight_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight records" 
ON public.weight_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight records" 
ON public.weight_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight records" 
ON public.weight_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weight_records_updated_at
BEFORE UPDATE ON public.weight_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();