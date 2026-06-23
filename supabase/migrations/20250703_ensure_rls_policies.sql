-- Idempotent: ensure RLS policies exist (safe if tables were created manually)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photographers ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_organizer_select_photographers ON profiles;
CREATE POLICY profiles_organizer_select_photographers ON profiles
  FOR SELECT TO authenticated
  USING (
    role = 'photographer'
    AND EXISTS (
      SELECT 1 FROM profiles organizer
      WHERE organizer.id = auth.uid()
        AND organizer.role = 'organizer'
    )
  );

-- events
DROP POLICY IF EXISTS events_organizer_select ON events;
CREATE POLICY events_organizer_select ON events
  FOR SELECT TO authenticated
  USING (organizer_id = auth.uid());

DROP POLICY IF EXISTS events_organizer_insert ON events;
CREATE POLICY events_organizer_insert ON events
  FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS events_organizer_update ON events;
CREATE POLICY events_organizer_update ON events
  FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS events_organizer_delete ON events;
CREATE POLICY events_organizer_delete ON events
  FOR DELETE TO authenticated
  USING (organizer_id = auth.uid());

-- event_photographers
DROP POLICY IF EXISTS event_photographers_organizer_all ON event_photographers;
CREATE POLICY event_photographers_organizer_all ON event_photographers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_photographers.event_id
        AND e.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_photographers.event_id
        AND e.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS event_photographers_photographer_select ON event_photographers;
CREATE POLICY event_photographers_photographer_select ON event_photographers
  FOR SELECT TO authenticated
  USING (photographer_id = auth.uid());

-- grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- storage bucket events
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS events_storage_organizer_insert ON storage.objects;
CREATE POLICY events_storage_organizer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_storage_organizer_update ON storage.objects;
CREATE POLICY events_storage_organizer_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_storage_organizer_select ON storage.objects;
CREATE POLICY events_storage_organizer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_storage_organizer_delete ON storage.objects;
CREATE POLICY events_storage_organizer_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

-- signup trigger (role from metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'organizer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
