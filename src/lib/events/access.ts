import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth/profile";

export async function assertEventOrganizer(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data: event, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: error.message };
  }

  if (!event) {
    return { ok: false, status: 404, error: "Evento no encontrado." };
  }

  return { ok: true };
}

export async function assertEventOrganizerOrPhotographer(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
): Promise<{ ok: true; role: "organizer" | "photographer" } | { ok: false; status: number; error: string }> {
  const profile = await getProfile(supabase, userId);
  if (!profile) {
    return { ok: false, status: 403, error: "Perfil no encontrado." };
  }

  if (profile.role === "organizer") {
    const organizerCheck = await assertEventOrganizer(supabase, userId, eventId);
    if (!organizerCheck.ok) {
      return organizerCheck;
    }
    return { ok: true, role: "organizer" };
  }

  if (profile.role === "photographer") {
    const { data: invite, error } = await supabase
      .from("event_photographers")
      .select("event_id")
      .eq("event_id", eventId)
      .eq("photographer_id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, status: 500, error: error.message };
    }

    if (!invite) {
      return { ok: false, status: 403, error: "No estás invitado a este evento." };
    }

    return { ok: true, role: "photographer" };
  }

  return { ok: false, status: 403, error: "No autorizado." };
}
