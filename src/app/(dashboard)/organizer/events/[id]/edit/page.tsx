import Link from "next/link";
import { notFound } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import InvitePhotographerForm from "@/components/events/InvitePhotographerForm";
import ExportEventButton from "@/components/photos/ExportEventButton";
import PhotoStatusSummary from "@/components/photos/PhotoStatusSummary";
import ProcessPendingButton from "@/components/photos/ProcessPendingButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPhotoProcessingStats } from "@/lib/photos/processing-stats";
import type { Event } from "@/types/database";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const { data: invites } = await supabase
    .from("event_photographers")
    .select("photographer_id, invited_at")
    .eq("event_id", id);

  const photographerIds = (invites ?? []).map((row) => row.photographer_id);
  const { data: photographers } =
    photographerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", photographerIds)
      : { data: [] };

  const nameById = new Map(
    (photographers ?? []).map((p) => [p.id, p.display_name])
  );

  const photoStats = await getPhotoProcessingStats(id);

  return (
    <div className="space-y-6">
      <Link
        href="/organizer/events"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a mis eventos
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Procesamiento de fotos</CardTitle>
          <CardDescription>
            Estado del pipeline OCR (Inngest + Google Vision).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PhotoStatusSummary stats={photoStats} />
          <ProcessPendingButton
            eventId={id}
            pendingCount={photoStats.counts.pending}
            reprocessCount={
              photoStats.counts.processing + photoStats.counts.failed
            }
          />
          <ExportEventButton eventId={id} photoCount={photoStats.total} />
        </CardContent>
      </Card>
      <EventForm mode="edit" event={event as Event} />
      <InvitePhotographerForm
        eventId={id}
        invites={(invites ?? []).map((row) => ({
          photographer_id: row.photographer_id,
          invited_at: row.invited_at,
          display_name: nameById.get(row.photographer_id) ?? "Fotógrafo",
        }))}
      />
    </div>
  );
}
