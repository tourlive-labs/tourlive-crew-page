-- Storage policies for the 'banners' bucket

-- 1. Allow public select access
CREATE POLICY "Allow public select on banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 2. Allow authenticated users to insert (upload)
CREATE POLICY "Allow authenticated users to upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- 3. Allow users to update/delete their own banners (optional but recommended)
CREATE POLICY "Allow users to manage their own banners"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
