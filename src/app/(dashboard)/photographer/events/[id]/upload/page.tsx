import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UploadZone from "@/components/photos/UploadZone";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PhotographerUploadPage({ params }: PageProps) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfile(supabase, user);
  if (!profile || profile.role !== "photographer") {
    redirect("/organizer/events");
  }

  const { data: invite } = await supabase
    .from("event_photographers")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("photographer_id", user.id)
    .maybeSingle();

  if (!invite) {
    notFound();
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, slug, date")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const typedEvent = event as Pick<Event, "id" | "name" | "slug" | "date">;

  return (
    <div className="space-y-4">
      <Link
        href="/photographer/events"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a mis eventos
      </Link>
      <UploadZone eventId={typedEvent.id} eventName={typedEvent.name} />
    </div>
  );
}
