export function buildPhotoShareUrl({
  slug,
  bib,
  photoId,
  origin,
}: {
  slug: string;
  bib: number;
  photoId: string;
  origin: string;
}): string {
  const url = new URL(`/e/${slug}`, origin);
  url.searchParams.set("bib", String(bib));
  url.searchParams.set("photo", photoId);
  return url.toString();
}

export function buildPhotoShareText(eventName: string): string {
  return `Mis fotos de ${eventName}`;
}

export function buildWhatsAppShareUrl(shareUrl: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
}

export function buildFacebookShareUrl(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function buildTwitterShareUrl(shareUrl: string, text: string): string {
  const params = new URLSearchParams({
    text,
    url: shareUrl,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function openSharePopup(url: string, onBeforeOpen?: () => void): void {
  onBeforeOpen?.();

  // Dejar que el modal de la foto se cierre antes de abrir la ventana externa.
  window.setTimeout(() => {
    const popup = window.open(
      url,
      "racepics-share",
      "popup=yes,width=720,height=640,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes"
    );

    if (popup) {
      popup.focus();
      return;
    }

    // Fallback si el navegador bloquea popups.
    window.open(url, "_blank");
  }, 0);
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareNative({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }
    return false;
  }
}
