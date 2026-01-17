-- Add social connection links to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_x TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_snapchat TEXT,
ADD COLUMN IF NOT EXISTS social_email TEXT,
ADD COLUMN IF NOT EXISTS social_website TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.social_x IS 'Twitter/X handle or profile URL';
COMMENT ON COLUMN public.profiles.social_instagram IS 'Instagram handle or profile URL';
COMMENT ON COLUMN public.profiles.social_tiktok IS 'TikTok handle or profile URL';
COMMENT ON COLUMN public.profiles.social_snapchat IS 'Snapchat handle or profile URL';
COMMENT ON COLUMN public.profiles.social_email IS 'Public contact email address';
COMMENT ON COLUMN public.profiles.social_website IS 'Personal website URL';
