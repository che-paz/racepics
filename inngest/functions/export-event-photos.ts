import { createWriteStream } from "fs";
import { readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { finished } from "stream/promises";
import type { Archiver } from "archiver";
import { createAdminClient } from "@/lib/supabase/admin";
import { inngest } from "@/lib/inngest/client";
import { EXPORT_PHOTOS_PER_PART } from "@/lib/photos/event-limits";
import { fetchEventPhotosPage } from "@/lib/photos/paginate-photos";
import type { PhotoRow } from "@/lib/photos/paginate-photos";

export type ExportPart = {
  part: number;
  path: string;
  photoCount: number;
  sizeBytes: number;
};

async function buildZipPart(
  photos: PhotoRow[],
  tmpPath: string
): Promise<Buffer> {
  const archiverModule = await import("archiver");
  const archiver = archiverModule as unknown as (
    format: string,
    options?: { zlib?: { level?: number } }
  ) => Archiver;
  const admin = createAdminClient();
  const output = createWriteStream(tmpPath);
  const archive = archiver("zip", { zlib: { level: 0 } });
  archive.pipe(output);

  for (const photo of photos) {
    const { data, error } = await admin.storage
      .from("photos")
      .download(photo.storage_path);

    if (error || !data) {
      throw new Error(
        error?.message ?? `No se pudo descargar ${photo.storage_path}`
      );
    }

    const fileName = photo.storage_path.split("/").pop() ?? `${photo.id}.jpg`;
    archive.append(Buffer.from(await data.arrayBuffer()), { name: fileName });
  }

  archive.finalize();
  await finished(output);

  return readFile(tmpPath);
}

export const exportEventPhotos = inngest.createFunction(
  {
    id: "export-event-photos",
    retries: 1,
    concurrency: [{ limit: 1, key: "event.export" }],
    triggers: [{ event: "event/export.requested" }],
    onFailure: async ({ event, error }) => {
      const original = event.data.event?.data as
        | { exportId: string }
        | undefined;
      if (!original?.exportId) return;

      const admin = createAdminClient();
      await admin
        .from("event_exports")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Exportación fallida.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", original.exportId);
    },
  },
  async ({ event, step }) => {
    const { exportId, eventId } = event.data;
    const admin = createAdminClient();

    const totalPhotos = await step.run("count-photos", async () => {
      await admin
        .from("event_exports")
        .update({ status: "processing" })
        .eq("id", exportId);

      const { count, error } = await admin
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (error) {
        throw new Error(error.message);
      }

      const total = count ?? 0;
      await admin
        .from("event_exports")
        .update({ total_photos: total })
        .eq("id", exportId);

      return total;
    });

    if (totalPhotos === 0) {
      await step.run("mark-empty-ready", async () => {
        await admin
          .from("event_exports")
          .update({
            status: "ready",
            parts: [],
            completed_at: new Date().toISOString(),
          })
          .eq("id", exportId);
      });
      return { exportId, totalPhotos, parts: 0 };
    }

    const partCount = Math.ceil(totalPhotos / EXPORT_PHOTOS_PER_PART);
    const parts: ExportPart[] = [];

    for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
      const partNumber = partIndex + 1;
      const partMeta = await step.run(`zip-part-${partNumber}`, async () => {
        const photos = await fetchEventPhotosPage(
          admin,
          eventId,
          partIndex,
          EXPORT_PHOTOS_PER_PART
        );

        const tmpPath = join(
          tmpdir(),
          `racepics-export-${exportId}-part-${partNumber}.zip`
        );

        try {
          const zipBuffer = await buildZipPart(photos, tmpPath);
          const storagePath = `${eventId}/${exportId}/part-${String(partNumber).padStart(3, "0")}.zip`;

          const { error: uploadError } = await admin.storage
            .from("exports")
            .upload(storagePath, zipBuffer, {
              contentType: "application/zip",
              upsert: true,
            });

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          return {
            part: partNumber,
            path: storagePath,
            photoCount: photos.length,
            sizeBytes: zipBuffer.byteLength,
          } satisfies ExportPart;
        } finally {
          await unlink(tmpPath).catch(() => undefined);
        }
      });

      parts.push(partMeta);
    }

    await step.run("finalize-export", async () => {
      await admin
        .from("event_exports")
        .update({
          status: "ready",
          parts,
          completed_at: new Date().toISOString(),
        })
        .eq("id", exportId);
    });

    return { exportId, totalPhotos, parts: parts.length };
  }
);
