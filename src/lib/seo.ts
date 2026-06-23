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
}: {
  title: string;
  description?: string;
  path?: string;
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export { APP_NAME, DEFAULT_DESCRIPTION, appUrl };
