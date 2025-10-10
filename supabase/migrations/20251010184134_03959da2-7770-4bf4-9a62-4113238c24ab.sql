-- Rendre le bucket reptile-images privé
UPDATE storage.buckets 
SET public = false 
WHERE id = 'reptile-images';

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own reptile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own reptile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own reptile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own reptile images" ON storage.objects;

-- Recréer les politiques
CREATE POLICY "Users can view their own reptile images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'reptile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own reptile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reptile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own reptile images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reptile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own reptile images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reptile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);