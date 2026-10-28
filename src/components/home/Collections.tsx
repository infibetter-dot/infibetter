import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
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
  banner02, // Travel Power uses a charging-product image instead of the unrelated watchband/lifestyle image.
];

// Keep these slugs in sync with the category query parameters supported by /shop.
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
    title: "Travel Power",
    subtitle: "Shop Travel Power",
    slug: "travel-power",
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
  const cart = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    const numericPrice = toNumber(product.price);
    if (numericPrice === null) {
      toast.error("Unable to add this product to cart");
      return;
    }

    cart.add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: numericPrice,
        image: product.image_url || fallbackImage,
      },
      1,
    );
    toast.success("Added to cart");
  }

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
        group relative flex w-[210px] flex-none snap-start flex-col
        overflow-hidden rounded-[20px] border border-[#E8E3DD]
        bg-white shadow-[0_3px_12px_rgba(24,24,27,0.045)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(24,24,27,0.10)]
        sm:w-auto
      "
    >
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          loading="lazy"
          className="
            h-full w-full object-contain
            p-2.5
            transition-transform duration-500 ease-out
            group-hover:scale-[1.035]
          "
        />

        {/* BEST SELLER BADGE */}
        <div className="absolute left-2.5 top-2.5 z-10">
          <span
            className="
              inline-flex items-center rounded-full
              border border-[#E8E8E8] bg-white
              px-2.5 py-1
              text-[8px] font-semibold uppercase
              tracking-[0.12em] text-[#8A5A3B]
              shadow-[0_2px_7px_rgba(0,0,0,0.06)]
              sm:text-[8px]
            "
          >
            Best Seller
          </span>
        </div>

        {/* QUICK VIEW / OPEN PRODUCT */}
        <span
          aria-hidden="true"
          className="
            absolute right-2.5 top-2.5 z-10
            flex h-8 w-8 items-center justify-center
            rounded-[10px] border border-[#E8E8E8]
            bg-white text-[#292929]
            shadow-[0_2px_8px_rgba(0,0,0,0.07)]
            backdrop-blur-sm
            transition-all duration-200
            group-hover:bg-white group-hover:scale-105
          "
        >
          <ExternalLink size={14} strokeWidth={1.8} />
        </span>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex min-h-[108px] flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3
          className="
            line-clamp-2 min-h-[2.8em]
            text-[12px] font-medium leading-[1.4]
            tracking-[-0.015em] text-[#262626]
            sm:text-[12px] lg:text-[13px]
          "
        >
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-[9px] leading-4 text-neutral-400 sm:text-[10px]">
          Modern design · everyday practical
        </p>

        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[15px] font-bold leading-none tracking-[-0.025em] text-[#0066E6] sm:text-[16px]">
              {displayPrice}
            </span>

            {price !== null &&
              comparePrice !== null &&
              comparePrice > price && (
                <span className="text-[10px] font-normal text-neutral-400 line-through sm:text-[11px]">
                  {displayComparePrice}
                </span>
              )}
          </div>

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className="
              group/cart relative flex h-7 w-7 shrink-0 items-center justify-center
              overflow-hidden rounded-full border border-white/80
              bg-gradient-to-br from-white/75 via-white/60 to-[#E8EDF3]/65
              text-[#343A44]/80
              shadow-[0_2px_7px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
              backdrop-blur-xl transition-all duration-200
              hover:scale-[1.03] hover:shadow-[0_3px_9px_rgba(15,23,42,0.12)]
              active:scale-95 disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white/90 to-transparent"
            />
            <ShoppingCart
              aria-hidden="true"
              className="relative z-10 h-3.5 w-3.5"
              strokeWidth={1.8}
            />
          </button>
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
  // Use the actual image from the Travelmag Hybrid product for the Travel Power category card.
  // Product images come from the product data already passed into this component.
  const travelPowerProduct = [...products, ...newArrivals].find((product) => {
    const name = product.name.toLowerCase();
    const slug = product.slug.toLowerCase();
    return name.includes("travelmag hybrid") || slug.includes("travelmag-hybrid");
  });
  const travelPowerImage = travelPowerProduct?.image_url || banner02;

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
        mx-auto w-full max-w-[1440px] bg-transparent
        px-1.5 pb-8 pt-7
        sm:px-6 sm:pt-9
        lg:px-8 lg:pb-12 lg:pt-10
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
              text-[27px]
              font-bold
              leading-[1.08]
              tracking-[-0.035em]
              text-[#171717]
              sm:text-[31px]
              lg:text-[34px]
            "
          >
            Shop by category
          </h2>

          <p
            className="
              mt-2.5
              text-[11px]
              leading-relaxed
              text-neutral-500
              sm:text-[12px]
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
                left: -280,
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
                left: 280,
                behavior: "smooth",
              })
            }
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-[#E2E6EB] bg-white
              text-[#171717] shadow-[0_2px_8px_rgba(15,23,42,0.05)]
              transition-all active:scale-95 hover:bg-white
            "
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* SHOP BY CATEGORY — three balanced feature cards */}
      <div
        ref={categoryScrollRef}
        className="
          mt-5
          -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto
          overscroll-x-contain px-4 pb-2
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible
          sm:px-0 sm:pb-0 sm:snap-none
          lg:mt-6 lg:grid-cols-4 lg:gap-5
        "
      >
        {collections.map((item, index) => (
          <Link
            key={item.slug}
            to="/shop"
            search={{ category: item.slug } as never}
            className="
              group flex min-h-[84px] w-[min(300px,84vw)] flex-none snap-start items-center gap-3
              rounded-[16px] border border-[#E8E8E8]
              bg-white p-2.5
              shadow-[0_4px_14px_rgba(17,24,39,0.055),inset_0_1px_0_rgba(255,255,255,0.95)]
              backdrop-blur-xl
              transition-all duration-300
              hover:-translate-y-0.5 hover:border-white
              hover:bg-white
              hover:shadow-[0_9px_22px_rgba(17,24,39,0.09),inset_0_1px_0_rgba(255,255,255,1)]
              sm:min-h-[88px] sm:w-auto sm:min-w-0 sm:flex-auto sm:snap-align-none sm:gap-3 sm:p-2.5
              lg:min-h-[92px] lg:gap-3 lg:p-3
            "
          >
            <div
              className="
                relative flex h-[58px] w-[58px] flex-none
                items-center justify-center overflow-hidden
                rounded-full border border-[#E8E8E8] bg-white
                shadow-[0_3px_10px_rgba(17,24,39,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]
                transition-all duration-300
                group-hover:scale-[1.03] group-hover:shadow-[0_6px_15px_rgba(17,24,39,0.10)]
                sm:h-[62px] sm:w-[62px]
                lg:h-[66px] lg:w-[66px]
              "
            >
              <img
                src={index === 3 ? travelPowerImage : categoryImages[index]}
                alt={item.title}
                loading="lazy"
                className="
                  h-full w-full object-contain p-1.5
                  transition-transform duration-500 ease-out
                  group-hover:scale-[1.06]
                "
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="
                  truncate text-[12px] font-bold leading-5
                  tracking-[-0.025em] text-[#171717]
                  transition-colors group-hover:text-[#0066E6]
                  sm:text-[12px] lg:text-[13px]
                "
              >
                {item.title}
              </h3>
              <p className="mt-0.5 text-[10px] leading-4 text-[#7A8493] sm:text-[10px] lg:text-[11px]">
                Explore collection
              </p>
            </div>

            <span
              className="
                flex h-8 w-8 flex-none items-center justify-center
                rounded-full border border-[#E8E8E8] bg-white
                text-[#344054]
                shadow-[0_3px_10px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
                backdrop-blur-xl
                transition-all duration-300
                group-hover:scale-105 group-hover:border-white
                group-hover:bg-white/95 group-hover:text-[#0066E6]
                group-hover:shadow-[0_5px_14px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,1)]
              "
              aria-hidden="true"
            >
              <ArrowRight size={13} strokeWidth={1.8} />
            </span>
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

        </div>

       {/* TABS — no surrounding white panel; keep only one View all link in the header */}

<div
  className="
    mt-3
    flex
    h-9
    w-fit
    items-center
    gap-1
    bg-transparent
    p-0
  "
>
  {/* BEST SELLERS */}
  <button
    type="button"
    onClick={() => changeTab("best")}
    className={`
      flex h-8 flex-none items-center justify-center rounded-[7px] px-5
      text-[9px] font-semibold tracking-[-0.01em] transition-all duration-200
      ${
        activeTab === "best"
          ? `bg-white text-[#171717] shadow-[0_2px_7px_rgba(15,23,42,0.08)] ring-1 ring-[#E4E8ED]`
          : `bg-transparent text-[#8A93A0] hover:text-[#4B5563]`
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
      flex h-8 flex-none items-center justify-center rounded-[7px] px-5
      text-[9px] font-semibold tracking-[-0.01em] transition-all duration-200
      ${
        activeTab === "new"
          ? `bg-white text-[#171717] shadow-[0_2px_7px_rgba(15,23,42,0.08)] ring-1 ring-[#E4E8ED]`
          : `bg-transparent text-[#8A93A0] hover:text-[#4B5563]`
      }
    `}
  >
    New Arrivals
  </button>

  {/* VIEW ALL — aligned with the mirror-style tabs */}
  <Link
    to="/shop"
    className="
      group flex h-8 flex-none items-center justify-center gap-1.5
      rounded-[8px] border border-white/90 bg-white/65 px-3.5
      text-[9px] font-semibold text-[#0066E6]
      shadow-[0_3px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
      backdrop-blur-xl transition-all duration-200
      hover:bg-white/90 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)]
    "
  >
    View all
    <ArrowRight size={11} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
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
                    pb-2 pr-1.5 scroll-smooth
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

                {activeProducts.length > 1 && (
                  <div className="pointer-events-none absolute top-[132px] right-3 z-20 flex items-center">
                    <button
                      type="button"
                      onClick={nextProducts}
                      disabled={!canGoNext}
                      aria-label="Next products"
                      className="
                        pointer-events-auto relative flex h-8 w-8 items-center justify-center
                        overflow-hidden rounded-full border border-white/70
                        bg-gradient-to-b from-white/75 via-white/55 to-white/40
                        text-neutral-700/80
                        shadow-[0_3px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
                        backdrop-blur-xl transition-all active:scale-95
                        disabled:cursor-not-allowed disabled:opacity-35
                      "
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white/80 to-transparent" />
                      <ChevronRight size={14} strokeWidth={1.8} className="relative z-10" />
                    </button>
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
                        transition-all hover:bg-white
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
                        transition-all hover:bg-white
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
                bg-white text-[11px] text-neutral-400
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