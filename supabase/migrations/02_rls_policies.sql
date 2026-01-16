-- =============================================
-- Storyline Row Level Security (RLS) Policies
-- Phase 2: Secure user data isolation
-- =============================================

-- =============================================
-- ENABLE RLS on all tables
-- =============================================
ALTER TABLE movie_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MOVIE LOGS RLS Policies
-- Users can only access their own movie logs
-- =============================================

-- SELECT: Users can only view their own movies
CREATE POLICY "Users can view their own movie logs"
  ON movie_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- INSERT: Users can only create movies for themselves
CREATE POLICY "Users can create their own movie logs"
  ON movie_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- UPDATE: Users can only update their own movies
CREATE POLICY "Users can update their own movie logs"
  ON movie_logs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Users can only delete their own movies
CREATE POLICY "Users can delete their own movie logs"
  ON movie_logs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- BOOK LOGS RLS Policies
-- Users can only access their own book logs
-- =============================================

-- SELECT: Users can only view their own books
CREATE POLICY "Users can view their own book logs"
  ON book_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- INSERT: Users can only create books for themselves
CREATE POLICY "Users can create their own book logs"
  ON book_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- UPDATE: Users can only update their own books
CREATE POLICY "Users can update their own book logs"
  ON book_logs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Users can only delete their own books
CREATE POLICY "Users can delete their own book logs"
  ON book_logs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- TRAVEL LOGS RLS Policies
-- Users can only access their own travel logs
-- =============================================

-- SELECT: Users can only view their own travels
CREATE POLICY "Users can view their own travel logs"
  ON travel_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- INSERT: Users can only create travels for themselves
CREATE POLICY "Users can create their own travel logs"
  ON travel_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- UPDATE: Users can only update their own travels
CREATE POLICY "Users can update their own travel logs"
  ON travel_logs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Users can only delete their own travels
CREATE POLICY "Users can delete their own travel logs"
  ON travel_logs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- BLOG POSTS RLS Policies
-- Authors can manage their posts; everyone can read published posts
-- =============================================

-- SELECT: Everyone can view published posts; authors can view their own drafts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (published = true OR auth.uid()::text = user_id);

-- INSERT: Users can create their own blog posts
CREATE POLICY "Users can create their own blog posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- UPDATE: Authors can only update their own posts
CREATE POLICY "Authors can update their own blog posts"
  ON blog_posts
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Authors can only delete their own posts
CREATE POLICY "Authors can delete their own blog posts"
  ON blog_posts
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- BLOG COMMENTS RLS Policies
-- Comments are public if the post is published
-- =============================================

-- SELECT: Anyone can view comments on published posts; commenters can view their own
CREATE POLICY "Anyone can view comments on published posts"
  ON blog_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_comments.blog_post_id
      AND blog_posts.published = true
    )
    OR auth.uid()::text = user_id
  );

-- INSERT: Authenticated users can comment on published posts
CREATE POLICY "Users can create comments on published posts"
  ON blog_comments
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    AND EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_post_id
      AND blog_posts.published = true
    )
  );

-- UPDATE: Users can only update their own comments
CREATE POLICY "Users can update their own comments"
  ON blog_comments
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Users can delete their own comments; post authors can delete any comment
CREATE POLICY "Users can delete their own comments or comments on their posts"
  ON blog_comments
  FOR DELETE
  USING (
    auth.uid()::text = user_id
    OR EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_comments.blog_post_id
      AND blog_posts.user_id = auth.uid()::text
    )
  );

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies applied successfully!';
  RAISE NOTICE 'Security rules:';
  RAISE NOTICE '- Users can only access their own logs (movies, books, travel)';
  RAISE NOTICE '- Published blog posts are public; drafts are private';
  RAISE NOTICE '- Comments are visible on published posts';
  RAISE NOTICE '- All data is protected by user_id matching';
END $$;
