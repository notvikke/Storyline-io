-- Add Spotify profile link to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_spotify TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.social_spotify IS 'Spotify profile URL';
