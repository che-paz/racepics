"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/events/slug";
import type { Event } from "@/types/database";
import {
  createEvent,
  updateEvent,
  updateBibReferencePath,
  type EventFormState,
} from "@/app/(dashboard)/organizer/events/actions";

type EventFormProps = {
  mode: "create" | "edit";
  event?: Event;
};

async function uploadBibReference(eventId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${eventId}/bib-reference.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("events")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return path;
}

export default function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slugPreview, setSlugPreview] = useState(event?.slug ?? "");
  const [bibFile, setBibFile] = useState<File | null>(null);

  const handleNameChange = (name: string) => {
    if (mode === "create") {
      setSlugPreview(slugify(name) || "");
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      let result: EventFormState;

      if (mode === "create") {
        result = await createEvent({}, formData);
      } else if (event) {
        result = await updateEvent(event.id, {}, formData);
      } else {
        setError("Evento no encontrado.");
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      const eventId = result.eventId ?? event?.id;
      if (bibFile && eventId) {
        try {
          const path = await uploadBibReference(eventId, bibFile);
          const pathResult = await updateBibReferencePath(eventId, path);
          if (pathResult.error) {
            setError(pathResult.error);
            return;
          }
        } catch (uploadErr) {
          setError(
            uploadErr instanceof Error
              ? uploadErr.message
              : "Error al subir imagen de referencia."
          );
          return;
        }
      }

      if (mode === "create") {
        router.push("/organizer/events");
        router.refresh();
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nuevo evento" : "Editar evento"}
        </CardTitle>
        <CardDescription>
          Configura el nombre, rango de dorsales y opcionalmente una imagen de
          referencia del bib.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del evento
            </label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={event?.name ?? ""}
              placeholder="Maratón Valencia 2025"
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug (URL pública)
            </label>
            <Input
              id="slug"
              name="slug"
              defaultValue={event?.slug ?? slugPreview}
              placeholder="maraton-valencia-2025"
              onChange={(e) => setSlugPreview(e.target.value)}
            />
            {mode === "create" && slugPreview && (
              <p className="text-xs text-muted-foreground">
                Vista previa: /e/{slugPreview}
                {" "}(se ajustará si ya existe)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Fecha
            </label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={event?.date ?? ""}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Estado del evento
            </label>
            <select
              id="status"
              name="status"
              defaultValue={event?.status ?? "draft"}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="draft">Borrador (solo organizador)</option>
              <option value="active">Activo (público en /e/slug)</option>
              <option value="archived">Archivado</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Los corredores solo pueden buscar fotos cuando el evento está activo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bib_min" className="text-sm font-medium">
                Dorsal mínimo
              </label>
              <Input
                id="bib_min"
                name="bib_min"
                type="number"
                required
                min={1}
                defaultValue={event?.bib_min ?? 1}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bib_max" className="text-sm font-medium">
                Dorsal máximo
              </label>
              <Input
                id="bib_max"
                name="bib_max"
                type="number"
                required
                min={1}
                defaultValue={event?.bib_max ?? 9999}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bib_reference" className="text-sm font-medium">
              Imagen de referencia del dorsal (opcional)
            </label>
            <Input
              id="bib_reference"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setBibFile(e.target.files?.[0] ?? null)}
            />
            {event?.bib_reference_path && (
              <p className="text-xs text-muted-foreground">
                Referencia actual: {event.bib_reference_path}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600" role="status">
              Evento guardado correctamente.
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Guardando…"
                : mode === "create"
                  ? "Crear evento"
                  : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/organizer/events")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
