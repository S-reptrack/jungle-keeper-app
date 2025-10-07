-- Create storage bucket for reptile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reptile-images',
  'reptile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic']
);

-- Create policies for reptile images bucket
CREATE POLICY "Users can view reptile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reptile-images');

CREATE POLICY "Authenticated users can upload reptile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reptile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own reptile images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reptile-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own reptile images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reptile-images'
  AND auth.role() = 'authenticated'
);