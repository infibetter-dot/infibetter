import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

import banner01 from "@/assets/hero/iphonecase.png";
import banner02 from "@/assets/hero/wireless charger.png";
import banner03 from "@/assets/hero/powerbank.png";
import hero1 from "@/assets/hero/watchband.png";
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
    title: "iPhone Cases",
    subtitle: "Shop iPhone Cases",
    slug: "op-dien-thoai",
  },
  {
    title: "Wireless Charging",
    subtitle: "Shop Wireless Chargers",
    slug: "sac-khong-day",
  },
  {
    title: "Power Banks",
    subtitle: "Shop Power Banks",
    slug: "pin-du-phong",
  },
  {
    title: "Apple Watch Bands",
    subtitle: "Shop Watch Bands",
    slug: "day-deo-apple-watch",
  },
  {
    title: "iPad Cases",
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


function ProductMiniCard({
  product,
  fallbackImage,
}: {
  product: CollectionProduct;
  fallbackImage: string;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    getCurrency(),
  );

  useEffect(() => {
    return subscribeToCurrencyChange(setCurrencyState);
  }, []);

  /**
   * INFIBETTER:
   * Supabase product prices are USD.
   *
   * This formatter is intentionally self-contained.
   * It does NOT use formatUSDFromVND() or formatCurrency().
   * This prevents a broken currency config from producing "$NaN".
   */
  const USD_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    VND: 25500,
    CAD: 1.38,
    AUD: 1.52,
    EUR: 0.88,
    GBP: 0.75,
    SGD: 1.28,
  };

  const LOCALES: Record<CurrencyCode, string> = {
    USD: "en-US",
    VND: "vi-VN",
    CAD: "en-CA",
    AUD: "en-AU",
    EUR: "de-DE",
    GBP: "en-GB",
    SGD: "en-SG",
  };

  function toNumber(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const cleaned = value
      .trim()
      .replace(/USD/gi, "")
      .replace(/[$€£₫]/g, "")
      .replace(/\s/g, "");

    if (!cleaned) return null;

    let normalized = cleaned;

    // "40,78" -> 40.78
    if (normalized.includes(",") && !normalized.includes(".")) {
      normalized = normalized.replace(",", ".");
    } else {
      // "1,299.99" -> 1299.99
      normalized = normalized.replace(/,/g, "");
    }

    const result = Number(normalized);

    return Number.isFinite(result) ? result : null;
  }

  function formatProductPrice(value: unknown): string {
    const usd = toNumber(value);

    if (usd === null) {
      return "—";
    }

    // Always fall back to USD if the saved currency is invalid.
    const activeCurrency: CurrencyCode =
      currency in USD_RATES ? currency : "USD";

    const rate = USD_RATES[activeCurrency];

    // Absolute guard against NaN / Infinity.
    if (!Number.isFinite(rate)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usd);
    }

    const converted = usd * rate;

    if (!Number.isFinite(converted)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usd);
    }

    const fractionDigits = activeCurrency === "VND" ? 0 : 2;

    return new Intl.NumberFormat(LOCALES[activeCurrency], {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(converted);
  }

  const price = toNumber(product.price);
  const comparePrice = toNumber(product.compare_at_price);

  const displayPrice = formatProductPrice(product.price);
  const displayComparePrice = formatProductPrice(product.compare_at_price);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="
        group relative grid w-[calc(100vw-58px)] flex-none snap-start
        grid-cols-[42%_58%] min-w-0 overflow-hidden
        rounded-[14px] border border-[#E5E7EB]
        bg-white transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        sm:block sm:w-auto sm:rounded-[10px]
        sm:h-auto
      "
    >
      {/* IMAGE */}
      <div
  className="
    relative h-full min-h-[210px]
    overflow-hidden bg-white
    sm:aspect-square sm:h-auto
  "
>
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          className="
            absolute inset-0
            h-full w-full
            object-contain p-2
            transition-transform duration-500
            group-hover:scale-[1.03]
            sm:p-1
          "
        />

        {/* BADGE */}
        <div className="absolute left-2 top-2 flex gap-1">
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
      <div className="flex h-full min-h-[210px] flex-col justify-center px-3 pb-3 pt-3 sm:h-auto sm:min-h-0 sm:block sm:px-2.5 sm:pb-2.5 sm:pt-2">
        <h3
          className="
            line-clamp-1
            text-[13px]
            font-semibold
            sm:text-[11px]
            tracking-[-0.01em]
            text-[#171717]
          "
        >
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-neutral-400 sm:line-clamp-1 sm:text-[9px]">
          Modern design · everyday practical
        </p>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-[14px] font-bold text-[#0066E6] sm:text-[11px]">
            {displayPrice}
          </span>

          {price !== null &&
            comparePrice !== null &&
            comparePrice > price && (
              <span className="text-[8px] text-neutral-400 line-through">
                {displayComparePrice}
              </span>
            )}
        </div>

        <div
  className="
    mt-3 flex h-[34px]
    w-[92%]
    items-center justify-center
    self-start
    rounded-[8px]
    border border-[#E8EBEF]
    bg-white
    text-[9px] font-semibold
    text-[#171717]
    shadow-[0_3px_10px_rgba(15,23,42,0.06)]
    transition-all duration-300
    group-hover:border-[#D9DEE5]
    group-hover:shadow-[0_5px_14px_rgba(15,23,42,0.08)]
  "
>
  View product
  <ArrowRight
    size={11}
    className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
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
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopStartIndex, setDesktopStartIndex] = useState(0);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const activeProducts =
    activeTab === "best" ? products : newArrivals;

  // Mobile: current product + a small peek of the next product.
  const mobileProducts = activeProducts.slice(
    mobileIndex,
    mobileIndex + 2,
  );

  // Desktop: keep a 5-product window.
  const desktopProducts = activeProducts.slice(
    desktopStartIndex,
    desktopStartIndex + 5,
  );

  const canGoNext = mobileIndex < activeProducts.length - 1;
  const canGoPrev = mobileIndex > 0;

  const canGoDesktopNext =
    desktopStartIndex + 5 < activeProducts.length;
  const canGoDesktopPrev = desktopStartIndex > 0;

  const nextProducts = () => {
    if (canGoNext) {
      setMobileIndex((prev) => prev + 1);
    }
  };

  const prevProducts = () => {
    if (canGoPrev) {
      setMobileIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const nextDesktopProducts = () => {
    if (canGoDesktopNext) {
      setDesktopStartIndex((prev) => prev + 1);
    }
  };

  const prevDesktopProducts = () => {
    if (canGoDesktopPrev) {
      setDesktopStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const changeTab = (tab: "best" | "new") => {
    setActiveTab(tab);
    setMobileIndex(0);
    setDesktopStartIndex(0);
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

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
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

        {/* MOBILE CATEGORY NAV */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          <button
            type="button"
            aria-label="Previous category"
            onClick={() =>
              categoryScrollRef.current?.scrollBy({
                left: -210,
                behavior: "smooth",
              })
            }
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-[#E2E6EB] bg-white
              text-neutral-500 shadow-[0_2px_8px_rgba(15,23,42,0.05)]
              transition-all active:scale-95 hover:text-[#171717]
            "
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Next category"
            onClick={() =>
              categoryScrollRef.current?.scrollBy({
                left: 210,
                behavior: "smooth",
              })
            }
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-[#E2E6EB] bg-white
              text-[#171717] shadow-[0_2px_8px_rgba(15,23,42,0.05)]
              transition-all active:scale-95 hover:bg-[#F8FAFC]
            "
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* CATEGORY CARDS */}

      <div
        ref={categoryScrollRef}
        className="
          mt-4
          flex
          snap-x
          snap-mandatory
          gap-3
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth
          pb-1
          pr-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:grid
          sm:grid-cols-3
          sm:gap-3
          sm:overflow-visible
          sm:pb-0
          sm:pr-0
          lg:grid-cols-5
        "
      >
        {collections.map((item, index) => (
          <Link
            key={item.slug}
            to="/shop"
            search={{ category: item.slug } as never}
            className="
              group
              relative
              block
              w-[190px]
              flex-none
              snap-start
              aspect-[1.08/1]
              overflow-hidden
              rounded-[9px]
              bg-[#EDEDED]
              sm:w-auto
              sm:flex-none
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
              <span className="h-1.5 w-1.5 rounded-full bg-[#0066E6]" />
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
    h-[42px]
    w-full
    items-center
    gap-1
    rounded-[13px]
    border
    border-[#E1E6ED]
    bg-[#F7F9FB]
    p-1
    shadow-[0_2px_10px_rgba(15,23,42,0.03)]
    sm:h-9
    sm:w-auto
    sm:border-0
    sm:bg-transparent
    sm:p-0
    sm:shadow-none
  "
>
  {/* BEST SELLERS */}

  <button
    type="button"
    onClick={() => changeTab("best")}
    className={`
      flex
      h-full
      min-w-0
      flex-1
      items-center
      justify-center
      rounded-[10px]
      px-3
      text-[10px]
      font-semibold
      tracking-[-0.01em]
      transition-all
      duration-200

      sm:h-8
      sm:flex-none
      sm:rounded-[7px]
      sm:px-5
      sm:text-[9px]

      ${
        activeTab === "best"
          ? `
            bg-white
            text-[#171717]
            shadow-[0_2px_7px_rgba(15,23,42,0.08)]
            ring-1
            ring-[#E4E8ED]
          `
          : `
            bg-transparent
            text-[#8A93A0]
            hover:text-[#4B5563]
          `
      }
    `}
  >
    Best Sellers
  </button>

  {/* NEW ARRIVALS */}

  <button
    type="button"
    onClick={() => changeTab("new")}
    className={`
      flex
      h-full
      min-w-0
      flex-1
      items-center
      justify-center
      rounded-[10px]
      px-3
      text-[10px]
      font-semibold
      tracking-[-0.01em]
      transition-all
      duration-200

      sm:h-8
      sm:flex-none
      sm:rounded-[7px]
      sm:px-5
      sm:text-[9px]

      ${
        activeTab === "new"
          ? `
            bg-white
            text-[#171717]
            shadow-[0_2px_7px_rgba(15,23,42,0.08)]
            ring-1
            ring-[#E4E8ED]
          `
          : `
            bg-transparent
            text-[#8A93A0]
            hover:text-[#4B5563]
          `
      }
    `}
  >
    New Arrivals
  </button>

  {/* VIEW ALL */}

  <Link
    to="/shop"
    className="
      flex
      h-full
      shrink-0
      items-center
      justify-center
      gap-1
      rounded-[10px]
      px-3
      text-[9px]
      font-semibold
      text-[#0066E6]
      transition-all
      duration-200
      hover:bg-white/70

      sm:h-8
      sm:rounded-[7px]
      sm:px-2
    "
  >
    <span>View all</span>

    <ArrowRight
      size={11}
      strokeWidth={2}
    />
  </Link>
</div>

        {/* PRODUCTS */}

        <div className="relative mt-3">
          {activeProducts.length > 0 ? (
            <>
              {/* MOBILE CAROUSEL */}
              <div className="lg:hidden">
                <div
                  className="
                    flex snap-x snap-mandatory gap-3
                    overflow-x-auto overscroll-x-contain
                    pb-2 pr-4 scroll-smooth
                    [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  {mobileProducts.map((product, index) => (
                    <ProductMiniCard
                      key={product.id}
                      product={product}
                      fallbackImage={
                        demoProductImages[
                          (mobileIndex + index) % demoProductImages.length
                        ]
                      }
                    />
                  ))}
                </div>

                {activeProducts.length > 1 && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] font-medium text-neutral-400">
                      Explore more
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="mr-1 text-[9px] text-neutral-400">
                        {mobileIndex + 1} / {activeProducts.length}
                      </span>

                      <button
                        type="button"
                        onClick={prevProducts}
                        disabled={!canGoPrev}
                        aria-label="Previous products"
                        className="
                          flex h-9 w-9 items-center justify-center rounded-full
                          border border-[#E2E6EB] bg-white text-neutral-500
                          shadow-sm transition-all active:scale-95
                          disabled:cursor-not-allowed disabled:opacity-35
                        "
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={nextProducts}
                        disabled={!canGoNext}
                        aria-label="Next products"
                        className="
                          flex h-9 w-9 items-center justify-center rounded-full
                          border border-[#E2E6EB] bg-white text-neutral-800
                          shadow-sm transition-all active:scale-95
                          disabled:cursor-not-allowed disabled:opacity-35
                        "
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DESKTOP PRODUCT GRID */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-4 gap-3 xl:grid-cols-5">
                  {desktopProducts.map((product, index) => (
                    <ProductMiniCard
                      key={product.id}
                      product={product}
                      fallbackImage={
                        demoProductImages[
                          (desktopStartIndex + index) % demoProductImages.length
                        ]
                      }
                    />
                  ))}
                </div>

                {activeProducts.length > 5 && (
                  <div className="mt-3 flex items-center justify-end gap-1">
                    <span className="mr-2 text-[9px] text-neutral-400">
                      {desktopStartIndex + 1}–
                      {Math.min(
                        desktopStartIndex + 5,
                        activeProducts.length,
                      )}{" "}
                      / {activeProducts.length}
                    </span>

                    <button
                      type="button"
                      onClick={prevDesktopProducts}
                      disabled={!canGoDesktopPrev}
                      aria-label="Previous products"
                      className="
                        flex h-8 w-8 items-center justify-center rounded-full
                        border border-neutral-200 bg-white text-neutral-500
                        transition-all hover:bg-neutral-50
                        disabled:cursor-not-allowed disabled:opacity-40
                      "
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={nextDesktopProducts}
                      disabled={!canGoDesktopNext}
                      aria-label="Next products"
                      className="
                        flex h-8 w-8 items-center justify-center rounded-full
                        border border-neutral-200 bg-white text-neutral-700
                        transition-all hover:bg-neutral-50
                        disabled:cursor-not-allowed disabled:opacity-40
                      "
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="
                flex min-h-[180px] items-center justify-center
                rounded-xl border border-dashed border-neutral-200
                bg-neutral-50 text-[11px] text-neutral-400
              "
            >
              No products available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}