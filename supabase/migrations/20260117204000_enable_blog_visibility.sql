-- Enable public read access for blog_posts on social profiles
-- This allows anyone to view published blogs on user profile pages

-- Policy for public SELECT on blog_posts
CREATE POLICY "Allow public read access to published blogs"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Policy for authenticated users to read all their own blogs
CREATE POLICY "Allow users to read their own blogs"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
