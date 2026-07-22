import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import ThumbnailSlider, {
  type ProductMedia,
} from "@/components/thumnailslider";
import BookingCard, {
  type BookingData,
  type BookingSession,
} from "@/components/BookingCard";
import WorkshopContent from "@/components/WorkshopContent";
import WorkshopMap, { type WorkshopLocation } from "@/components/workshopmap";

import { workshopService } from "@/services/workshopService";

type WorkshopMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
};

type WorkshopSchedule = {
  _id?: string;
  date: string;
  time: string;
  spotsLeft: number;
};

type WorkshopDetailData = {
  _id: string;
  title: string;
  category: string;
  description: string;
  highlights: string[];
  includes: string[];

  thumbnail: WorkshopMedia | null;
  gallery: WorkshopMedia[];
  video: WorkshopMedia | null;

  price: number;
  duration: string;
  seatsTotal: number;
  level: string;

  schedules: WorkshopSchedule[];

  location: {
    address: string;
    notes?: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  host?: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  };
};

export function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();

  const [workshop, setWorkshop] = useState<WorkshopDetailData | null>(null);
  const [nearbyWorkshops, setNearbyWorkshops] = useState<WorkshopDetailData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  // const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy mã workshop");
      setLoading(false);
      return;
    }

    const loadWorkshop = async () => {
      try {
        setLoading(true);
        setError(null);

        const workshopData = await workshopService.getWorkshop(id);

        setWorkshop(workshopData);

        const longitude = workshopData.location?.coordinates?.coordinates?.[0];

        const latitude = workshopData.location?.coordinates?.coordinates?.[1];

        if (typeof longitude === "number" && typeof latitude === "number") {
          try {
            const nearby = await workshopService.getNearbyWorkshops({
              longitude,
              latitude,
              distance: 10_000,
              excludeId: workshopData._id,
            });

            setNearbyWorkshops(nearby);
          } catch (nearbyError) {
            console.error("Không thể tải workshop gần đây:", nearbyError);
          }
        }
      } catch (loadError) {
        console.error("Load workshop error:", loadError);
        setError("Không thể tải thông tin workshop");
      } finally {
        setLoading(false);
      }
    };

    void loadWorkshop();
  }, [id]);

  const media = useMemo<ProductMedia[]>(() => {
    if (!workshop) return [];

    const result: ProductMedia[] = [];

    if (workshop.thumbnail?.url) {
      result.push({
        id: workshop.thumbnail.publicId,
        type: "image",
        src: workshop.thumbnail.url,
        alt: workshop.title,
      });
    }

    workshop.gallery?.forEach((item, index) => {
      result.push({
        id: item.publicId || `gallery-${index}`,
        type: "image",
        src: item.url,
        alt: `${workshop.title} - hình ${index + 1}`,
      });
    });

    if (workshop.video?.url) {
      result.push({
        id: workshop.video.publicId,
        type: "video",
        src: workshop.video.url,
        poster: workshop.thumbnail?.url ?? "",
        alt: `Video giới thiệu ${workshop.title}`,
        // controls: true,
        autoPlay: false,
        muted: false,
        loop: false,
      });
    }

    return result;
  }, [workshop]);

  const sessions = useMemo<BookingSession[]>(() => {
    if (!workshop) return [];

    return workshop.schedules.map((session, index) => ({
      id: session._id ?? `${session.date}-${session.time}-${index}`,
      date: session.date,
      time: session.time,
      remaining: session.spotsLeft,
    }));
  }, [workshop]);

  const currentWorkshop = useMemo<WorkshopLocation | null>(() => {
    if (!workshop) return null;

    const [longitude, latitude] = workshop.location.coordinates.coordinates;

    return {
      id: workshop._id,
      title: workshop.title,
      address: workshop.location.address,
      latitude,
      longitude,
      image: workshop.thumbnail?.url ?? "",
      price: workshop.price,
    };
  }, [workshop]);

  const nearbyMapData = useMemo<WorkshopLocation[]>(() => {
    return nearbyWorkshops
      .filter(
        (item) =>
          Array.isArray(item.location?.coordinates?.coordinates) &&
          item.location.coordinates.coordinates.length === 2,
      )
      .map((item) => {
        const [longitude, latitude] = item.location.coordinates.coordinates;

        return {
          id: item._id,
          title: item.title,
          address: item.location.address,
          latitude,
          longitude,
          image: item.thumbnail?.url ?? "",
          price: item.price,
        };
      });
  }, [nearbyWorkshops]);

  const handleBook = async (bookingData: BookingData) => {
    if (!workshop) return;

    try {
      // setBooking(true);

      await workshopService.createBooking({
        workshopId: workshop._id,
        sessionId: String(bookingData.session),
        quantity: bookingData.quantity,
      });

      toast.success("Đặt chỗ thành công");
    } catch (bookingError) {
      console.error("Booking error:", bookingError);
      toast.error("Không thể đặt chỗ");
    } finally {
      // setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy workshop</h1>

          <p className="mt-2 text-muted-foreground">
            {error ?? "Workshop không tồn tại hoặc đã bị xóa."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {media.length > 0 && <ThumbnailSlider media={media} />}

          <section className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {workshop.category}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-sm">
                {workshop.level}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {workshop.title}
            </h1>

            {workshop.host && (
              <div className="mt-4 flex items-center gap-3">
                {workshop.host.avatarUrl ? (
                  <img
                    src={workshop.host.avatarUrl}
                    alt={workshop.host.displayName}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                    {workshop.host.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Được tổ chức bởi
                  </p>

                  <p className="font-medium">{workshop.host.displayName}</p>
                </div>
              </div>
            )}

            <div className="mt-8 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {workshop.description}
            </div>
          </section>

          <WorkshopContent
            // content={{
            //   highlights: workshop.highlights,
            //   includes: workshop.includes,
            //   duration: workshop.duration,
            //   level: workshop.level,
            //   seatsTotal: workshop.seatsTotal,
            // }}
            content={"demo"}
          />

          {currentWorkshop && (
            <section className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-semibold">Vị trí workshop</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {workshop.location.address}
              </p>

              {workshop.location.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ghi chú: {workshop.location.notes}
                </p>
              )}

              <WorkshopMap
                currentWorkshop={currentWorkshop}
                nearbyWorkshops={nearbyMapData}
                className="mt-5"
                onWorkshopClick={(selectedWorkshop) => {
                  window.location.href = `/workshops/${selectedWorkshop.id}`;
                }}
              />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <BookingCard
            className="h-fit"
            pricePerPerson={workshop.price}
            sessions={sessions}
            taxRate={0.08}
            location={workshop.location.address}
            onBook={handleBook}
            // disabled={booking}
          />
        </aside>
      </div>
    </main>
  );
}
