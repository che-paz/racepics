import Link from "next/link";
import { Calendar, Camera, Hash, Pencil } from "lucide-react";
import EventPublicLink from "@/components/events/EventPublicLink";
import PhotoStatusSummary from "@/components/photos/PhotoStatusSummary";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appUrl } from "@/lib/seo";
import type { PhotoProcessingStats } from "@/lib/photos/processing-stats";
import type { Event, EventStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  EventStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-green-100 text-green-800",
  },
  draft: {
    label: "Borrador",
    className: "bg-amber-100 text-amber-900",
  },
  archived: {
    label: "Archivado",
    className: "bg-muted text-muted-foreground",
  },
};

function formatEventDate(date: string | null): string {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type OrganizerEventCardProps = {
  event: Event;
  stats: PhotoProcessingStats;
  photographerCount: number;
};

export default function OrganizerEventCard({
  event,
  stats,
  photographerCount,
}: OrganizerEventCardProps) {
  const status = statusConfig[event.status];
  const publicPath = `/e/${event.slug}`;
  const publicUrl = appUrl(publicPath);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{event.name}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              status.className
            )}
          >
            {status.label}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-xs text-muted-foreground">
            {event.slug}
          </span>
        </CardDescription>
        <CardAction>
          <Link
            href={`/organizer/events/${event.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil />
            Editar
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <Calendar
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Fecha
              </dt>
              <dd>{formatEventDate(event.date)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Hash
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Dorsales
              </dt>
              <dd>
                {event.bib_min.toLocaleString("es-ES")} –{" "}
                {event.bib_max.toLocaleString("es-ES")}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Camera
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Fotógrafos
              </dt>
              <dd>
                {photographerCount === 0
                  ? "Ninguno invitado"
                  : photographerCount === 1
                    ? "1 invitado"
                    : `${photographerCount} invitados`}
              </dd>
            </div>
          </div>
        </dl>

        <EventPublicLink
          slug={event.slug}
          fullUrl={publicUrl}
          isActive={event.status === "active"}
        />

        <div className="border-t pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Fotos
          </p>
          <PhotoStatusSummary stats={stats} compact />
        </div>
      </CardContent>
    </Card>
  );
}
