import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import banner01 from "@/assets/hero/banner01.png";
import banner02 from "@/assets/hero/banner02.png";
import banner03 from "@/assets/hero/banner03.png";
import hero1 from "@/assets/hero/hero-1.png";
import hero2 from "@/assets/hero/hero_2.png";

interface CollectionProduct {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  compare_at_price?: number | string | null;
  image_url?: string | null;
  stock?: number | null;
}

interface CollectionsProps {
  products?: CollectionProduct[];
  newArrivals?: CollectionProduct[];
}

const categoryImages = [
  banner01,
  banner02,
  banner03,
  hero1,
  hero2,
];

const collections = [
  {
    title: "Ốp iPhone",
    subtitle: "Shop iPhone Cases",
    slug: "op-dien-thoai",
  },
  {
    title: "Sạc không dây",
    subtitle: "Shop Wireless Chargers",
    slug: "sac-khong-day",
  },
  {
    title: "Pin dự phòng",
    subtitle: "Shop Power Banks",
    slug: "pin-du-phong",
  },
  {
    title: "Dây đeo Apple Watch",
    subtitle: "Shop Watch Bands",
    slug: "day-deo-apple-watch",
  },
  {
    title: "Phụ kiện iPad",
    subtitle: "Shop iPad Cases",
    slug: "phu-kien-ipad",
  },
];

const demoProductImages = [
  banner02,
  banner03,
  banner01,
  hero1,
  hero2,
];

function formatPrice(value: number | string) {
  return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
}

