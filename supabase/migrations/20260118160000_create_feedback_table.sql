-- 1. Create app_feedback table
create table if not exists public.app_feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    type text not null check (type in ('bug', 'feature_request')),
    message text not null,
    status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add is_admin to profiles if missing (Safely)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_admin') then
        alter table public.profiles add column is_admin boolean default false;
    end if;
end $$;

-- 3. Enable RLS
alter table public.app_feedback enable row level security;

-- 4. Policies
-- Allow anyone authenticated to insert feedback
create policy "Authenticated users can insert feedback"
    on public.app_feedback for insert
    with check (auth.role() = 'authenticated');

-- Allow only admins to read feedback
-- Fixed: Cast auth.uid() to text to match profiles.id
create policy "Admins can read feedback"
    on public.app_feedback for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()::text  -- CAST TO TEXT HERE
            and is_admin = true
        )
    );
