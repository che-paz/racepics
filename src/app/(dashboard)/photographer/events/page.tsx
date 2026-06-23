import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert, Mail } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";

type InvitedEvent = Pick<Event, "id" | "name" | "slug" | "date" | "status">;

export default async function PhotographerEventsPage() {
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

  const { data: invites, error: invitesError } = await supabase
    .from("event_photographers")
    .select("event_id")
    .eq("photographer_id", user.id);

  if (invitesError) {
    return (
      <EmptyState
        icon={CircleAlert}
        variant="error"
        title="Error al cargar invitaciones"
        description={invitesError.message}
      />
    );
  }

  const eventIds = (invites ?? []).map((row) => row.event_id);

  let events: InvitedEvent[] = [];
  if (eventIds.length > 0) {
    const { data, error } = await supabase
      .from("events")
      .select("id, name, slug, date, status")
      .in("id", eventIds)
      .order("date", { ascending: false });

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

    events = (data ?? []) as InvitedEvent[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis eventos</h1>
        <p className="text-muted-foreground">
          Eventos donde has sido invitado como fotógrafo.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Sin eventos"
          description="Cuando un organizador te invite, el evento aparecerá aquí para que puedas subir fotos."
        />
      ) : (
        <ul className="grid gap-4">
          {events.map((event) => (
            <li key={event.id}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription>
                      /e/{event.slug}
                      {event.date ? ` · ${event.date}` : ""}
                      {" · "}
                      {event.status}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/photographer/events/${event.id}/upload`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Subir fotos
                  </Link>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
