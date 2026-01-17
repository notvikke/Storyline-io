-- Create friendships table for managing user relationships
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique friendship between two users
    CONSTRAINT unique_friendship UNIQUE (requester_id, receiver_id),
    
    -- Prevent self-friending
    CONSTRAINT no_self_friendship CHECK (requester_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view friendships where they are involved
CREATE POLICY "Users can view their friendships"
ON public.friendships
FOR SELECT
TO authenticated
USING (
    requester_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR receiver_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Policy: Authenticated users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
TO authenticated
WITH CHECK (
    requester_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND status = 'pending'
);

-- Policy: Receivers can update status (accept/reject)
CREATE POLICY "Receivers can update request status"
ON public.friendships
FOR UPDATE
TO authenticated
USING (receiver_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (receiver_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create index for faster lookups
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
