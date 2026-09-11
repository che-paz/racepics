import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "rp_rl";

export type BibSearchRateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "distinct_bibs" | "same_bib" | "invalid_client" | "error";
      retryAfterSeconds: number;
      message: string;
    };

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function formatRetryMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  if (minutes === 1) {
    return "Has buscado demasiados dorsales. Prueba de nuevo en 1 minuto.";
  }
  return `Has buscado demasiados dorsales. Prueba de nuevo en ${minutes} minutos.`;
}

async function resolveClientKey(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    null;

  const cookieStore = await cookies();
  const sid = cookieStore.get(COOKIE_NAME)?.value ?? "nosid";

  // IP principal (anti-scrape); cookie del middleware estabiliza tras proxies.
  const material = ip ? `${ip}:${sid}` : `anon:${sid}`;
  return createHash("sha256").update(material).digest("hex");
}

/**
 * Rate limit búsqueda pública por dorsal.
 * - Ventana 1h (BIB_SEARCH_WINDOW_SECONDS)
 * - Máx. 5 dorsales distintos por cliente (BIB_SEARCH_MAX_DISTINCT)
 * - Misma bib: hasta 30/h (BIB_SEARCH_MAX_SAME) — no castiga F5
 */
export async function enforceBibSearchRateLimit(
  eventId: string,
  bibNumber: number
): Promise<BibSearchRateLimitResult> {
  const windowSeconds = envInt("BIB_SEARCH_WINDOW_SECONDS", 3600);
  const maxDistinct = envInt("BIB_SEARCH_MAX_DISTINCT", 5);
  const maxSame = envInt("BIB_SEARCH_MAX_SAME", 30);
  const clientKey = await resolveClientKey();
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("check_bib_search_rate_limit", {
    p_event_id: eventId,
    p_client_key: clientKey,
    p_bib_number: bibNumber,
    p_window_seconds: windowSeconds,
    p_max_distinct_bibs: maxDistinct,
    p_max_same_bib: maxSame,
  });

  if (error) {
    console.error("bib search rate limit rpc failed:", error.message);
    // Fail open: no bloquear corredores si la tabla/RPC aún no está en prod.
    return { allowed: true };
  }

  const row = data as {
    allowed?: boolean;
    reason?: string;
    retry_after_seconds?: number;
  } | null;

  if (row?.allowed) {
    return { allowed: true };
  }

  const retryAfterSeconds =
    typeof row?.retry_after_seconds === "number" && row.retry_after_seconds > 0
      ? row.retry_after_seconds
      : windowSeconds;

  const reason =
    row?.reason === "same_bib" ||
    row?.reason === "distinct_bibs" ||
    row?.reason === "invalid_client"
      ? row.reason
      : "error";

  return {
    allowed: false,
    reason,
    retryAfterSeconds,
    message: formatRetryMessage(retryAfterSeconds),
  };
}
