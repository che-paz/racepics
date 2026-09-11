/**
 * Branding por slug para páginas públicas `/e/[slug]`.
 * Solo pilotos con look custom; el resto usa UI RacePics por defecto.
 */

export type EventBrand = {
  slug: string;
  /** Texto watermark en descarga / OG (no mostrar duplicado en UI si hay logo). */
  watermark: string;
  logoSrc: string;
  logoAlt: string;
  /** Subtítulo bajo el logo (lugar / fecha). Sin repetir el nombre del evento. */
  tagline: string;
  /** Clase CSS del wrapper (data-brand / theme). */
  themeClass: string;
};

const BRANDS: Record<string, EventBrand> = {
  "montecristo-2026": {
    slug: "montecristo-2026",
    watermark: "Montecristo 2026 - Esquitrail",
    logoSrc: "/brands/montecristo-2026/logo.png",
    logoAlt: "Trail Run Montecristo Esquipulas",
    tagline: "27 de septiembre 2026 · Parque Chatún, Esquipulas",
    themeClass: "brand-montecristo",
  },
};

export function getEventBrand(slug: string): EventBrand | null {
  return BRANDS[slug] ?? null;
}

export function watermarkForEventSlug(
  slug: string | null | undefined,
  fallback = "RacePics"
): string {
  if (!slug) return fallback;
  return getEventBrand(slug)?.watermark ?? fallback;
}
