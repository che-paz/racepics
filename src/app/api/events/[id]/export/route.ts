import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertEventOrganizer } from "@/lib/events/access";
import { inngest } from "@/lib/inngest/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SIGNED_URL_EXPIRY = 60 * 60 * 24;

type ExportPart = {
  part: number;
  path: string;
  photoCount: number;
  sizeBytes: number;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id: eventId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const access = await assertEventOrganizer(supabase, user.id, eventId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { data: exportRow, error } = await supabase
    .from("event_exports")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!exportRow) {
    return NextResponse.json({ export: null });
  }

  const parts = (exportRow.parts as ExportPart[] | null) ?? [];
  const admin = createAdminClient();
  const downloadParts = [];

  for (const part of parts) {
    const { data: signed, error: signedError } = await admin.storage
      .from("exports")
      .createSignedUrl(part.path, SIGNED_URL_EXPIRY);

    if (signedError || !signed) {
      continue;
    }

    downloadParts.push({
      ...part,
      downloadUrl: signed.signedUrl,
    });
  }

  return NextResponse.json({
    export: {
      id: exportRow.id,
      status: exportRow.status,
      totalPhotos: exportRow.total_photos,
      parts: downloadParts,
      errorMessage: exportRow.error_message,
      createdAt: exportRow.created_at,
      completedAt: exportRow.completed_at,
    },
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: eventId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const access = await assertEventOrganizer(supabase, user.id, eventId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { data: activeExport } = await supabase
    .from("event_exports")
    .select("id, status")
    .eq("event_id", eventId)
    .in("status", ["pending", "processing"])
    .limit(1)
    .maybeSingle();

  if (activeExport) {
    return NextResponse.json(
      { error: "Ya hay una exportación en curso para este evento." },
      { status: 409 }
    );
  }

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "No hay fotos para exportar en este evento." },
      { status: 400 }
    );
  }

  const { data: exportRow, error: insertError } = await admin
    .from("event_exports")
    .insert({
      event_id: eventId,
      status: "pending",
      total_photos: count,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !exportRow) {
    return NextResponse.json(
      { error: insertError?.message ?? "No se pudo crear la exportación." },
      { status: 500 }
    );
  }

  try {
    await inngest.send({
      name: "event/export.requested",
      data: {
        exportId: exportRow.id,
        eventId,
      },
    });
  } catch (err) {
    await admin
      .from("event_exports")
      .update({
        status: "failed",
        error_message: "No se pudo encolar la exportación.",
      })
      .eq("id", exportRow.id);

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

  return NextResponse.json({
    ok: true,
    exportId: exportRow.id,
    totalPhotos: count,
  });
}
