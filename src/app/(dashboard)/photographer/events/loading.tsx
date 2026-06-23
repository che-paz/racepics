import { Skeleton } from "@/components/ui/skeleton";

export default function PhotographerEventsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <ul className="grid gap-4">
        {[1, 2].map((i) => (
          <li key={i} className="rounded-xl border p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
          </li>
        ))}
      </ul>
    </div>
  );
}
