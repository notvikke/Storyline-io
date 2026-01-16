-- =============================================
-- Storyline Database Schema
-- Phase 2: Core Tables with RLS
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: movie_logs
-- Purpose: Track movies watched by users
-- =============================================
CREATE TABLE IF NOT EXISTS movie_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  
  -- Movie Details (from OMDb API)
  imdb_id TEXT,
  title TEXT NOT NULL,
  year TEXT,
  director TEXT,
  genre TEXT,
  poster_url TEXT,
  plot TEXT,
  
  -- User's Personal Tracking
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  notes TEXT,
  watched_date DATE DEFAULT CURRENT_DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_movie_logs_user_id ON movie_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_logs_watched_date ON movie_logs(watched_date DESC);

-- =============================================
-- TABLE: book_logs
-- Purpose: Track books read by users
-- =============================================
CREATE TABLE IF NOT EXISTS book_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  
  -- Book Details (from Open Library API)
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  publish_year TEXT,
  cover_url TEXT,
  description TEXT,
  page_count INTEGER,
  
  -- User's Personal Tracking
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  notes TEXT,
  started_date DATE,
  finished_date DATE DEFAULT CURRENT_DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_book_logs_user_id ON book_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_book_logs_finished_date ON book_logs(finished_date DESC);

-- =============================================
-- TABLE: travel_logs
-- Purpose: Track travel experiences with map locations
-- =============================================
CREATE TABLE IF NOT EXISTS travel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID
  
  -- Location Details
  location_name TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Trip Details
  visit_date DATE DEFAULT CURRENT_DATE,
  duration_days INTEGER,
  notes TEXT,
  
  -- Photo Storage (Supabase Storage bucket path)
  photo_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_logs_user_id ON travel_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_logs_visit_date ON travel_logs(visit_date DESC);

-- =============================================
-- TABLE: blog_posts
-- Purpose: User-written blog posts (markdown supported)
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Clerk user ID (author)
  
  -- Post Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly version of title
  content TEXT NOT NULL, -- Markdown content
  excerpt TEXT, -- Short preview
  
  -- Categorization
  tags TEXT[], -- Array of tags
  
  -- Publishing
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);

-- =============================================
-- TABLE: blog_comments
-- Purpose: Comments on blog posts
-- =============================================
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID (commenter)
  
  -- Comment Content
  content TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_post_id ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- =============================================
-- FUNCTION: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_movie_logs_updated_at
  BEFORE UPDATE ON movie_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_logs_updated_at
  BEFORE UPDATE ON book_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_logs_updated_at
  BEFORE UPDATE ON travel_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Storyline database schema created successfully!';
  RAISE NOTICE 'Tables: movie_logs, book_logs, travel_logs, blog_posts, blog_comments';
  RAISE NOTICE 'Next step: Apply RLS policies using 02_rls_policies.sql';
END $$;
