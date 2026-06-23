"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EventPublicLinkProps = {
  slug: string;
  fullUrl: string;
  isActive: boolean;
};

export default function EventPublicLink({
  slug,
  fullUrl,
  isActive,
}: EventPublicLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Link para buscar fotos</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Comparte este enlace con los corredores para que busquen su dorsal.
          </p>
        </div>
        {!isActive ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            No publicado
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 text-xs sm:text-sm">
          {fullUrl}
        </code>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 sm:flex-none"
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Link
            href={`/e/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex-1 sm:flex-none"
            )}
          >
            <ExternalLink />
            Abrir
          </Link>
        </div>
      </div>

      {!isActive ? (
        <p className="mt-2 text-xs text-amber-700">
          Activa el evento en Editar para publicar el enlace a corredores.
        </p>
      ) : null}
    </div>
  );
}
