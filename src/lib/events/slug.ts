/** Slugify event name for URL-safe unique slugs. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Append numeric suffix until slug is unique among existing slugs. */
export function ensureUniqueSlug(base: string, existing: string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;

  let i = 2;
  while (taken.has(`${base}-${i}`)) {
    i += 1;
  }
  return `${base}-${i}`;
}
