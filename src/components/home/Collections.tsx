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

import banner01 from "@/assets/hero/iphonecase1.png";
import banner02 from "@/assets/hero/wireless charger1.png";
import banner03 from "@/assets/hero/powerbank1.png";
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
];

const collections = [
  {
    title: "iPhone Cases",
    subtitle: "Shop iPhone Cases",
    slug: "iphone-cases",
  },
  {
    title: "Wireless Charging",
    subtitle: "Shop Wireless Chargers",
    slug: "wireless-charging",
  },
  {
    title: "Power Banks",
    subtitle: "Shop Power Banks",
    slug: "power-banks",
  },
  {
    title: "Apple Watch Bands",
    subtitle: "Shop Watch Bands",
    slug: "day-deo-apple-watch",
  },
];

// Fallback images used by product cards when a product has no image_url.
const demoProductImages = [banner02, banner03, banner01, hero1, hero2];

function ProductMiniCard({
  product,
  fallbackImage,
  floatDelay = 0,
}: {
  product: CollectionProduct;
  fallbackImage: string;
  floatDelay?: number;
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
        group relative flex w-[calc((100vw-44px)/2)] flex-none snap-start
        flex-col overflow-hidden rounded-[20px] border border-[#EAE6E1]
        bg-white shadow-[0_3px_12px_rgba(24,24,24,0.06)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.10)]
        sm:w-auto sm:rounded-[18px]
      "
    >
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F1ED]">
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          loading="lazy"
          className="
            absolute inset-0 h-full w-full object-cover
            transition-transform duration-500 group-hover:scale-[1.03]
          "
        />

        {/* Soft image tint for legible overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

        {/* BEST SELLER BADGE */}
        <div className="absolute left-3 top-3">
          <span className="relative inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#33302D] shadow-sm backdrop-blur-sm sm:text-[10px]">
            Best Seller
            <span className="absolute bottom-0 left-3 right-3 h-[2px] translate-y-[1px] rounded-full bg-[#E97943]" />
          </span>
        </div>

        {/* SUBTLE CTA OVER IMAGE */}
        <div
          className="
            absolute bottom-2.5 left-2.5 right-2.5 flex h-[29px]
            items-center justify-center rounded-full
            border border-white/55 bg-white/65
            px-3 text-[10px] font-medium text-[#35312D]/85
            shadow-[0_1px_4px_rgba(0,0,0,0.06)]
            backdrop-blur-md transition-all duration-300
            group-hover:bg-white/80 group-hover:text-[#292622]
            sm:bottom-3 sm:left-3 sm:right-3 sm:h-[32px] sm:text-[10px]
          "
        >
          <span>View product</span>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex min-w-0 flex-1 flex-col px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[12px] font-medium leading-[1.55] tracking-[-0.01em] text-[#3A332E] sm:text-[13px]">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-neutral-400 sm:text-[11px]">
          Modern design · everyday practical
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#24211E] sm:text-[15px]">
            {displayPrice}
          </span>

          {price !== null &&
            comparePrice !== null &&
            comparePrice > price && (
              <span className="text-[10px] text-neutral-400 line-through sm:text-[11px]">
                {displayComparePrice}
              </span>
            )}
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

  // Mobile: show two full product cards side by side.
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
      <style>{`
        @keyframes infi-float-up-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .infi-float-button {
          animation: infi-float-up-down 2.8s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .infi-float-button {
            animation: none;
            will-change: auto;
          }
        }
      `}</style>

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
          gap-4
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth
          pb-1
          pr-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:grid
          sm:grid-cols-4
          sm:justify-items-center
          sm:gap-5
          sm:overflow-visible
          sm:pb-0
          sm:pr-0
          lg:gap-6
        "
      >
        {collections.map((item, index) => (
          <Link
            key={item.slug}
            to="/shop"
            search={{ category: item.slug } as never}
            className="group flex w-[92px] flex-none snap-start flex-col items-center gap-2 text-center sm:w-[112px] lg:w-[124px]"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[#F3F4F6] shadow-[0_3px_12px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_7px_18px_rgba(15,23,42,0.12)]">
              <img
                src={categoryImages[index]}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <span className="w-full text-[10px] font-semibold leading-tight tracking-[-0.01em] text-[#242424] sm:text-[11px]">
              {item.title}
            </span>
          </Link>
        ))}
      </div>

      {/* =====================================================
          FIND YOUR NEXT UPGRADE
      ====================================================== */}

      <div className="mt-7 sm:mt-8">
        {/* HEADER */}

        <div className="flex items-end justify-between gap-4 border-b border-[#E8E8E8] pb-4 sm:pb-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-5 bg-[#0066E6] sm:w-7" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#777E87] sm:text-[9px]">
                The INFIBETTER edit
              </span>
            </div>
            <h2
              className="
                font-sans text-[25px] font-bold leading-[1.06]
                tracking-[-0.045em] text-[#171717]
                sm:text-[32px] lg:text-[36px]
              "
            >
              Find your next <span className="text-[#7B8189]">upgrade.</span>
            </h2>

            <p className="mt-2 text-[10px] leading-relaxed text-[#777E87] sm:text-[11px]">
              The products our customers love most.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/70 px-3 py-2 text-[9px] font-medium tracking-wide text-[#737982] md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0066E6]" />
            EVERYDAY TECH, REFINED
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
    h-[36px]
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
      rounded-[8px]
      px-2.5
      text-[9px]
      font-semibold
      tracking-[-0.01em]
      transition-all
      duration-200

      sm:h-7
      sm:flex-none
      sm:rounded-full
      sm:px-4
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
      rounded-[8px]
      px-2.5
      text-[9px]
      font-semibold
      tracking-[-0.01em]
      transition-all
      duration-200

      sm:h-7
      sm:flex-none
      sm:rounded-full
      sm:px-4
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
              <div className="relative lg:hidden">
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
                      floatDelay={((mobileIndex + index) % 5) * 0.35}
                      fallbackImage={
                        demoProductImages[
                          (mobileIndex + index) % demoProductImages.length
                        ]
                      }
                    />
                  ))}
                </div>

                {/* Single compact glass / mirror next control */}
                {activeProducts.length > 2 && (
                  <button
                    type="button"
                    onClick={nextProducts}
                    disabled={!canGoNext}
                    aria-label="Next products"
                    className="absolute right-2 top-[36%] z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-white/45 text-[#202020] shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-200 active:scale-90 disabled:opacity-30 sm:hidden"
                  >
                    <ChevronRight size={13} strokeWidth={1.8} />
                  </button>
                )}

                {activeProducts.length > 1 && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[8px] font-medium text-neutral-400">
                      Explore more
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="mr-1 text-[8px] text-neutral-400">
                        {mobileIndex + 1} / {activeProducts.length}
                      </span>

                      <div className="hidden items-center gap-1.5 sm:flex">
                      <button
                        type="button"
                        onClick={prevProducts}
                        disabled={!canGoPrev}
                        aria-label="Previous products"
                        className="
                          flex h-5 w-5 items-center justify-center rounded-full
                          border border-[#E2E6EB] bg-white text-neutral-500
                          shadow-sm transition-all active:scale-95
                          disabled:cursor-not-allowed disabled:opacity-35
                        "
                      >
                        <ChevronLeft size={7} />
                      </button>

                      <button
                        type="button"
                        onClick={nextProducts}
                        disabled={!canGoNext}
                        aria-label="Next products"
                        className="
                          flex h-5 w-5 items-center justify-center rounded-full
                          border border-[#E2E6EB] bg-white text-neutral-800
                          shadow-sm transition-all active:scale-95
                          disabled:cursor-not-allowed disabled:opacity-35
                        "
                      >
                        <ChevronRight size={7} />
                      </button>
                      </div>
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
                      floatDelay={((desktopStartIndex + index) % 5) * 0.35}
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