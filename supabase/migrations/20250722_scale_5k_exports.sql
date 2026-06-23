-- Sprint piloto 5k: stats agregados, exportaciones masivas, bucket exports

CREATE OR REPLACE FUNCTION public.get_photo_processing_stats(p_event_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'processing', COUNT(*) FILTER (WHERE status = 'processing'),
    'ready', COUNT(*) FILTER (WHERE status = 'ready'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'total', COUNT(*),
    'ready_with_bibs', (
      SELECT COUNT(DISTINCT pb.photo_id)
      FROM photo_bibs pb
      INNER JOIN photos p ON p.id = pb.photo_id
      WHERE p.event_id = p_event_id AND p.status = 'ready'
    )
  )
  FROM photos
  WHERE event_id = p_event_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_photo_processing_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_photo_processing_stats(uuid) TO service_role;

CREATE TABLE IF NOT EXISTS event_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_photos integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS event_exports_event_id_created_at_idx
  ON event_exports (event_id, created_at DESC);

ALTER TABLE event_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers read own event exports"
  ON event_exports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = event_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers create exports for own events"
  ON event_exports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM events e
      WHERE e.id = event_exports.event_id
        AND e.organizer_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  524288000,
  ARRAY['application/zip']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
