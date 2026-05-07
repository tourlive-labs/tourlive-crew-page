-- Migrate notices from single image_url to multiple image_urls array
-- Run this in Supabase SQL Editor

ALTER TABLE public.notices
    ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Migrate any existing single image into the array
UPDATE public.notices
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Drop old single-image column
ALTER TABLE public.notices DROP COLUMN IF EXISTS image_url;
