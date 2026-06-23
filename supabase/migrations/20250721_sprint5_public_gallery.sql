-- Sprint 5: public gallery RLS for anonymous bib search

DROP POLICY IF EXISTS events_public_select ON events;
CREATE POLICY events_public_select ON events
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS photos_public_select ON photos;
CREATE POLICY photos_public_select ON photos
  FOR SELECT TO anon, authenticated
  USING (
    status = 'ready'
    AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = photos.event_id
        AND e.status = 'active'
    )
  );
