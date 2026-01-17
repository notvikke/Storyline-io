-- Enable Public Read Access for Social Profile Features
-- This allows anyone to view the logs in the user's social profile

-- Movie Logs
CREATE POLICY "Public Read Access" ON public.movie_logs
FOR SELECT TO anon, authenticated USING (true);

-- Book Logs
CREATE POLICY "Public Read Access" ON public.book_logs
FOR SELECT TO anon, authenticated USING (true);

-- TV Logs (if not already done)
CREATE POLICY "Public Read Access" ON public.tv_logs
FOR SELECT TO anon, authenticated USING (true);

-- Travel Logs
CREATE POLICY "Public Read Access" ON public.travel_logs
FOR SELECT TO anon, authenticated USING (true);
