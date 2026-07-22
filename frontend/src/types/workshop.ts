export type WorkshopMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
};

export type WorkshopLocation = {
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
  notes: string;
};

export type WorkshopSchedule = {
  date: string;
  time: string;
  spotsLeft: number;
};

export type WorkshopFormData = {
  title: string;
  category: string;
  description: string;
  highlights: string[];
  gradient: string;
  price: string;
  duration: string;
  seats: string;
  level: string;
  includes: string[];

  thumbnail: WorkshopMedia | null;
  gallery: WorkshopMedia[];
  video: WorkshopMedia | null;

  schedules: WorkshopSchedule[];
  location: WorkshopLocation;
};
