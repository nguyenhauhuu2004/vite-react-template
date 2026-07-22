import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import WorkshopCard from "@/components/WorkshopCard";
import { workshopService } from "@/services/workshopService";
import { CATEGORIES } from "@/data";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type WorkshopListItem = {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  level: string;
  duration: string;

  thumbnail?: {
    url: string;
    publicId: string;
    resourceType: "image";
  };

  host?: {
    displayName: string;
    avatarUrl?: string;
  };

  location: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };
};

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

const ADDRESS_OPTIONS = [
  "Quận 1, TP. Hồ Chí Minh",
  "Quận 3, TP. Hồ Chí Minh",
  "Quận 7, TP. Hồ Chí Minh",
  "Quận Bình Thạnh, TP. Hồ Chí Minh",
  "Thành phố Thủ Đức, TP. Hồ Chí Minh",
] as const;

export function WorkshopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [workshops, setWorkshops] = useState<WorkshopListItem[]>([]);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const [category, setCategory] = useState(
    searchParams.get("category") ?? "All",
  );

  const [priceMax, setPriceMax] = useState(
    Number(searchParams.get("maxPrice")) || 2_000_000,
  );

  const [level, setLevel] = useState(searchParams.get("level") ?? "All");

  const [address, setAddress] = useState(searchParams.get("address") ?? "");

  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", ...CATEGORIES.map((item) => item.name)];

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);

        const query = {
          search: search.trim() || undefined,

          category: category === "All" ? undefined : category,

          maxPrice: priceMax,

          level: level === "All" ? undefined : level,

          address: address || undefined,
        };

        const data = await workshopService.getWorkshops(query);

        setWorkshops(data.workshops ?? []);
        setTotal(data.total ?? 0);

        const nextParams: Record<string, string> = {};

        if (search.trim()) {
          nextParams.search = search.trim();
        }

        if (category !== "All") {
          nextParams.category = category;
        }

        if (priceMax < 2_000_000) {
          nextParams.maxPrice = String(priceMax);
        }

        if (level !== "All") {
          nextParams.level = level;
        }

        if (address) {
          nextParams.address = address;
        }

        setSearchParams(nextParams, {
          replace: true,
        });
      } catch (error) {
        console.error("Không thể tải workshop:", error);

        toast.error("Không thể tải danh sách workshop");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search, category, priceMax, level, address, setSearchParams]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPriceMax(2_000_000);
    setLevel("All");
    setAddress("");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] pt-16">
      <section className="relative overflow-hidden bg-[#0D0D1A] px-4 py-16 sm:px-6">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 size-96 rounded-full bg-violet-900/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-64 rounded-full bg-fuchsia-900/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-4 text-4xl font-black text-white md:text-6xl"
          >
            Khám phá <span className="text-[#7C3AED]">workshop</span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="mb-8 text-lg text-gray-400"
          >
            Tìm kiếm những trải nghiệm sáng tạo phù hợp với bạn.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="relative mx-auto max-w-2xl"
          >
            <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm workshop, người hướng dẫn..."
              className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-12 text-white outline-none backdrop-blur-md transition-colors placeholder:text-gray-500 focus:border-violet-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-violet-400 hover:text-violet-600"
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc
          </button>

          {categories.map((item) => (
            <motion.button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className={
                category === item
                  ? "rounded-full bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-200"
                  : "rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-violet-300"
              }
            >
              {item}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="mb-8 overflow-visible"
            >
              <div className="grid grid-cols-1 gap-6 rounded-3xl border border-gray-100 bg-white p-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Giá tối đa: {priceMax.toLocaleString("vi-VN")}đ
                  </label>

                  <input
                    type="range"
                    min={0}
                    max={2_000_000}
                    step={50_000}
                    value={priceMax}
                    onChange={(event) =>
                      setPriceMax(Number(event.target.value))
                    }
                    className="w-full accent-violet-600"
                  />

                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>0đ</span>
                    <span>2.000.000đ</span>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Cấp độ
                  </label>

                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-violet-500"
                  >
                    {LEVELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Địa chỉ
                  </label>

                  <Combobox
                    items={ADDRESS_OPTIONS}
                    value={address || null}
                    onValueChange={(value) => setAddress(value ?? "")}
                  >
                    <ComboboxInput placeholder="Chọn khu vực" />

                    <ComboboxContent>
                      <ComboboxEmpty>Không tìm thấy khu vực.</ComboboxEmpty>

                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-red-500"
                  >
                    <X className="size-4" />
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mb-8 text-sm text-gray-400">
          Tìm thấy <span className="font-semibold text-[#0D0D1A]">{total}</span>{" "}
          workshop
          {category !== "All" && (
            <span className="ml-1">
              trong danh mục{" "}
              <span className="font-semibold text-[#7C3AED]">{category}</span>
            </span>
          )}
        </p>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-violet-600" />
          </div>
        ) : workshops.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-5xl">🔍</p>

            <h3 className="mb-2 text-xl font-bold text-[#0D0D1A]">
              Không tìm thấy workshop
            </h3>

            <p className="mb-6 text-gray-400">
              Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full bg-[#7C3AED] px-6 py-3 font-semibold text-white"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workshops.map((workshop, index) => (
              <motion.div
                key={workshop._id}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.3),
                }}
              >
                <WorkshopCard workshop={workshop} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
