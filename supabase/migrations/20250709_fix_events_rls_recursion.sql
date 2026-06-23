-- Fix infinite recursion between events ↔ event_photographers ↔ photos policies.
-- Cross-table checks must use SECURITY DEFINER helpers (bypass RLS).

CREATE OR REPLACE FUNCTION public.is_event_organizer(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = p_event_id AND organizer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_event_photographer(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_photographers
    WHERE event_id = p_event_id AND photographer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.storage_path_event_id(p_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT (storage.foldername(p_name))[1]::uuid;
$$;

REVOKE ALL ON FUNCTION public.is_event_organizer(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_event_photographer(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.storage_path_event_id(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_event_organizer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_photographer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_path_event_id(TEXT) TO authenticated;

-- events: photographer reads invited events (no subquery on event_photographers)
DROP POLICY IF EXISTS events_photographer_select ON events;
CREATE POLICY events_photographer_select ON events
  FOR SELECT TO authenticated
  USING (public.is_event_photographer(id));

-- event_photographers: organizer manages invites (no subquery on events)
DROP POLICY IF EXISTS event_photographers_organizer_all ON event_photographers;
CREATE POLICY event_photographers_organizer_all ON event_photographers
  FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id))
  WITH CHECK (public.is_event_organizer(event_id));

-- photos
DROP POLICY IF EXISTS photos_photographer_insert ON photos;
CREATE POLICY photos_photographer_insert ON photos
  FOR INSERT TO authenticated
  WITH CHECK (
    photographer_id = auth.uid()
    AND public.is_event_photographer(event_id)
  );

DROP POLICY IF EXISTS photos_organizer_select ON photos;
CREATE POLICY photos_organizer_select ON photos
  FOR SELECT TO authenticated
  USING (public.is_event_organizer(event_id));

-- storage: events bucket (bib reference)
DROP POLICY IF EXISTS events_storage_organizer_insert ON storage.objects;
CREATE POLICY events_storage_organizer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'events'
    AND public.is_event_organizer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS events_storage_organizer_update ON storage.objects;
CREATE POLICY events_storage_organizer_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'events'
    AND public.is_event_organizer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS events_storage_organizer_select ON storage.objects;
CREATE POLICY events_storage_organizer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'events'
    AND public.is_event_organizer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS events_storage_organizer_delete ON storage.objects;
CREATE POLICY events_storage_organizer_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'events'
    AND public.is_event_organizer(public.storage_path_event_id(name))
  );

-- storage: photos bucket
DROP POLICY IF EXISTS photos_storage_photographer_insert ON storage.objects;
CREATE POLICY photos_storage_photographer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND public.is_event_photographer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS photos_storage_photographer_select ON storage.objects;
CREATE POLICY photos_storage_photographer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_event_photographer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS photos_storage_photographer_update ON storage.objects;
CREATE POLICY photos_storage_photographer_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_event_photographer(public.storage_path_event_id(name))
  );

DROP POLICY IF EXISTS photos_storage_organizer_select ON storage.objects;
CREATE POLICY photos_storage_organizer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_event_organizer(public.storage_path_event_id(name))
  );