function ProductMiniCard({
  product,
  fallbackImage,
}: {
  product: CollectionProduct;
  fallbackImage: string;
}) {
  const price = Number(product.price);
  const comparePrice = Number(product.compare_at_price ?? 0);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="
        group relative block min-w-0 overflow-hidden
        rounded-[10px] border border-[#E5E7EB]
        bg-white transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative aspect-[1/0.92]
          overflow-hidden bg-[#F7F7F7]
        "
      >
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          className="
            h-full w-full object-contain p-3
            transition-transform duration-500
            group-hover:scale-[1.04]
          "
        />

        {/* BADGES */}
        <div className="absolute left-2 top-2 flex gap-1">
          <span
            className="
              rounded-[4px] bg-[#F1F5F9]
              px-1.5 py-1
              text-[7px] font-semibold
              text-neutral-600
            "
          >
            Phụ kiện
          </span>

          <span
            className="
              rounded-[4px] bg-[#0066E6]
              px-1.5 py-1
              text-[7px] font-semibold
              text-white
            "
          >
            Best Seller
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="px-2.5 pb-2.5 pt-2">
        <h3
          className="
            line-clamp-1
            text-[11px]
            font-semibold
            tracking-[-0.01em]
            text-[#171717]
          "
        >
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-[9px] text-neutral-400">
          Thiết kế hiện đại · tiện dụng
        </p>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-[11px] font-bold text-[#0066E6]">
            {formatPrice(price)}
          </span>

          {comparePrice > price && (
            <span className="text-[8px] text-neutral-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        <div
          className="
            mt-2 flex h-7
            items-center justify-center
            rounded-[6px]
            bg-[#0066E6]
            text-[9px] font-semibold
            text-white
            transition-colors
            group-hover:bg-[#0057C9]
          "
        >
          Xem sản phẩm

          <ArrowRight
            size={11}
            className="
              ml-1
              transition-transform
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
}

export default function Collections({
  products = [],
  newArrivals = [],
}: CollectionsProps) {
  const [activeTab, setActiveTab] = useState<"best" | "new">("best");
  const [startIndex, setStartIndex] = useState(0);

  const activeProducts =
    activeTab === "best" ? products : newArrivals;

  const visibleProducts = activeProducts.slice(
    startIndex,
    startIndex + 5,
  );

  const canGoNext =
    startIndex + 5 < activeProducts.length;

  const canGoPrev = startIndex > 0;

  const nextProducts = () => {
    if (canGoNext) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const prevProducts = () => {
    if (canGoPrev) {
      setStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const changeTab = (tab: "best" | "new") => {
    setActiveTab(tab);
    setStartIndex(0);
  };

  return (
    <section
      className="
        mx-auto w-full max-w-[1320px]
        px-4 pb-8 pt-7
        sm:px-5 sm:pt-9
        lg:px-6 lg:pb-12 lg:pt-10
      "
    >
      {/* =====================================================
          SHOP BY CATEGORY
      ====================================================== */}

      <div>
        <h2
          className="
            font-sans
            text-[28px]
            font-bold
            leading-none
            tracking-[-0.03em]
            text-[#171717]
            sm:text-[32px]
            lg:text-[34px]
          "
        >
          Shop by category
        </h2>

        <p
          className="
            mt-2
            text-[10px]
            text-neutral-500
            sm:text-[11px]
          "
        >
          Find exactly what you're looking for.
        </p>
      </div>

      {/* CATEGORY CARDS */}

      <div
        className="
          mt-4
          grid grid-cols-2 gap-2
          sm:grid-cols-3 sm:gap-3
          lg:grid-cols-5 lg:gap-3
        "
      >
        {collections.map((item, index) => (
          <Link
            key={item.slug}
            to="/shop"
            search={{ category: item.slug } as never}
            className="
              group relative
              aspect-[1.08/1]
              overflow-hidden
              rounded-[9px]
              bg-[#EDEDED]
              sm:rounded-[10px]
            "
          >
            {/* IMAGE */}

            <img
              src={categoryImages[index]}
              alt={item.title}
              className="
                absolute inset-0
                h-full w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.04]
              "
            />

            {/* GRADIENT */}

            <div
              className="
                absolute inset-0
                bg-gradient-to-t
                from-black/55
                via-black/5
                to-transparent
              "
            />

            {/* LABEL */}

            <div
              className="
                absolute
                bottom-2
                left-2
                right-2
                flex
                h-7
                items-center
                justify-between
                rounded-[7px]
                border
                border-white/60
                bg-black/25
                px-2.5
                text-white
                backdrop-blur-md
                sm:h-8
                sm:px-3
              "
            >
              <span
                className="
                  truncate
                  text-[8px]
                  font-semibold
                  sm:text-[9px]
                "
              >
                {item.subtitle}
              </span>

              <ArrowRight
                size={12}
                strokeWidth={1.7}
                className="
                  shrink-0
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </div>
          </Link>
        ))}
      </div>

      {/* =====================================================
          FIND YOUR NEXT UPGRADE
      ====================================================== */}

      <div className="mt-7 sm:mt-8">
        {/* HEADER */}

        <div className="flex items-end justify-between">
          <div>
            <h2
              className="
                font-sans
                text-[28px]
                font-bold
                leading-none
                tracking-[-0.03em]
                text-[#171717]
                sm:text-[32px]
                lg:text-[34px]
              "
            >
              Find your next upgrade
            </h2>

            <p
              className="
                mt-2
                flex
                items-center
                gap-1.5
                text-[10px]
                text-neutral-500
                sm:text-[11px]
              "
            >
              <span className="text-[12px]">✦</span>
              The products our customers love most.
            </p>
          </div>

          {/* VIEW ALL */}

          <Link
            to="/shop"
            className="
              hidden
              items-center
              gap-1
              text-[10px]
              font-semibold
              text-[#0066E6]
              sm:flex
            "
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* TABS */}

        <div
          className="
            mt-3
            flex
            items-center
            gap-1
          "
        >
          <button
            type="button"
            onClick={() => changeTab("best")}
            className={`
              h-8
              rounded-[7px]
              px-5
              text-[9px]
              font-semibold
              transition-all
              ${
                activeTab === "best"
                  ? "bg-white text-[#171717] shadow-sm ring-1 ring-[#E1E5E9]"
                  : "bg-transparent text-neutral-500"
              }
            `}
          >
            Best Sellers
          </button>

          <button
            type="button"
            onClick={() => changeTab("new")}
            className={`
              h-8
              rounded-[7px]
              px-5
              text-[9px]
              font-semibold
              transition-all
              ${
                activeTab === "new"
                  ? "bg-white text-[#171717] shadow-sm ring-1 ring-[#E1E5E9]"
                  : "bg-transparent text-neutral-500"
              }
            `}
          >
            New Arrivals
          </button>

          <Link
            to="/shop"
            className="
              ml-2
              flex
              items-center
              gap-1
              text-[9px]
              font-semibold
              text-[#0066E6]
              sm:hidden
            "
          >
            View all
            <ArrowRight size={11} />
          </Link>
        </div>

        {/* PRODUCTS */}

        <div className="relative mt-3">
          {visibleProducts.length > 0 ? (
            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-3
                sm:gap-3
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {visibleProducts.map((product, index) => (
                <ProductMiniCard
                  key={product.id}
                  product={product}
                  fallbackImage={
                    demoProductImages[
                      index % demoProductImages.length
                    ]
                  }
                />
              ))}
            </div>
          ) : (
            <div
              className="
                flex
                min-h-[180px]
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-neutral-200
                bg-neutral-50
                text-[11px]
                text-neutral-400
              "
            >
              Chưa có sản phẩm.
            </div>
          )}

          {/* DESKTOP ARROWS */}

          {activeProducts.length > 5 && (
            <div
              className="
                absolute
                -bottom-11
                right-0
                hidden
                items-center
                gap-1
                lg:flex
              "
            >
              <span
                className="
                  mr-2
                  text-[9px]
                  text-neutral-400
                "
              >
                {Math.min(
                  startIndex + 1,
                  activeProducts.length,
                )}
                –
                {Math.min(
                  startIndex + 5,
                  activeProducts.length,
                )}{" "}
                / {activeProducts.length}
              </span>

              <button
                type="button"
                onClick={prevProducts}
                disabled={!canGoPrev}
                aria-label="Sản phẩm trước"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  text-neutral-500
                  transition-all
                  hover:bg-neutral-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                onClick={nextProducts}
                disabled={!canGoNext}
                aria-label="Sản phẩm tiếp theo"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  text-neutral-700
                  transition-all
                  hover:bg-neutral-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}