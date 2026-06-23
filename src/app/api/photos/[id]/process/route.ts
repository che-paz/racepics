import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/profile";
import { inngest } from "@/lib/inngest/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id: photoId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const profile = await ensureProfile(supabase, user);
  if (!profile || profile.role !== "photographer") {
    return NextResponse.json(
      { error: "Solo fotógrafos pueden encolar procesamiento." },
      { status: 403 }
    );
  }

  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("id, event_id, photographer_id, status")
    .eq("id", photoId)
    .single();

  if (photoError || !photo) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  if (photo.photographer_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  if (photo.status !== "pending") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await inngest.send({
      name: "photo/uploaded",
      data: {
        photoId: photo.id,
        eventId: photo.event_id,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al enviar evento a Inngest.";
    return NextResponse.json(
      {
        error:
          message.includes("event key") || message.includes("INNGEST")
            ? "Inngest no configurado. Añade INNGEST_DEV=1 en .env.local y ejecuta npm run inngest:dev."
            : message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
