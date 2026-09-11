-- Piloto EsquiTrail fase C: rate limit búsqueda pública por dorsal (anti-scrape)

CREATE TABLE IF NOT EXISTS bib_search_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_key text NOT NULL,
  bib_number integer NOT NULL,
  searched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bib_search_attempts_lookup
  ON bib_search_attempts (event_id, client_key, searched_at DESC);

CREATE INDEX IF NOT EXISTS idx_bib_search_attempts_cleanup
  ON bib_search_attempts (searched_at);

ALTER TABLE bib_search_attempts ENABLE ROW LEVEL SECURITY;

-- Solo service_role (admin client); sin policies para anon/authenticated.

CREATE OR REPLACE FUNCTION public.check_bib_search_rate_limit(
  p_event_id uuid,
  p_client_key text,
  p_bib_number integer,
  p_window_seconds integer DEFAULT 3600,
  p_max_distinct_bibs integer DEFAULT 5,
  p_max_same_bib integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz := now() - make_interval(secs => p_window_seconds);
  v_same_bib_count integer;
  v_distinct_count integer;
  v_oldest timestamptz;
  v_retry_after integer;
BEGIN
  IF p_client_key IS NULL OR length(trim(p_client_key)) = 0 THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'invalid_client',
      'retry_after_seconds', p_window_seconds
    );
  END IF;

  SELECT COUNT(*)::integer INTO v_same_bib_count
  FROM bib_search_attempts
  WHERE event_id = p_event_id
    AND client_key = p_client_key
    AND bib_number = p_bib_number
    AND searched_at >= v_window_start;

  IF v_same_bib_count >= p_max_same_bib THEN
    SELECT MIN(searched_at) INTO v_oldest
    FROM bib_search_attempts
    WHERE event_id = p_event_id
      AND client_key = p_client_key
      AND bib_number = p_bib_number
      AND searched_at >= v_window_start;

    v_retry_after := GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer
    );

    RETURN json_build_object(
      'allowed', false,
      'reason', 'same_bib',
      'retry_after_seconds', v_retry_after
    );
  END IF;

  -- Misma bib ya vista en la ventana = refresh/reintento; no cuenta como dorsal nuevo.
  IF v_same_bib_count = 0 THEN
    SELECT COUNT(DISTINCT bib_number)::integer INTO v_distinct_count
    FROM bib_search_attempts
    WHERE event_id = p_event_id
      AND client_key = p_client_key
      AND searched_at >= v_window_start;

    IF v_distinct_count >= p_max_distinct_bibs THEN
      SELECT MIN(searched_at) INTO v_oldest
      FROM bib_search_attempts
      WHERE event_id = p_event_id
        AND client_key = p_client_key
        AND searched_at >= v_window_start;

      v_retry_after := GREATEST(
        1,
        CEIL(EXTRACT(EPOCH FROM (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer
      );

      RETURN json_build_object(
        'allowed', false,
        'reason', 'distinct_bibs',
        'retry_after_seconds', v_retry_after
      );
    END IF;
  END IF;

  INSERT INTO bib_search_attempts (event_id, client_key, bib_number)
  VALUES (p_event_id, p_client_key, p_bib_number);

  RETURN json_build_object('allowed', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_bib_search_rate_limit(
  uuid, text, integer, integer, integer, integer
) TO service_role;
