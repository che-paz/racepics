import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";

export type GalleryPhoto = {
  id: string;
  storagePath: string;
  thumbUrl: string;
  uploadedAt: string;
};

const SIGNED_URL_EXPIRY = 3600;

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchPhotosByBib(
  eventId: string,
  bibNumber: number
): Promise<GalleryPhoto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select(
      `
      id,
      storage_path,
      uploaded_at,
      photo_bibs!inner (bib_number)
    `
    )
    .eq("event_id", eventId)
    .eq("status", "ready")
    .eq("photo_bibs.bib_number", bibNumber);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return [];
  }

  const admin = createAdminClient();
  const photos: GalleryPhoto[] = [];

  for (const row of data) {
    const { data: signed, error: signedError } = await admin.storage
      .from("photos")
      .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY);

    if (signedError || !signed) {
      continue;
    }

    photos.push({
      id: row.id,
      storagePath: row.storage_path,
      thumbUrl: signed.signedUrl,
      uploadedAt: row.uploaded_at,
    });
  }

  photos.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return photos;
}
