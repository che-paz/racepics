import { createAdminClient } from "@/lib/supabase/admin";

export type SharePhotoContext = {
  photoId: string;
  bib: number;
  eventName: string;
  eventSlug: string;
};

export async function getSharePhotoContext({
  eventId,
  eventSlug,
  eventName,
  photoId,
  bib,
}: {
  eventId: string;
  eventSlug: string;
  eventName: string;
  photoId: string;
  bib: number;
}): Promise<SharePhotoContext | null> {
  const admin = createAdminClient();

  const { data: photo, error } = await admin
    .from("photos")
    .select(
      `
      id,
      status,
      events!inner (status),
      photo_bibs!inner (bib_number)
    `
    )
    .eq("id", photoId)
    .eq("event_id", eventId)
    .eq("status", "ready")
    .eq("photo_bibs.bib_number", bib)
    .maybeSingle();

  if (error || !photo) {
    return null;
  }

  const eventRow = photo.events;
  const event = Array.isArray(eventRow) ? eventRow[0] : eventRow;
  if (!event || event.status !== "active") {
    return null;
  }

  return {
    photoId,
    bib,
    eventName,
    eventSlug,
  };
}
