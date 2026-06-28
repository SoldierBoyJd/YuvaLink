-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)

-- 1. Add missing columns to profiles table (text columns first for compatibility)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS title        TEXT,
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS location     TEXT,
  ADD COLUMN IF NOT EXISTS github       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin     TEXT,
  ADD COLUMN IF NOT EXISTS website      TEXT,
  ADD COLUMN IF NOT EXISTS cover_url    TEXT;

-- 2. skills/projects/experience: add as TEXT if not present, then convert to JSONB
--    If you already have a "skills text" column, run the USING cast to convert it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills     TEXT DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS projects   TEXT DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '[]';

-- 3. Convert the text columns to JSONB (safe even if they already contain JSON strings)
ALTER TABLE profiles
  ALTER COLUMN skills     TYPE JSONB USING COALESCE(NULLIF(skills, ''), '[]')::jsonb,
  ALTER COLUMN projects   TYPE JSONB USING COALESCE(NULLIF(projects, ''), '[]')::jsonb,
  ALTER COLUMN experience TYPE JSONB USING COALESCE(NULLIF(experience, ''), '[]')::jsonb;

-- Set JSONB defaults
ALTER TABLE profiles
  ALTER COLUMN skills     SET DEFAULT '[]'::jsonb,
  ALTER COLUMN projects   SET DEFAULT '[]'::jsonb,
  ALTER COLUMN experience SET DEFAULT '[]'::jsonb;

-- 2. Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connected_user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'accepted',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, connected_user_id)
);

-- 3. Enable Row Level Security on connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies: users can only see/manage their own connections
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Allow all authenticated users to read profiles (for Discover page)
-- (Only needed if you have RLS on profiles. Run only if profiles has RLS enabled)
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- CREATE POLICY "Public profiles are viewable by everyone"
--   ON profiles FOR SELECT
--   USING (true);

-- 6. Allow users to update their own profile
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- CREATE POLICY "Users can update own profile"
--   ON profiles FOR UPDATE
--   USING (auth.uid() = id);
