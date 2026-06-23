import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "racepics" });

export type PhotoUploadedEvent = {
  name: "photo/uploaded";
  data: {
    photoId: string;
    eventId: string;
  };
};

export type EventExportRequestedEvent = {
  name: "event/export.requested";
  data: {
    exportId: string;
    eventId: string;
  };
};
