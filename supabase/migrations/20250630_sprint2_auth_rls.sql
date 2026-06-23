-- Sprint 2: RLS, event_photographers, storage for bib reference

-- Update profile trigger to honor role from signup metadata
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
  );
  RETURN NEW;
END;
$$;

-- event_photographers: organizer invites photographers to an event
CREATE TABLE event_photographers (
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, photographer_id)
);

CREATE INDEX idx_event_photographers_photographer_id ON event_photographers (photographer_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photographers ENABLE ROW LEVEL SECURITY;

-- profiles: users read/update own row
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Organizers can read photographer profiles (for invites list)
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

-- events: organizer full CRUD on own events
CREATE POLICY events_organizer_select ON events
  FOR SELECT TO authenticated
  USING (organizer_id = auth.uid());

CREATE POLICY events_organizer_insert ON events
  FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY events_organizer_update ON events
  FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY events_organizer_delete ON events
  FOR DELETE TO authenticated
  USING (organizer_id = auth.uid());

-- event_photographers: organizer manages invites; photographer reads own
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

CREATE POLICY event_photographers_photographer_select ON event_photographers
  FOR SELECT TO authenticated
  USING (photographer_id = auth.uid());

-- Storage bucket for event assets (bib reference)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Organizer uploads bib reference to events/{event_id}/bib-reference.*
CREATE POLICY events_storage_organizer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

CREATE POLICY events_storage_organizer_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

CREATE POLICY events_storage_organizer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );

CREATE POLICY events_storage_organizer_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );
