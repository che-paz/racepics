import { createAdminClient } from "@/lib/supabase/admin";
import { inngest } from "@/lib/inngest/client";
import { detectBibNumbers } from "@/lib/vision/ocr";

export const processPhoto = inngest.createFunction(
  {
    id: "process-photo",
    retries: 3,
    concurrency: [{ limit: 5 }],
    triggers: [{ event: "photo/uploaded" }],
    onFailure: async ({ event, error }) => {
      const original = event.data.event?.data as
        | { photoId: string; eventId: string }
        | undefined;
      if (!original?.photoId) return;

      const admin = createAdminClient();
      await admin
        .from("photos")
        .update({ status: "failed" })
        .eq("id", original.photoId);
      console.error(`process-photo failed for ${original.photoId}:`, error);
    },
  },
  async ({ event, step }) => {
    const { photoId, eventId } = event.data;
    const admin = createAdminClient();

    await step.run("mark-processing", async () => {
      const { error } = await admin
        .from("photos")
        .update({ status: "processing" })
        .eq("id", photoId)
        .eq("status", "pending");

      if (error) {
        throw new Error(`Failed to mark photo processing: ${error.message}`);
      }
    });

    const photoContext = await step.run("load-context", async () => {
      const { data: photo, error: photoError } = await admin
        .from("photos")
        .select("id, event_id, storage_path, status")
        .eq("id", photoId)
        .single();

      if (photoError || !photo) {
        throw new Error(photoError?.message ?? "Photo not found");
      }

      const { data: eventRow, error: eventError } = await admin
        .from("events")
        .select("bib_min, bib_max, bib_reference_path")
        .eq("id", eventId)
        .single();

      if (eventError || !eventRow) {
        throw new Error(eventError?.message ?? "Event not found");
      }

      return { photo, eventRow };
    });

    const bibs = await step.run("ocr-detect-bibs", async () => {
      const { data: imageData, error: downloadError } = await admin.storage
        .from("photos")
        .download(photoContext.photo.storage_path);

      if (downloadError || !imageData) {
        throw new Error(
          downloadError?.message ?? "Failed to download photo from storage"
        );
      }

      const imageBuffer = Buffer.from(await imageData.arrayBuffer());
      let referenceImageBuffer: Buffer | null = null;

      if (photoContext.eventRow.bib_reference_path) {
        const { data: refData } = await admin.storage
          .from("events")
          .download(photoContext.eventRow.bib_reference_path);

        if (refData) {
          referenceImageBuffer = Buffer.from(await refData.arrayBuffer());
        }
      }

      return detectBibNumbers(imageBuffer, {
        bibMin: photoContext.eventRow.bib_min,
        bibMax: photoContext.eventRow.bib_max,
        referenceImageBuffer,
      });
    });

    await step.run("save-bibs-and-ready", async () => {
      if (bibs.length > 0) {
        const rows = bibs.map((bib_number) => ({
          photo_id: photoId,
          bib_number,
        }));

        const { error: bibError } = await admin
          .from("photo_bibs")
          .upsert(rows, { onConflict: "photo_id,bib_number" });

        if (bibError) {
          throw new Error(`Failed to save bibs: ${bibError.message}`);
        }
      }

      const { error: updateError } = await admin
        .from("photos")
        .update({ status: "ready" })
        .eq("id", photoId);

      if (updateError) {
        throw new Error(`Failed to mark photo ready: ${updateError.message}`);
      }
    });

    return { photoId, eventId, bibs };
  }
);
