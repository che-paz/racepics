"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  buildFacebookShareUrl,
  buildPhotoShareText,
  buildPhotoShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  canUseNativeShare,
  shareNative,
} from "@/lib/photos/share";

type PhotoShareButtonsProps = {
  eventSlug: string;
  eventName: string;
  bib: number;
  photoId: string;
};

export default function PhotoShareButtons({
  eventSlug,
  eventName,
  bib,
  photoId,
}: PhotoShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [nativeShareAvailable] = useState(canUseNativeShare);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const shareUrl = buildPhotoShareUrl({
    slug: eventSlug,
    bib,
    photoId,
    origin,
  });
  const shareText = buildPhotoShareText(eventName, bib);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este enlace:", shareUrl);
    }
  };

  const handleNativeShare = async () => {
    await shareNative({
      title: `${eventName} — dorsal ${bib}`,
      text: shareText,
      url: shareUrl,
    });
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-sm font-medium">Compartir</p>
      <p className="text-xs text-muted-foreground">
        Enlace directo a esta foto. Para Instagram, descarga la imagen y publícala desde la app.
      </p>
      <div className="flex flex-wrap gap-2">
        {nativeShareAvailable ? (
          <Button type="button" variant="outline" size="sm" onClick={handleNativeShare}>
            <Share2 />
            Compartir
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openShareWindow(buildWhatsAppShareUrl(shareUrl, shareText))}
        >
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openShareWindow(buildFacebookShareUrl(shareUrl))}
        >
          Facebook
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openShareWindow(buildTwitterShareUrl(shareUrl, shareText))}
        >
          X
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check /> : <Link2 />}
          {copied ? "Copiado" : "Copiar enlace"}
        </Button>
      </div>
    </div>
  );
}
