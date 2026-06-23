"use client";

import { Download, ImageOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/lib/photos/bib-search";
import PhotoShareButtons from "@/components/photos/PhotoShareButtons";

type PhotoGridProps = {
  photos: GalleryPhoto[];
  bib: number;
  eventSlug: string;
  eventName: string;
  initialPhotoId?: string | null;
};

export default function PhotoGrid({
  photos,
  bib,
  eventSlug,
  eventName,
  initialPhotoId,
}: PhotoGridProps) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    if (!initialPhotoId) {
      return;
    }
    const match = photos.find((photo) => photo.id === initialPhotoId);
    if (match) {
      setSelected(match);
    }
  }, [initialPhotoId, photos]);

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title={`No hay fotos para el dorsal ${bib}`}
        description="Comprueba el número o vuelve más tarde cuando se procesen más fotos."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {photos.length} foto{photos.length === 1 ? "" : "s"} encontrada
        {photos.length === 1 ? "" : "s"}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelected(photo)}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-foreground/10 transition hover:ring-foreground/30"
          >
            <Image
              src={photo.thumbUrl}
              alt={`Foto dorsal ${bib}`}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90dvh,720px)] max-w-3xl flex-col gap-3 overflow-hidden p-4 sm:max-w-3xl">
          {selected ? (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle>Dorsal {bib}</DialogTitle>
              </DialogHeader>
              <div className="relative mx-auto h-[min(38vh,18rem)] w-full shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={selected.thumbUrl}
                  alt={`Foto dorsal ${bib}`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <div className="min-h-0 space-y-3 overflow-y-auto">
                <PhotoShareButtons
                  eventSlug={eventSlug}
                  eventName={eventName}
                  bib={bib}
                  photoId={selected.id}
                />
              </div>
              <div className="flex shrink-0 justify-end border-t pt-3">
                <a
                  href={`/api/photos/${selected.id}/download?bib=${bib}`}
                  download
                  className={buttonVariants()}
                >
                  <Download />
                  Descargar
                </a>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
