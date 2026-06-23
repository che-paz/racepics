import { Skeleton } from "@/components/ui/skeleton";

export default function EventPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-4xl space-y-2 px-4 py-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div className="rounded-xl border p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-10 w-full sm:max-w-xs" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </main>
    </div>
  );
}
