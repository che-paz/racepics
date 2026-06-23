"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/profile";
import { ensureUniqueSlug, slugify } from "@/lib/events/slug";

export type EventFormState = {
  error?: string;
  success?: boolean;
  eventId?: string;
};

type EventInput = {
  name: string;
  date: string | null;
  bib_min: number;
  bib_max: number;
  slug?: string;
  status: "draft" | "active" | "archived";
};

type OrganizerContext =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string };

async function getOrganizerClient(): Promise<OrganizerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const profile = await ensureProfile(supabase, user);
  if (!profile) {
    return { ok: false, error: "No se pudo cargar tu perfil." };
  }

  if (profile.role !== "organizer") {
    return { ok: false, error: "Solo organizadores pueden gestionar eventos." };
  }

  return { ok: true, supabase, userId: user.id };
}

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  excludeEventId?: string
): Promise<string> {
  const base = slugify(name) || "evento";

  // Service role: check slug uniqueness globally (RLS only exposes own events)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  let query = admin.from("events").select("slug");
  if (excludeEventId) {
    query = query.neq("id", excludeEventId);
  }

  const { data: events } = await query;
  const existing = (events ?? []).map((e) => e.slug);
  return ensureUniqueSlug(base, existing);
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const ctx = await getOrganizerClient();
  if (!ctx.ok) return { error: ctx.error };

  const { supabase, userId } = ctx;
  const input = parseEventInput(formData);
  if ("error" in input) return { error: input.error };

  const slug = await resolveUniqueSlug(supabase, input.name);

  const { data, error } = await supabase
    .from("events")
    .insert({
      organizer_id: userId,
      name: input.name,
      slug,
      date: input.date,
      bib_min: input.bib_min,
      bib_max: input.bib_max,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("row-level security")) {
      return {
        error:
          "Permiso denegado al crear evento. Ejecuta en Supabase: npx supabase db push (migración 20250703).",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/organizer/events");
  return { success: true, eventId: data.id };
}

export async function updateEvent(
  eventId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const ctx = await getOrganizerClient();
  if (!ctx.ok) return { error: ctx.error };

  const { supabase } = ctx;
  const input = parseEventInput(formData);
  if ("error" in input) return { error: input.error };

  const slug = input.slug?.trim()
    ? slugify(input.slug)
    : await resolveUniqueSlug(supabase, input.name, eventId);

  if (!slug) {
    return { error: "El slug no puede estar vacío." };
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("events")
    .select("id")
    .eq("slug", slug)
    .neq("id", eventId)
    .maybeSingle();

  if (existing) {
    return { error: "Ese slug ya está en uso por otro evento." };
  }

  const { error } = await supabase
    .from("events")
    .update({
      name: input.name,
      slug,
      date: input.date,
      bib_min: input.bib_min,
      bib_max: input.bib_max,
      status: input.status,
    })
    .eq("id", eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/events/${eventId}/edit`);
  return { success: true, eventId };
}

export async function updateBibReferencePath(
  eventId: string,
  path: string
): Promise<EventFormState> {
  const ctx = await getOrganizerClient();
  if (!ctx.ok) return { error: ctx.error };

  const { supabase } = ctx;
  const { error } = await supabase
    .from("events")
    .update({ bib_reference_path: path })
    .eq("id", eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/organizer/events/${eventId}/edit`);
  return { success: true };
}

export async function invitePhotographer(
  eventId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const ctx = await getOrganizerClient();
  if (!ctx.ok) return { error: ctx.error };

  const { supabase } = ctx;
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "Introduce el email del fotógrafo." };
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data: listData, error: listError } =
    await admin.auth.admin.listUsers();

  if (listError) {
    return { error: "No se pudo buscar al usuario." };
  }

  const matchedUser = listData.users.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (!matchedUser) {
    return {
      error:
        "No hay cuenta con ese email. El fotógrafo debe registrarse primero.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", matchedUser.id)
    .single();

  if (profile?.role !== "photographer") {
    return { error: "Ese usuario no tiene rol de fotógrafo." };
  }

  const { error: inviteError } = await supabase
    .from("event_photographers")
    .upsert(
      { event_id: eventId, photographer_id: matchedUser.id },
      { onConflict: "event_id,photographer_id" }
    );

  if (inviteError) {
    return { error: inviteError.message };
  }

  revalidatePath(`/organizer/events/${eventId}/edit`);
  return { success: true };
}

function parseEventInput(
  formData: FormData
): EventInput | { error: string } {
  const name = (formData.get("name") as string)?.trim();
  const dateRaw = (formData.get("date") as string)?.trim();
  const bibMinRaw = formData.get("bib_min") as string;
  const bibMaxRaw = formData.get("bib_max") as string;
  const slugRaw = (formData.get("slug") as string)?.trim();
  const statusRaw = (formData.get("status") as string)?.trim();

  if (!name) {
    return { error: "El nombre del evento es obligatorio." };
  }

  const bib_min = parseInt(bibMinRaw, 10);
  const bib_max = parseInt(bibMaxRaw, 10);

  if (Number.isNaN(bib_min) || Number.isNaN(bib_max)) {
    return { error: "Rango de dorsales inválido." };
  }

  if (bib_min > bib_max) {
    return { error: "El dorsal mínimo no puede ser mayor que el máximo." };
  }

  const status =
    statusRaw === "active" || statusRaw === "archived" ? statusRaw : "draft";

  return {
    name,
    date: dateRaw || null,
    bib_min,
    bib_max,
    slug: slugRaw || undefined,
    status,
  };
}
