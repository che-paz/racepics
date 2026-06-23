import Link from "next/link";
import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/organizer/events"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a mis eventos
      </Link>
      <EventForm mode="create" />
    </div>
  );
}
