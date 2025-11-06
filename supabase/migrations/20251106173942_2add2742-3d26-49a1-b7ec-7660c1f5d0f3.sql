-- Ajouter une colonne pour stocker l'URL du document de vente
ALTER TABLE public.reptiles
ADD COLUMN sale_document_url text;

COMMENT ON COLUMN public.reptiles.sale_document_url IS 'URL du document PDF de vente archivé';

-- Créer un bucket pour les documents de vente
INSERT INTO storage.buckets (id, name, public)
VALUES ('sale-documents', 'sale-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour permettre aux utilisateurs de télécharger leurs propres documents
CREATE POLICY "Users can upload their sale documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'sale-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS pour permettre aux utilisateurs de voir leurs propres documents
CREATE POLICY "Users can view their sale documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'sale-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS pour permettre aux utilisateurs de supprimer leurs propres documents
CREATE POLICY "Users can delete their sale documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'sale-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);