"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseJsonResponse } from "@/lib/api/parse-json-response";

export type UploadFileStatus = "queued" | "uploading" | "done" | "error";

export type UploadFileItem = {
  id: string;
  file: File;
  status: UploadFileStatus;
  progress: number;
  error?: string;
  photoId?: string;
};

type SignedUploadResponse = {
  photoId: string;
  storagePath: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

const CONCURRENCY = 8;

function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") &&
    ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );
}

export function usePhotoUpload(eventId: string) {
  const [items, setItems] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateItem = useCallback(
    (id: string, patch: Partial<UploadFileItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const uploadSingle = useCallback(
    async (item: UploadFileItem) => {
      updateItem(item.id, { status: "uploading", progress: 10, error: undefined });

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          fileName: item.file.name,
          contentType: item.file.type,
          fileSize: item.file.size,
        }),
      });

      const payload = await parseJsonResponse<
        SignedUploadResponse & { error?: string }
      >(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Error al preparar la subida.");
      }

      updateItem(item.id, { progress: 40, photoId: payload.photoId });

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .uploadToSignedUrl(payload.storagePath, payload.token, item.file, {
          contentType: payload.contentType,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      updateItem(item.id, { status: "done", progress: 100, photoId: payload.photoId });
    },
    [eventId, updateItem]
  );

  const enqueueOcr = useCallback(async () => {
    const response = await fetch(`/api/events/${eventId}/process-pending`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await parseJsonResponse<{ error?: string }>(response);
      console.warn(
        "[upload] OCR enqueue failed:",
        payload.error ?? response.status
      );
    }
  }, [eventId]);

  const runQueue = useCallback(
    async (queue: UploadFileItem[]) => {
      setIsUploading(true);
      let index = 0;
      let successCount = 0;

      const worker = async () => {
        while (index < queue.length) {
          const current = queue[index++];
          try {
            await uploadSingle(current);
            successCount += 1;
          } catch (err) {
            updateItem(current.id, {
              status: "error",
              progress: 0,
              error:
                err instanceof Error ? err.message : "Error al subir la foto.",
            });
          }
        }
      };

      const workers = Array.from(
        { length: Math.min(CONCURRENCY, queue.length) },
        () => worker()
      );
      await Promise.all(workers);
      if (successCount > 0) {
        await enqueueOcr();
      }
      setIsUploading(false);
    },
    [uploadSingle, updateItem, enqueueOcr]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter(isImageFile);
      if (incoming.length === 0) return;

      const newItems: UploadFileItem[] = incoming.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued",
        progress: 0,
      }));

      setItems((prev) => [...prev, ...newItems]);
      void runQueue(newItems);
    },
    [runQueue]
  );

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== "done"));
  }, []);

  const doneCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const totalProgress =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce((sum, item) => sum + item.progress, 0) / items.length
        );

  return {
    items,
    isUploading,
    addFiles,
    clearCompleted,
    doneCount,
    errorCount,
    totalProgress,
  };
}
