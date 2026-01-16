-- =============================================
-- Migration: Add status column to logs
-- Purpose: Support Planning/Watchlist feature
-- =============================================

-- 1. Add status column to movie_logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movie_logs' AND column_name = 'status') THEN
        ALTER TABLE movie_logs ADD COLUMN status TEXT DEFAULT 'completed';
        
        -- Add check constraint to ensure valid values
        ALTER TABLE movie_logs ADD CONSTRAINT check_movie_status CHECK (status IN ('completed', 'planning'));
        
        -- Backfill existing records (optional, as default covers new inserts, but good for existing data integrity if default wasn't applied during add)
        UPDATE movie_logs SET status = 'completed' WHERE status IS NULL;
    END IF;
END $$;

-- 2. Add status column to book_logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_logs' AND column_name = 'status') THEN
        ALTER TABLE book_logs ADD COLUMN status TEXT DEFAULT 'completed';
        
        -- Add check constraint
        ALTER TABLE book_logs ADD CONSTRAINT check_book_status CHECK (status IN ('completed', 'planning'));
        
        -- Backfill existing records
        UPDATE book_logs SET status = 'completed' WHERE status IS NULL;
    END IF;
END $$;

-- 3. Update Indexes (Optional but recommended for filtering by status)
CREATE INDEX IF NOT EXISTS idx_movie_logs_status ON movie_logs(status);
CREATE INDEX IF NOT EXISTS idx_book_logs_status ON book_logs(status);

-- 4. Make columns NOT NULL after backfill
ALTER TABLE movie_logs ALTER COLUMN status SET NOT NULL;
ALTER TABLE book_logs ALTER COLUMN status SET NOT NULL;
