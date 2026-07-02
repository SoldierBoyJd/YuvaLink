-- ============================================================
-- YuvaLink — Secure RLS Policies for all tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── CONNECTIONS ──────────────────────────────────────────────
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections"   ON connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;

-- Users can see connections where they are either party
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Only the sender can create a connection row (user_id must be themselves)
CREATE POLICY "Users can insert their own connections"
  ON connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the sender can delete their own connection row
CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow update (for status changes via accept_connection function)
CREATE POLICY "Users can update connections they are part of"
  ON connections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Grant table-level privileges (required even with RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;


-- ── NOTIFICATIONS ────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications"   ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications"     ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Any authenticated user can send a notification to another user
CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can only mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;


-- ── CONVERSATIONS ────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations"   ON conversations;
DROP POLICY IF EXISTS "Users can create conversations"       ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Only participants can see a conversation
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Any authenticated user can create a conversation
-- (the SECURITY DEFINER function handles the actual insert)
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Participants can update (last_message, updated_at)
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;


-- ── MESSAGES ─────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages"  ON messages;
DROP POLICY IF EXISTS "Users can send messages"         ON messages;
DROP POLICY IF EXISTS "Users can update own messages"   ON messages;
DROP POLICY IF EXISTS "Users can delete own messages"   ON messages;

-- Only conversation participants can read messages
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
  );

-- Sender must be themselves, be in the conversation,
-- AND have an accepted connection with the other participant
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM connections cn
      WHERE cn.user_id = auth.uid()
        AND cn.connected_user_id = (
          SELECT CASE WHEN c2.user_a = auth.uid() THEN c2.user_b ELSE c2.user_a END
          FROM conversations c2 WHERE c2.id = conversation_id
        )
        AND cn.status = 'accepted'
    )
  );

-- Only recipient can mark as read (update read flag only)
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
    )
  );

-- Only sender can delete their own message
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;


-- ── POSTS ────────────────────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts"       ON posts;
DROP POLICY IF EXISTS "Users can insert own posts"  ON posts;
DROP POLICY IF EXISTS "Users can update own posts"  ON posts;
DROP POLICY IF EXISTS "Users can delete own posts"  ON posts;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;


-- ── COMMENTS ─────────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments"      ON comments;
DROP POLICY IF EXISTS "Users can insert comments"     ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;


-- ── POST_LIKES ───────────────────────────────────────────────
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read likes"      ON post_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;

CREATE POLICY "Anyone can read likes"
  ON post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own likes"
  ON post_likes FOR ALL TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_likes TO authenticated;


-- ── PROFILES ─────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"                        ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"                        ON profiles;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
