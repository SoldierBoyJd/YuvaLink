-- Minimal fix — only converts projects and experience to JSONB
-- skills is already jsonb, connections table already exists

-- projects: null out bad data, convert to jsonb
UPDATE profiles SET projects = NULL
  WHERE projects IS NOT NULL AND projects NOT LIKE '[%';

ALTER TABLE profiles ALTER COLUMN projects DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN projects
  TYPE JSONB USING CASE
    WHEN projects IS NULL THEN '[]'::jsonb
    ELSE projects::jsonb
  END;
ALTER TABLE profiles ALTER COLUMN projects SET DEFAULT '[]'::jsonb;

-- experience: null out bad data, convert to jsonb
UPDATE profiles SET experience = NULL
  WHERE experience IS NOT NULL AND experience NOT LIKE '[%';

ALTER TABLE profiles ALTER COLUMN experience DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN experience
  TYPE JSONB USING CASE
    WHEN experience IS NULL THEN '[]'::jsonb
    ELSE experience::jsonb
  END;
ALTER TABLE profiles ALTER COLUMN experience SET DEFAULT '[]'::jsonb;

-- RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
