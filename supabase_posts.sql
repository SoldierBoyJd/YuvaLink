-- Run in Supabase SQL Editor

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL DEFAULT '',
  tag         TEXT        NOT NULL DEFAULT 'Idea',
  image_url   TEXT,
  likes_count INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Likes table (one row per user per post)
CREATE TABLE IF NOT EXISTS post_likes (
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_likes TO authenticated;

-- RLS
ALTER TABLE posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts"        ON posts;
DROP POLICY IF EXISTS "Users can insert own posts"   ON posts;
DROP POLICY IF EXISTS "Users can update own posts"   ON posts;
DROP POLICY IF EXISTS "Users can delete own posts"   ON posts;
DROP POLICY IF EXISTS "Anyone can read comments"     ON comments;
DROP POLICY IF EXISTS "Users can insert comments"    ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can read likes"        ON post_likes;
DROP POLICY IF EXISTS "Users can manage own likes"   ON post_likes;

CREATE POLICY "Anyone can read posts"         ON posts      FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts"    ON posts      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"    ON posts      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"    ON posts      FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read comments"      ON comments   FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert comments"     ON comments   FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments   FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read likes"         ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own likes"    ON post_likes FOR ALL    TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for post images (run if bucket doesn't exist yet)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can read post images"         ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post images"    ON storage.objects;

CREATE POLICY "Public can read post images"
  ON storage.objects FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated can upload post images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
