import Link from "next/link";
import { FileQuestion } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon={FileQuestion}
          title="Página no encontrada"
          description="El enlace no existe o el evento ya no está disponible."
          action={
            <Link href="/" className={cn(buttonVariants())}>
              Volver al inicio
            </Link>
          }
        />
      </div>
    </main>
  );
}
