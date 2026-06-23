import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizerEventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <ul className="grid gap-4">
        {[1, 2].map((i) => (
          <li key={i} className="rounded-xl border p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-32" />
          </li>
        ))}
      </ul>
    </div>
  );
}
