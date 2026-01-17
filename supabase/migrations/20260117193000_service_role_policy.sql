-- Force RLS policies to allow service_role explicitly
-- (Normally service_role bypasses RLS, but this ensures it works even if bypass is disabled or misconfigured)

CREATE POLICY "Service Role Full Access"
ON public.profiles
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service Role Full Access Guestbook"
ON public.guestbook
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
