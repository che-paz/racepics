import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertEventOrganizerOrPhotographer } from "@/lib/events/access";
import { inngest } from "@/lib/inngest/client";
import { chunkArray } from "@/lib/photos/chunk";
import { fetchAllPhotosForStatuses } from "@/lib/photos/paginate-photos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const INNGEST_BATCH_SIZE = 100;
const UPDATE_BATCH_SIZE = 500;

export async function POST(_request: Request, context: RouteContext) {
  const { id: eventId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const access = await assertEventOrganizerOrPhotographer(
    supabase,
    user.id,
    eventId
  );
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const admin = createAdminClient();

  let photos: { id: string }[];
  try {
    photos = await fetchAllPhotosForStatuses(admin, eventId, [
      "pending",
      "processing",
      "failed",
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar fotos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (photos.length === 0) {
    return NextResponse.json({ ok: true, enqueued: 0 });
  }

  const photoIds = photos.map((photo) => photo.id);

  try {
    for (const idBatch of chunkArray(photoIds, UPDATE_BATCH_SIZE)) {
      const { error: updateError } = await admin
        .from("photos")
        .update({ status: "pending" })
        .eq("event_id", eventId)
        .in("id", idBatch);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    for (const eventBatch of chunkArray(photos, INNGEST_BATCH_SIZE)) {
      await inngest.send(
        eventBatch.map((photo) => ({
          name: "photo/uploaded" as const,
          data: { photoId: photo.id, eventId },
        }))
      );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al enviar eventos a Inngest.";
    return NextResponse.json(
      {
        error:
          message.includes("event key") || message.includes("INNGEST")
            ? "Inngest no configurado. Añade INNGEST_DEV=1 en .env.local y ejecuta npm run inngest:dev en otra terminal."
            : message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, enqueued: photos.length });
}
