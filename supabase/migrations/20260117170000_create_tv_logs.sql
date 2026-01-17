-- Create tv_logs table
CREATE TABLE IF NOT EXISTS public.tv_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    imdb_id TEXT NOT NULL,
    title TEXT NOT NULL,
    poster_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    status TEXT CHECK (status IN ('completed', 'planning', 'watching')) DEFAULT 'completed'
);

-- Enable RLS
ALTER TABLE public.tv_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own tv logs"
    ON public.tv_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tv logs"
    ON public.tv_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tv logs"
    ON public.tv_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tv logs"
    ON public.tv_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS tv_logs_user_id_idx ON public.tv_logs(user_id);
CREATE INDEX IF NOT EXISTS tv_logs_status_idx ON public.tv_logs(status);
