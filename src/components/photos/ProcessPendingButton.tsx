"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseJsonResponse } from "@/lib/api/parse-json-response";

type ProcessPendingButtonProps = {
  eventId: string;
  pendingCount: number;
  reprocessCount: number;
};

export default function ProcessPendingButton({
  eventId,
  pendingCount,
  reprocessCount,
}: ProcessPendingButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const total = pendingCount + reprocessCount;
  if (total === 0) {
    return null;
  }

  async function handleClick() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/process-pending`, {
        method: "POST",
      });
      const payload = await parseJsonResponse<{
        error?: string;
        enqueued?: number;
      }>(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo encolar el procesamiento.");
      }

      const enqueued = payload.enqueued ?? 0;
      if (enqueued > 0) {
        setMessage(`Encoladas ${enqueued} fotos para OCR. Actualizando contadores…`);
        router.refresh();
        window.setTimeout(() => router.refresh(), 5000);
        window.setTimeout(() => router.refresh(), 15000);
      } else {
        setMessage(
          "No hay fotos pendientes por encolar. Recargando estado desde la base de datos…"
        );
        router.refresh();
      }
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : "Error al encolar procesamiento.";
      const message = raw.includes("fetch failed")
        ? "No se pudo conectar con el servidor. ¿Está corriendo npm run dev y npm run inngest:dev?"
        : raw;
      setMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading
          ? "Encolando..."
          : `Procesar ${total} foto${total === 1 ? "" : "s"}`}
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
