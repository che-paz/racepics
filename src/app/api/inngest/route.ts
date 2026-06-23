import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { exportEventPhotos } from "../../../../inngest/functions/export-event-photos";
import { processPhoto } from "../../../../inngest/functions/process-photo";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processPhoto, exportEventPhotos],
});
