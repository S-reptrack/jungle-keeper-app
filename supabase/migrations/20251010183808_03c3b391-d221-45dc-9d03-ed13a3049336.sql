-- Ajouter la politique DELETE manquante pour la table profiles
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);