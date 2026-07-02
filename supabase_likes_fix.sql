-- Run in Supabase SQL Editor

-- 1. Fix post_likes RLS: everyone can read (for counting), own rows only for write
DROP POLICY IF EXISTS "Anyone can read likes"      ON post_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;

CREATE POLICY "Anyone can read likes"
  ON post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own likes"
  ON post_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Atomic like toggle function — runs as SECURITY DEFINER so it can always update posts
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  real_count INT;
BEGIN
  -- Insert like if not exists, delete if exists
  IF EXISTS (SELECT 1 FROM post_likes WHERE post_id = p_post_id AND user_id = p_user_id) THEN
    DELETE FROM post_likes WHERE post_id = p_post_id AND user_id = p_user_id;
  ELSE
    INSERT INTO post_likes (post_id, user_id) VALUES (p_post_id, p_user_id);
  END IF;

  -- Count real likes
  SELECT COUNT(*) INTO real_count FROM post_likes WHERE post_id = p_post_id;

  -- Update the denormalized count atomically
  UPDATE posts SET likes_count = real_count WHERE id = p_post_id;

  RETURN real_count;
END;
$$;

-- 3. Grant execute on the function
GRANT EXECUTE ON FUNCTION toggle_like TO authenticated;
