import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

function parseRole(value: unknown): UserRole {
  if (value === "photographer") return "photographer";
  return "organizer";
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] profile fetch failed:", error.message);
    return null;
  }

  return data;
}

/** Create profile from auth metadata if missing (cloud signup before trigger). */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<Profile | null> {
  const existing = await getProfile(supabase, user.id);
  if (existing) return existing;

  const role = parseRole(user.user_metadata?.role);
  const display_name =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Usuario";

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, role, display_name },
      { onConflict: "id" }
    )
    .select("id, role, display_name, created_at")
    .single();

  if (error) {
    console.error("[auth] profile create failed:", error.message);

    // Fallback: service role (works without INSERT RLS policy)
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const { data: adminData, error: adminError } = await admin
        .from("profiles")
        .upsert({ id: user.id, role, display_name }, { onConflict: "id" })
        .select("id, role, display_name, created_at")
        .single();

      if (adminError) {
        console.error("[auth] profile admin create failed:", adminError.message);
        return null;
      }
      return adminData;
    } catch {
      return null;
    }
  }

  return data;
}

export function dashboardPathForRole(role: UserRole | null | undefined): string {
  if (role === "photographer") return "/photographer/events";
  return "/organizer/events";
}

export function isOrganizerRoute(pathname: string): boolean {
  return pathname.startsWith("/organizer");
}

export function isPhotographerRoute(pathname: string): boolean {
  return pathname.startsWith("/photographer");
}

/** Only redirect when role is known and explicitly wrong — avoids ping-pong on missing profile. */
export function wrongRoleRedirectPath(
  pathname: string,
  role: UserRole | null | undefined
): string | null {
  if (!role) return null;

  if (isOrganizerRoute(pathname) && role === "photographer") {
    return "/photographer/events";
  }

  if (isPhotographerRoute(pathname) && role === "organizer") {
    return "/organizer/events";
  }

  return null;
}
