-- Étape 1: Ajouter le rôle 'tester' à l'enum existant
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tester';