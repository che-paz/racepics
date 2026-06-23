-- Allow users to create their own profile row (e.g. signup before trigger existed)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
