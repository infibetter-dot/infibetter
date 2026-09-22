import { Link } from "@tanstack/react-router";
import {
  LampDesk,
  Lightbulb,
  Circle,
  Home,
  Package,
  ArrowRight,
} from "lucide-react";

const collections = [
  {
    title: "Đèn bàn",
    subtitle: "24 sản phẩm",
    icon: LampDesk,
    slug: "den-ban",
  },
  {
    title: "Đèn thả",
    subtitle: "18 sản phẩm",
    icon: Lightbulb,
    slug: "den-tha",
  },
  {
    title: "Đèn tường",
    subtitle: "15 sản phẩm",
    icon: Circle,
    slug: "den-tuong",
  },
  {
    title: "Đèn đứng",
    subtitle: "12 sản phẩm",
    icon: Home,
    slug: "den-dung",
  },
  {
    title: "Đồ Nội Thất",
    subtitle: "20 sản phẩm",
    icon: Package,
    slug: "tab-dau-giuong",
  },
];

export default function Collections() {
  return (
    <section className="container-x py-10 sm:py-14 lg:py-20">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs">
          COLLECTIONS
        </p>

        <h2 className="mt-3 font-display text-3xl sm:mt-4 sm:text-4xl lg:text-5xl">
          Khám phá bộ sưu tập
        </h2>
      </div>

      {/* =====================================================
          COLLECTIONS
          MOBILE  → HORIZONTAL SLIDER
          DESKTOP → GRID
      ====================================================== */}

      <div
        className="
          mt-8
          flex
          gap-2
          overflow-x-auto
          overscroll-x-contain
          px-0.5
          pb-1
          snap-x
          snap-mandatory

          sm:mt-10
          sm:gap-3

          md:grid
          md:grid-cols-2
          md:gap-4
          md:overflow-visible
          md:px-0
          md:pb-0
          md:snap-none

          xl:grid-cols-5
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        {collections.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.slug}
              to="/shop"
              search={{ category: item.slug } as never}
              className="
                group
                relative
                flex
                min-h-[115px]
                min-w-[calc((100vw-60px)/4)]
                snap-start
                flex-col
                items-center
                justify-center
                rounded-[16px]
                border
                border-neutral-200
                bg-white
                px-1
                py-2
                text-center
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#6F8B5E]
                hover:bg-[#F7FAF5]
                hover:shadow-lg

                sm:min-h-[140px]
                sm:min-w-[160px]
                sm:rounded-2xl
                sm:px-3
                sm:py-4

                md:min-w-0
              "
            >

              {/* =================================================
                  ARROW
              ================================================== */}

              <div
                className="
                  absolute
                  right-1.5
                  top-1.5
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-400
                  transition-all
                  duration-300

                  sm:right-3
                  sm:top-3
                  sm:h-6
                  sm:w-6

                  group-hover:bg-white
                  group-hover:text-[#6F8B5E]
                "
              >
                <ArrowRight
                  size={11}
                  strokeWidth={1.5}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </div>

              {/* =================================================
                  ICON
              ================================================== */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[11px]
                  border
                  border-neutral-200
                  bg-white
                  transition-all
                  duration-300

                  sm:h-12
                  sm:w-12
                  sm:rounded-[14px]

                  group-hover:border-[#6F8B5E]
                  group-hover:bg-[#F7FAF5]
                "
              >
                <Icon
                  size={19}
                  strokeWidth={1.5}
                  className="
                    transition-transform
                    duration-300
                    group-hover:scale-110

                    sm:h-6
                    sm:w-6
                  "
                />
              </div>

              {/* =================================================
                  TITLE
              ================================================== */}

              <h3
                className="
                  mt-1.5
                  text-[11px]
                  font-medium
                  leading-tight
                  text-neutral-800

                  sm:mt-2
                  sm:text-[14px]
                "
              >
                {item.title}
              </h3>

              {/* =================================================
                  PRODUCT COUNT
              ================================================== */}

              <p
                className="
                  mt-0.5
                  text-[8px]
                  text-neutral-400

                  sm:text-[10px]
                "
              >
                {item.subtitle}
              </p>

            </Link>
          );
        })}

      </div>

    </section>
  );
}