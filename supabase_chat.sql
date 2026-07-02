-- Run in Supabase SQL Editor

-- Conversations table (each row = a chat between two users)
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_a, user_b)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  read            BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages      TO authenticated;

-- Disable RLS for simplicity (same as connections)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages      DISABLE ROW LEVEL SECURITY;

-- Enable realtime for live messaging
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Function to get or create a conversation — only allowed if users are connected
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user_a UUID, p_user_b UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv_id UUID;
  a UUID;
  b UUID;
  is_connected BOOLEAN;
BEGIN
  -- Check accepted connection exists (either direction)
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE user_id = p_user_a AND connected_user_id = p_user_b AND status = 'accepted'
  ) INTO is_connected;

  IF NOT is_connected THEN
    RAISE EXCEPTION 'Users are not connected. Connect first before messaging.';
  END IF;

  -- Always store in consistent order (smaller UUID first) to avoid duplicates
  IF p_user_a < p_user_b THEN a := p_user_a; b := p_user_b;
  ELSE a := p_user_b; b := p_user_a;
  END IF;

  SELECT id INTO conv_id FROM conversations WHERE user_a = a AND user_b = b;

  IF conv_id IS NULL THEN
    INSERT INTO conversations (user_a, user_b)
    VALUES (a, b)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;
