import Link from "next/link";
import { Search } from "lucide-react";

export default function RunnerHint() {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-sm">
      <div className="flex gap-3">
        <Search
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-1">
          <p className="font-medium">¿Buscas tus fotos de carrera?</p>
          <p className="text-muted-foreground">
            No necesitas iniciar sesión. El organizador te envía un enlace como{" "}
            <code className="rounded bg-background px-1 py-0.5 text-xs">
              /e/nombre-carrera
            </code>
            , introduces tu dorsal y descargas tus fotos.
          </p>
          <p className="pt-1">
            <Link
              href="/#corredores"
              className="text-primary underline-offset-4 hover:underline"
            >
              Más información para corredores
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
