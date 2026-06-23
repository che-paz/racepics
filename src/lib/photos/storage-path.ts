const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function extensionFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg";
}

export function buildPhotoStoragePath(
  eventId: string,
  photoId: string,
  fileName: string
): string {
  const ext = extensionFromFileName(fileName);
  return `${eventId}/original/${photoId}.${ext}`;
}

export function contentTypeFromFileName(fileName: string): string {
  const ext = extensionFromFileName(fileName);
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}
