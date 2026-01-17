-- Add avatar_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing profiles (if any) could be done here if we had access to auth.users but we don't easily in migrations usually.
-- It will be populated on next update.
