-- Add image_url column to notices table
-- Run this in Supabase SQL Editor

ALTER TABLE public.notices
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create notices storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notices', 'notices', true)
ON CONFLICT (id) DO NOTHING;

-- Admin can upload/delete notice images
CREATE POLICY "Admin can upload notice images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'notices'
        AND (auth.jwt() ->> 'email' = 'root@tourlive.co.kr')
    );

CREATE POLICY "Admin can update notice images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'notices'
        AND (auth.jwt() ->> 'email' = 'root@tourlive.co.kr')
    );

CREATE POLICY "Admin can delete notice images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'notices'
        AND (auth.jwt() ->> 'email' = 'root@tourlive.co.kr')
    );

-- Authenticated users can read notice images
CREATE POLICY "Authenticated users can read notice images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'notices');
