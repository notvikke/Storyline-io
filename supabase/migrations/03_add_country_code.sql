-- =============================================
-- Migration: Add country_code to travel_logs
-- =============================================

ALTER TABLE travel_logs 
ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Verify addition
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_logs' AND column_name = 'country_code') THEN
    RAISE NOTICE 'Column country_code added successfully to travel_logs';
  ELSE
    RAISE EXCEPTION 'Failed to add column country_code to travel_logs';
  END IF;
END $$;
