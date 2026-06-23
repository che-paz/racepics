import type { PhotoProcessingStats } from "@/lib/photos/processing-stats";

type PhotoStatusSummaryProps = {
  stats: PhotoProcessingStats;
  compact?: boolean;
};

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "muted" | "warning" | "info" | "success" | "danger";
}) {
  const toneClasses: Record<typeof tone, string> = {
    muted: "bg-muted text-muted-foreground",
    warning: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
    info: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
    success: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100",
    danger: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export default function PhotoStatusSummary({
  stats,
  compact = false,
}: PhotoStatusSummaryProps) {
  if (stats.total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin fotos subidas aún.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        <StatusPill label="Pendientes" value={stats.counts.pending} tone="warning" />
        <StatusPill
          label="Procesando"
          value={stats.counts.processing}
          tone="info"
        />
        <StatusPill label="Listas" value={stats.counts.ready} tone="success" />
        <StatusPill label="Fallidas" value={stats.counts.failed} tone="danger" />
      </div>
      {!compact && stats.accuracyPercent !== null && (
        <p className="text-sm text-muted-foreground">
          OCR: {stats.readyWithBibs}/{stats.counts.ready} fotos listas con dorsal
          detectado ({stats.accuracyPercent}%)
        </p>
      )}
    </div>
  );
}
