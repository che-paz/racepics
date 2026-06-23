import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { applyWatermark } from "@/lib/photos/watermark";
import { contentTypeFromFileName } from "@/lib/photos/storage-path";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const bibParam = searchParams.get("bib");

  if (!bibParam) {
    return NextResponse.json({ error: "bib es obligatorio." }, { status: 400 });
  }

  const bibNumber = parseInt(bibParam, 10);
  if (Number.isNaN(bibNumber)) {
    return NextResponse.json({ error: "bib inválido." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .select(
      `
      id,
      storage_path,
      status,
      event_id,
      events!inner (name, status),
      photo_bibs!inner (bib_number)
    `
    )
    .eq("id", id)
    .eq("status", "ready")
    .eq("photo_bibs.bib_number", bibNumber)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  const eventRow = photo.events;
  const event = Array.isArray(eventRow) ? eventRow[0] : eventRow;
  if (!event || event.status !== "active") {
    return NextResponse.json(
      { error: "Evento no disponible." },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { data: fileData, error: downloadError } = await admin.storage
    .from("photos")
    .download(photo.storage_path);

  if (downloadError || !fileData) {
    return NextResponse.json(
      { error: downloadError?.message ?? "No se pudo descargar la foto." },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const watermarked = await applyWatermark(buffer, "RacePics");
  const fileName = photo.storage_path.split("/").pop() ?? `${id}.jpg`;
  const contentType = contentTypeFromFileName(fileName);

  return new NextResponse(new Uint8Array(watermarked), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="racepics-${bibNumber}-${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
