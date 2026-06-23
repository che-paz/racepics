-- Sprint 4: photo_bibs table for OCR-indexed bib numbers

CREATE TABLE photo_bibs (
  photo_id UUID NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  bib_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (photo_id, bib_number)
);

CREATE INDEX idx_photo_bibs_bib_number ON photo_bibs (bib_number);
CREATE INDEX idx_photo_bibs_photo_id ON photo_bibs (photo_id);

ALTER TABLE photo_bibs ENABLE ROW LEVEL SECURITY;

-- Organizers read bibs for photos in their events
DROP POLICY IF EXISTS photo_bibs_organizer_select ON photo_bibs;
CREATE POLICY photo_bibs_organizer_select ON photo_bibs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = photo_bibs.photo_id
        AND e.organizer_id = auth.uid()
    )
  );

-- Photographers read bibs for their own photos
DROP POLICY IF EXISTS photo_bibs_photographer_select ON photo_bibs;
CREATE POLICY photo_bibs_photographer_select ON photo_bibs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos p
      WHERE p.id = photo_bibs.photo_id
        AND p.photographer_id = auth.uid()
    )
  );

-- Public read for ready photos (Sprint 5 bib search)
DROP POLICY IF EXISTS photo_bibs_public_select ON photo_bibs;
CREATE POLICY photo_bibs_public_select ON photo_bibs
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = photo_bibs.photo_id
        AND p.status = 'ready'
        AND e.status = 'active'
    )
  );
