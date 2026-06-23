import type { Metadata } from "next";

const APP_NAME = "RacePics";
const DEFAULT_DESCRIPTION =
  "Encuentra tus fotos de carrera en segundos. Busca tu dorsal y descarga tus imágenes con watermark.";

function appUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3002";
  return `${base}${path}`;
}

export function createPublicMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  imageUrl,
}: {
  title: string;
  description?: string;
  path?: string;
  imageUrl?: string;
}): Metadata {
  const url = appUrl(path);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      locale: "es_ES",
      type: "website",
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export { APP_NAME, DEFAULT_DESCRIPTION, appUrl };
