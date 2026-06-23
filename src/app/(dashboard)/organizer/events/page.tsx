import Link from "next/link";
import { CalendarPlus, CircleAlert } from "lucide-react";
import OrganizerEventCard from "@/components/events/OrganizerEventCard";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getPhotoProcessingStats } from "@/lib/photos/processing-stats";
import type { Event } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OrganizerEventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyState
        icon={CircleAlert}
        variant="error"
        title="Error al cargar eventos"
        description={error.message}
      />
    );
  }

  const eventList = (events ?? []) as Event[];
  const eventIds = eventList.map((event) => event.id);

  const photographerCountByEventId = new Map<string, number>();
  if (eventIds.length > 0) {
    const { data: invites } = await supabase
      .from("event_photographers")
      .select("event_id")
      .in("event_id", eventIds);

    for (const row of invites ?? []) {
      photographerCountByEventId.set(
        row.event_id,
        (photographerCountByEventId.get(row.event_id) ?? 0) + 1
      );
    }
  }

  const statsByEventId = new Map(
    await Promise.all(
      eventList.map(async (event) => [
        event.id,
        await getPhotoProcessingStats(event.id),
      ] as const)
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis eventos</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus carreras deportivas.
          </p>
        </div>
        <Link
          href="/organizer/events/new"
          className={cn(buttonVariants())}
        >
          Nuevo evento
        </Link>
      </div>

      {(events ?? []).length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Sin eventos"
          description="Crea tu primer evento para empezar a configurar dorsales y fotógrafos."
          action={
            <Link
              href="/organizer/events/new"
              className={cn(buttonVariants())}
            >
              Crear evento
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-6">
          {eventList.map((event) => (
            <li key={event.id}>
              <OrganizerEventCard
                event={event}
                stats={statsByEventId.get(event.id)!}
                photographerCount={
                  photographerCountByEventId.get(event.id) ?? 0
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
