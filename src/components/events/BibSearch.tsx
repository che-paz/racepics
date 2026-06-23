"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type BibSearchProps = {
  bibMin: number;
  bibMax: number;
  initialBib?: number | null;
};

export default function BibSearch({
  bibMin,
  bibMax,
  initialBib,
}: BibSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [bib, setBib] = useState(initialBib?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = bib.trim();
    if (!trimmed) {
      setError("Introduce tu número de dorsal.");
      return;
    }

    const num = parseInt(trimmed, 10);
    if (Number.isNaN(num)) {
      setError("Introduce un número de dorsal válido.");
      return;
    }

    if (num < bibMin || num > bibMax) {
      setError(`El dorsal debe estar entre ${bibMin} y ${bibMax}.`);
      return;
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("bib", String(num));
      params.delete("photo");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Busca tu dorsal</CardTitle>
        <CardDescription>
          Introduce tu número de bib ({bibMin}–{bibMax}) para ver tus fotos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Ej. 1234"
            value={bib}
            onChange={(event) => setBib(event.target.value)}
            min={bibMin}
            max={bibMax}
            className="sm:max-w-xs"
            aria-invalid={error ? true : undefined}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Buscando…" : "Buscar"}
          </Button>
        </form>
        {error ? (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
