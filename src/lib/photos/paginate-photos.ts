import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export type PhotoRow = {
  id: string;
  storage_path: string;
};

const PAGE_SIZE = 1000;

export async function countEventPhotos(
  admin: AdminClient,
  eventId: string
): Promise<number> {
  const { count, error } = await admin
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function fetchEventPhotosPage(
  admin: AdminClient,
  eventId: string,
  page: number,
  pageSize = PAGE_SIZE
): Promise<PhotoRow[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await admin
    .from("photos")
    .select("id, storage_path")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchAllPhotosForStatuses(
  admin: AdminClient,
  eventId: string,
  statuses: string[]
): Promise<{ id: string }[]> {
  const results: { id: string }[] = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await admin
      .from("photos")
      .select("id")
      .eq("event_id", eventId)
      .in("status", statuses)
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.length) {
      break;
    }

    results.push(...data);
    if (data.length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  return results;
}
