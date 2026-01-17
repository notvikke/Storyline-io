-- Explicitly grant full privileges to service_role (just in case)
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.guestbook TO service_role;

-- Ensure sequences if any are accessible (though uuid doesn't use them, text doesn't)
-- Verify existing policies don't block? (They shouldn't apply)

-- Just to be absolutely sure, create a policy that explicitly allows service_role if RLS was somehow forced
-- (This is usually not needed/possible, as service_role bypasses)
