import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — server-side only (Route Handlers, Inngest).
 * Never import in client components.
 *
 * cache: 'no-store' evita que Next.js cachee respuestas de PostgREST
 * (si no, /e/[slug] puede quedar con status viejo tras activar el evento).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (url, init = {}) =>
          fetch(url, { ...init, cache: "no-store" }),
      },
    }
  );
}
