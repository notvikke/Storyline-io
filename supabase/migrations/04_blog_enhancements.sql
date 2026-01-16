-- =============================================
-- Migration: Blog Enhancements & Storage
-- =============================================

-- 1. Add cover_image to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Create Storage Bucket (if possible via SQL)
-- Attempt to create the 'blog-images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (RLS)
-- Allow authenticated users to upload to their own folder: user_id/*
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update/delete their own files
CREATE POLICY "Allow authenticated update/delete"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'blog-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');
