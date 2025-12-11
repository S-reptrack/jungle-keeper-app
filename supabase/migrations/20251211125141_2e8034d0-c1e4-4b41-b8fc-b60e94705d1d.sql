-- Enable realtime for main data tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reproduction_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weight_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reptiles;