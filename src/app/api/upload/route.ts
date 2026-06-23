import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/auth/profile";
import {
  buildPhotoStoragePath,
  contentTypeFromFileName,
} from "@/lib/photos/storage-path";
import { MAX_PHOTOS_PER_EVENT } from "@/lib/photos/event-limits";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type UploadRequestBody = {
  eventId?: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
};

export async function POST(request: Request) {
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
      { error: "Solo fotógrafos pueden subir fotos." },
      { status: 403 }
    );
  }

  let body: UploadRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { eventId, fileName, contentType, fileSize } = body;

  if (!eventId || !fileName) {
    return NextResponse.json(
      { error: "eventId y fileName son obligatorios." },
      { status: 400 }
    );
  }

  if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Archivo demasiado grande (máx. 20 MB)." },
      { status: 400 }
    );
  }

  const resolvedContentType =
    contentType && ALLOWED_TYPES.has(contentType)
      ? contentType
      : contentTypeFromFileName(fileName);

  if (!ALLOWED_TYPES.has(resolvedContentType)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." },
      { status: 400 }
    );
  }

  const { data: invite, error: inviteError } = await supabase
    .from("event_photographers")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("photographer_id", user.id)
    .maybeSingle();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  if (!invite) {
    return NextResponse.json(
      { error: "No estás invitado a este evento." },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { count: photoCount, error: countError } = await admin
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((photoCount ?? 0) >= MAX_PHOTOS_PER_EVENT) {
    return NextResponse.json(
      {
        error: `Este evento alcanzó el límite de ${MAX_PHOTOS_PER_EVENT.toLocaleString("es-ES")} fotos.`,
      },
      { status: 400 }
    );
  }

  const photoId = crypto.randomUUID();
  const storagePath = buildPhotoStoragePath(eventId, photoId, fileName);

  const { error: insertError } = await supabase.from("photos").insert({
    id: photoId,
    event_id: eventId,
    photographer_id: user.id,
    storage_path: storagePath,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: signed, error: signedError } = await admin.storage
    .from("photos")
    .createSignedUploadUrl(storagePath);

  if (signedError || !signed) {
    await admin.from("photos").delete().eq("id", photoId);
    return NextResponse.json(
      { error: signedError?.message ?? "No se pudo generar URL de subida." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    photoId,
    storagePath,
    signedUrl: signed.signedUrl,
    token: signed.token,
    contentType: resolvedContentType,
  });
}
