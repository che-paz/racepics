-- Fix infinite recursion: profiles policy must not SELECT from profiles directly.
-- Use SECURITY DEFINER helper so role checks bypass RLS.

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.auth_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;

DROP POLICY IF EXISTS profiles_organizer_select_photographers ON profiles;
CREATE POLICY profiles_organizer_select_photographers ON profiles
  FOR SELECT TO authenticated
  USING (
    role = 'photographer'
    AND public.auth_user_role() = 'organizer'
  );
