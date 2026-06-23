export type UserRole = "organizer" | "photographer";

export type EventStatus = "draft" | "active" | "archived";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  organizer_id: string;
  name: string;
  slug: string;
  date: string | null;
  status: EventStatus;
  bib_min: number;
  bib_max: number;
  bib_reference_path: string | null;
  created_at: string;
};

export type EventPhotographer = {
  event_id: string;
  photographer_id: string;
  invited_at: string;
};

export type PhotoStatus = "pending" | "processing" | "ready" | "failed";

export type Photo = {
  id: string;
  event_id: string;
  photographer_id: string;
  storage_path: string;
  status: PhotoStatus;
  uploaded_at: string;
};

export type PhotoBib = {
  photo_id: string;
  bib_number: number;
  created_at: string;
};
