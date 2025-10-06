-- Create health_records table for tracking reptile health issues
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  condition TEXT NOT NULL,
  diagnosis_date DATE NOT NULL,
  notes TEXT,
  treatment TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own health records" 
ON public.health_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health records" 
ON public.health_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records" 
ON public.health_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records" 
ON public.health_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_records_updated_at
BEFORE UPDATE ON public.health_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();