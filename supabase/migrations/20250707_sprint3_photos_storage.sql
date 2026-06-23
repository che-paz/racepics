-- Sprint 3: photos table, bucket `photos`, RLS + storage policies

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_event_id ON photos (event_id);
CREATE INDEX idx_photos_photographer_id ON photos (photographer_id);
CREATE INDEX idx_photos_status ON photos (status);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Photographers read events they are invited to
DROP POLICY IF EXISTS events_photographer_select ON events;
CREATE POLICY events_photographer_select ON events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_photographers ep
      WHERE ep.event_id = events.id
        AND ep.photographer_id = auth.uid()
    )
  );

-- photos: photographer inserts own rows for invited events
DROP POLICY IF EXISTS photos_photographer_insert ON photos;
CREATE POLICY photos_photographer_insert ON photos
  FOR INSERT TO authenticated
  WITH CHECK (
    photographer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM event_photographers ep
      WHERE ep.event_id = photos.event_id
        AND ep.photographer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS photos_photographer_select ON photos;
CREATE POLICY photos_photographer_select ON photos
  FOR SELECT TO authenticated
  USING (photographer_id = auth.uid());

-- Organizer reads photos for own events
DROP POLICY IF EXISTS photos_organizer_select ON photos;
CREATE POLICY photos_organizer_select ON photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = photos.event_id
        AND e.organizer_id = auth.uid()
    )
  );

-- Storage bucket `photos` (private, direct upload via signed URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Photographer upload/read in invited event folders: {event_id}/original/*
DROP POLICY IF EXISTS photos_storage_photographer_insert ON storage.objects;
CREATE POLICY photos_storage_photographer_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] IN (
      SELECT ep.event_id::text FROM event_photographers ep
      WHERE ep.photographer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS photos_storage_photographer_select ON storage.objects;
CREATE POLICY photos_storage_photographer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] IN (
      SELECT ep.event_id::text FROM event_photographers ep
      WHERE ep.photographer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS photos_storage_photographer_update ON storage.objects;
CREATE POLICY photos_storage_photographer_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] IN (
      SELECT ep.event_id::text FROM event_photographers ep
      WHERE ep.photographer_id = auth.uid()
    )
  );

-- Organizer read photos in own events
DROP POLICY IF EXISTS photos_storage_organizer_select ON storage.objects;
CREATE POLICY photos_storage_organizer_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e WHERE e.organizer_id = auth.uid()
    )
  );
