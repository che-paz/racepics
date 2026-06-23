import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PhotoStatus } from "@/types/database";

export type PhotoStatusCounts = Record<PhotoStatus, number>;

export type PhotoProcessingStats = {
  counts: PhotoStatusCounts;
  total: number;
  readyWithBibs: number;
  accuracyPercent: number | null;
};

const EMPTY_COUNTS: PhotoStatusCounts = {
  pending: 0,
  processing: 0,
  ready: 0,
  failed: 0,
};

type StatsRow = {
  pending: number;
  processing: number;
  ready: number;
  failed: number;
  total: number;
  ready_with_bibs: number;
};

export async function getPhotoProcessingStats(
  eventId: string
): Promise<PhotoProcessingStats> {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_photo_processing_stats", {
    p_event_id: eventId,
  });

  if (error || !data) {
    return {
      counts: { ...EMPTY_COUNTS },
      total: 0,
      readyWithBibs: 0,
      accuracyPercent: null,
    };
  }

  const row = data as StatsRow;
  const counts: PhotoStatusCounts = {
    pending: row.pending ?? 0,
    processing: row.processing ?? 0,
    ready: row.ready ?? 0,
    failed: row.failed ?? 0,
  };

  const readyWithBibs = row.ready_with_bibs ?? 0;
  const accuracyPercent =
    counts.ready > 0
      ? Math.round((readyWithBibs / counts.ready) * 100)
      : null;

  return {
    counts,
    total: row.total ?? 0,
    readyWithBibs,
    accuracyPercent,
  };
}
