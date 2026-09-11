/** Límite operativo piloto EsquiTrail / eventos ~7k–10k. */
export const MAX_PHOTOS_PER_EVENT = 10_000;

/** Fotos por archivo ZIP en exportación masiva (control de memoria en serverless). */
export const EXPORT_PHOTOS_PER_PART = 50;
