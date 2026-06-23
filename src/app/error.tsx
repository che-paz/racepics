"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon={CircleAlert}
          variant="error"
          title="Algo salió mal"
          description={error.message || "Error inesperado en la aplicación."}
          action={
            <Button type="button" onClick={() => reset()}>
              Reintentar
            </Button>
          }
        />
      </div>
    </main>
  );
}
