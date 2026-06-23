"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  eventId: string;
  eventName: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ eventId, eventName }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    items,
    isUploading,
    addFiles,
    clearCompleted,
    doneCount,
    errorCount,
    totalProgress,
  } = usePhotoUpload(eventId);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      addFiles(files);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subir fotos</h1>
        <p className="text-muted-foreground">{eventName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arrastra tus fotos aquí</CardTitle>
          <CardDescription>
            JPG, PNG o WebP · máx. 20 MB por archivo · hasta 5.000 fotos por evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              Arrastra fotos o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Puedes subir lotes grandes (500+ fotos). El OCR se encola al terminar cada lote.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {doneCount} de {items.length} subidas
                  {errorCount > 0 && (
                    <span className="text-destructive"> · {errorCount} error(es)</span>
                  )}
                </span>
                {doneCount > 0 && !isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCompleted}
                  >
                    Limpiar completadas
                  </Button>
                )}
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>

              <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <span className="truncate">{item.file.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatFileSize(item.file.size)}
                      {" · "}
                      {item.status === "done" && (
                        <span className="text-green-600">✓ subida</span>
                      )}
                      {item.status === "uploading" && "Subiendo…"}
                      {item.status === "queued" && "En cola"}
                      {item.status === "error" && (
                        <span className="text-destructive" title={item.error}>
                          Error
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
