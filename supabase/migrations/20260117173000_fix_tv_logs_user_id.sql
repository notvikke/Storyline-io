-- Fix for changing user_id to text when policies exist

-- 1. Drop existing policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own tv logs" ON public.tv_logs;
DROP POLICY IF EXISTS "Users can insert their own tv logs" ON public.tv_logs;
DROP POLICY IF EXISTS "Users can update their own tv logs" ON public.tv_logs;
DROP POLICY IF EXISTS "Users can delete their own tv logs" ON public.tv_logs;

-- 2. Drop the foreign key constraint
ALTER TABLE public.tv_logs DROP CONSTRAINT IF EXISTS tv_logs_user_id_fkey;

-- 3. Change the column type
ALTER TABLE public.tv_logs ALTER COLUMN user_id TYPE text;

-- 4. Re-create policies with casting (optional, but good practice if RLS is enabled)
-- Note: Since we use Service Role in API, these are safety nets.
-- auth.uid() returns uuid, so we cast it to text.

CREATE POLICY "Users can view their own tv logs"
    ON public.tv_logs FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tv logs"
    ON public.tv_logs FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tv logs"
    ON public.tv_logs FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tv logs"
    ON public.tv_logs FOR DELETE
    USING (auth.uid()::text = user_id);
