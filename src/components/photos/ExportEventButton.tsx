"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseJsonResponse } from "@/lib/api/parse-json-response";
import { EXPORT_PHOTOS_PER_PART } from "@/lib/photos/event-limits";

type ExportPart = {
  part: number;
  path: string;
  photoCount: number;
  sizeBytes: number;
  downloadUrl?: string;
};

type ExportStatus = {
  id: string;
  status: "pending" | "processing" | "ready" | "failed";
  totalPhotos: number;
  parts: ExportPart[];
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

type ExportEventButtonProps = {
  eventId: string;
  photoCount: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExportEventButton({
  eventId,
  photoCount,
}: ExportEventButtonProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const response = await fetch(`/api/events/${eventId}/export`);
    const payload = await parseJsonResponse<{ export: ExportStatus | null }>(
      response
    );

    if (!response.ok) {
      return;
    }

    setExportStatus(payload.export);
  }, [eventId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (
      exportStatus?.status !== "pending" &&
      exportStatus?.status !== "processing"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadStatus();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [exportStatus?.status, loadStatus]);

  async function handleStartExport() {
    setIsStarting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/export`, {
        method: "POST",
      });
      const payload = await parseJsonResponse<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo iniciar la exportación.");
      }

      setMessage(
        "Exportación iniciada. Se generarán archivos ZIP en lotes para descargar al disco local."
      );
      await loadStatus();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Error al iniciar exportación."
      );
    } finally {
      setIsStarting(false);
    }
  }

  const isRunning =
    exportStatus?.status === "pending" || exportStatus?.status === "processing";
  const estimatedParts = Math.ceil(photoCount / EXPORT_PHOTOS_PER_PART);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <Package className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Exportar fotos al disco local</p>
          <p className="text-xs text-muted-foreground">
            Genera ZIPs con las fotos originales ({EXPORT_PHOTOS_PER_PART} por
            archivo, ~{estimatedParts} partes para {photoCount.toLocaleString("es-ES")}{" "}
            fotos). Descárgalos y archívalos para liberar almacenamiento en
            RacePics.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStartExport}
          disabled={isStarting || isRunning || photoCount === 0}
        >
          {isStarting || isRunning ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Download />
          )}
          {isRunning ? "Generando exportación…" : "Exportar todas las fotos"}
        </Button>
        {exportStatus ? (
          <span className="text-xs text-muted-foreground">
            Estado: {exportStatus.status}
            {exportStatus.status === "ready"
              ? ` · ${exportStatus.parts.length} archivo(s)`
              : null}
          </span>
        ) : null}
      </div>

      {exportStatus?.status === "failed" ? (
        <p className="text-sm text-destructive">
          {exportStatus.errorMessage ?? "La exportación falló."}
        </p>
      ) : null}

      {exportStatus?.status === "ready" && exportStatus.parts.length > 0 ? (
        <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
          {exportStatus.parts.map((part) => (
            <li
              key={part.path}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <span>
                Parte {part.part} · {part.photoCount} fotos ·{" "}
                {formatBytes(part.sizeBytes)}
              </span>
              {part.downloadUrl ? (
                <a
                  href={part.downloadUrl}
                  download
                  className="shrink-0 text-primary underline-offset-4 hover:underline"
                >
                  Descargar ZIP
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
