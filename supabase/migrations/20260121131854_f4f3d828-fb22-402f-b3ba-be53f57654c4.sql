-- Ajouter une colonne session_duration à la table tester_activity pour stocker le temps de session
ALTER TABLE public.tester_activity ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT NULL;

-- Ajouter un commentaire pour expliquer la colonne
COMMENT ON COLUMN public.tester_activity.session_duration IS 'Durée de la session en secondes, mise à jour lors du départ de la page';