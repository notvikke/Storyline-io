-- Drop existing tables (Cascades to guestbook and policies)
DROP TABLE IF EXISTS public.guestbook CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Re-create profiles table with TEXT id for Clerk compatibility
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID (e.g., user_2k...)
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    location_label TEXT,
    cover_photo_url TEXT,
    
    -- Pinned Items (References to logs)
    pinned_movie_id UUID REFERENCES public.movie_logs(id) ON DELETE SET NULL,
    pinned_book_id UUID REFERENCES public.book_logs(id) ON DELETE SET NULL,
    pinned_tv_id UUID REFERENCES public.tv_logs(id) ON DELETE SET NULL,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 280)
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid()::text = id);

-- Create Guestbook table with TEXT FKs
CREATE TABLE public.guestbook (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    author_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT message_length CHECK (char_length(message) > 0 AND char_length(message) <= 500)
);

-- Enable RLS for guestbook
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- Guestbook Policies
CREATE POLICY "Guestbook entries are viewable by everyone" 
    ON public.guestbook FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can sign guestbooks" 
    ON public.guestbook FOR INSERT 
    WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can delete entries on their own guestbook" 
    ON public.guestbook FOR DELETE 
    USING (auth.uid()::text = profile_owner_id OR auth.uid()::text = author_id);

-- Indexes for performance
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX guestbook_profile_owner_idx ON public.guestbook(profile_owner_id);
