import { useEffect, useRef, useState } from "react";
import "@goongmaps/goong-js/dist/goong-js.css";
import goongjs, {
  type Map as GoongMap,
  type Marker as GoongMarker,
} from "@goongmaps/goong-js";

import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workshopService } from "@/services/workshopService";
import type { WorkshopLocation } from "@/types/workshop";

type Prediction = {
  description: string;
  place_id: string;
};

type Props = {
  value: WorkshopLocation;
  onChange: (value: WorkshopLocation) => void;
};

const LocationPicker = ({ value, onChange }: Props) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMap | null>(null);
  const markerRef = useRef<GoongMarker | null>(null);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  const [query, setQuery] = useState(value.address);
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const setMarker = (longitude: number, latitude: number) => {
    if (!mapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = new goongjs.Marker({
        draggable: true,
      })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);

      markerRef.current.on("dragend", () => {
        const position = markerRef.current?.getLngLat();

        if (!position) return;

        void selectCoordinates(position.lat, position.lng);
      });
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 16,
      essential: true,
    });
  };

  const selectCoordinates = async (latitude: number, longitude: number) => {
    try {
      const result = await workshopService.reverseGeocode(latitude, longitude);

      const address = result?.formatted_address ?? `${latitude}, ${longitude}`;

      const nextValue: WorkshopLocation = {
        ...valueRef.current,
        address,
        latitude,
        longitude,
        placeId: result?.place_id ?? "",
      };

      setQuery(address);
      setResults([]);
      onChangeRef.current(nextValue);
      setMarker(longitude, latitude);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;

    const longitude = value.longitude ?? 106.6297;
    const latitude = value.latitude ?? 10.8231;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [longitude, latitude],
      zoom: value.latitude ? 16 : 11,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("click", (event) => {
      void selectCoordinates(event.lngLat.lat, event.lngLat.lng);
    });

    mapRef.current = map;

    if (value.longitude !== null && value.latitude !== null) {
      setMarker(value.longitude, value.latitude);
    }

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const text = query.trim();

    if (text.length < 2) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);

        const location =
          valueRef.current.latitude !== null &&
          valueRef.current.longitude !== null
            ? `${valueRef.current.latitude},${valueRef.current.longitude}`
            : undefined;

        const predictions = await workshopService.searchPlaces(text, location);

        setResults(predictions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  const selectPlace = async (prediction: Prediction) => {
    try {
      setLoading(true);

      const detail = await workshopService.getPlaceDetail(prediction.place_id);

      const coordinates = detail?.geometry?.location;

      if (!coordinates) return;

      const nextValue: WorkshopLocation = {
        ...value,
        address: detail.formatted_address ?? prediction.description,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        placeId: detail.place_id ?? prediction.place_id,
      };

      setQuery(nextValue.address);
      setResults([]);
      onChange(nextValue);

      setMarker(coordinates.lng, coordinates.lat);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={query}
          autoComplete="off"
          placeholder="Nhập địa chỉ workshop"
          className="pl-9 pr-10"
          onChange={(event) => {
            const address = event.target.value;

            setQuery(address);

            onChange({
              ...value,
              address,
            });
          }}
        />

        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin" />
        )}

        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border bg-background p-1 shadow-xl">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => void selectPlace(result)}
                className="w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-accent"
              >
                {result.description}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="h-[360px] w-full overflow-hidden rounded-2xl border"
      />

      <Textarea
        rows={3}
        value={value.notes}
        placeholder="Ghi chú đường đi, tầng, chỗ gửi xe..."
        onChange={(event) =>
          onChange({
            ...value,
            notes: event.target.value,
          })
        }
      />
    </div>
  );
};

export default LocationPicker;
