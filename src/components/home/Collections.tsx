import { Link } from "@tanstack/react-router";
import VoucherSlider from "@/components/home/VoucherSlider";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  BatteryCharging,
  Plane,
  MessageSquare,
  Star,
  BadgeCheck,
  Play,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import {
  getCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

import banner02 from "@/assets/hero/wireless charger.png";
import banner03 from "@/assets/hero/powerbank.png";
import hero2 from "@/assets/hero/hero_2.png";
import travelCategoryImage from "@/assets/hero/danhmuc travel.png";

interface CollectionProduct {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  image_url?: string | null;
  stock?: number | null;
  best_choice?: boolean | null;
  everyday_plus?: boolean | null;
  is_active?: boolean | null;
  category_id?: string | null;
  category_slug?: string | null;
  category_name?: string | null;
  category?: string | { slug?: string | null; name?: string | null } | null;
}

interface HomepageTile {
  id: string;
  position: number;
  title: string;
  image_url?: string | null;
  category_ids?: string[];
  category_slug: string;
  category_name: string;
}

interface HomepageReview {
  id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  verified_purchase: boolean | null;
  created_at: string;
  product_id: string;
}

interface CollectionsProps {
  homepageTiles?: HomepageTile[];
  products?: CollectionProduct[];
  newArrivals?: CollectionProduct[];
  bestChoiceProducts?: CollectionProduct[];
  everydayPlusProducts?: CollectionProduct[];
}

const categoryImages = [
  banner02,
  banner03,
  banner02, // Travel Power uses a charging-product image instead of the unrelated watchband/lifestyle image.
];

// Keep these slugs in sync with the category query parameters supported by /shop.
const collections = [
  { title: "Wireless Charging", subtitle: "Shop Wireless Chargers", slug: "wireless-charging" },
  { title: "Power Banks", subtitle: "Shop Power Banks", slug: "power-banks" },
  { title: "Travel Power", subtitle: "Shop Travel Power", slug: "travel-power" },
];

// Fallback images used by product cards when a product has no image_url.
const demoProductImages = [banner02, banner03, banner02, banner02, hero2];

function ProductMiniCard({
  product,
  fallbackImage,
  floatDelay = 0,
  badgeLabel = "New Arrival",
  fluid = false,
  editorial = false,
}: {
  product: CollectionProduct;
  fallbackImage: string;
  floatDelay?: number;
  badgeLabel?: string;
  fluid?: boolean;
  editorial?: boolean;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    getCurrency(),
  );

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
      .replace(/[$ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â«]/g, "")
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
      return "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â";
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
  const savingsPercent =
    price !== null &&
    comparePrice !== null &&
    comparePrice > price &&
    comparePrice > 0
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const displayPrice = formatProductPrice(product.price);
  const displayComparePrice = formatProductPrice(product.compare_at_price);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`
        group relative flex w-full min-w-0 flex-col
        overflow-hidden rounded-[20px] border border-[#E8E3DD]
        bg-white shadow-[0_3px_12px_rgba(24,24,27,0.045)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(24,24,27,0.10)]
        ${editorial ? "h-full rounded-[22px] border-transparent bg-[#F8F8F8] shadow-none hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)]" : ""}
        ${fluid ? "" : "snap-start"}
      `}
    >
      {/* PRODUCT IMAGE */}
      <div className={`relative w-full overflow-hidden ${editorial ? "aspect-square bg-[#E9E9E9]" : "aspect-square bg-white sm:aspect-[4/5]"}`}>
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          loading="lazy"
          className={`
            h-full w-full object-contain
            ${editorial ? "p-0" : "p-2.5"}
            transition-transform duration-500 ease-out
            group-hover:scale-[1.035]
          `}
        />

        {/* PRODUCT BADGES */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-1.5">
          {editorial && savingsPercent > 0 ? (
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#E91E4D] px-5 py-2 text-[12px] font-semibold text-white shadow-sm sm:text-[13px]">
              Save {savingsPercent}%
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-[#BBF7D0] bg-[#ECFDF3] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.09em] text-[#15803D] shadow-[0_2px_7px_rgba(0,0,0,0.05)]">
              {badgeLabel}
            </span>
          )}
          {!editorial && savingsPercent > 0 && (
            <span className="inline-flex items-center rounded-[5px] border border-[#FF4D00] bg-[#FF4D00] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_2px_7px_rgba(0,0,0,0.08)]">
              Save {savingsPercent}%
            </span>
          )}
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
      {/* PRODUCT DETAILS - HORIZONTAL LAYOUT */}
      <div className={`flex min-w-0 gap-3 ${editorial ? "min-h-[132px] items-start px-5 py-4 sm:min-h-[148px] sm:px-7 sm:py-5" : "min-h-[88px] items-center justify-between px-3.5 py-3 sm:px-4"}`}>
        {editorial ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#929292]">INFIBETTER</span>
            <h3 className="line-clamp-3 text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[#171717] sm:text-[20px]">{product.name}</h3>
          </div>
        ) : (
          <h3 className="min-w-0 flex-1 line-clamp-2 text-[12px] font-medium leading-[1.4] tracking-[-0.015em] text-[#262626] sm:text-[13px]">{product.name}</h3>
        )}
        <div className={`flex flex-none flex-col gap-1 ${editorial ? "items-end pt-7 text-right" : "items-end justify-center text-right"}`}>
          <span className={`${editorial ? "text-[16px] sm:text-[18px]" : "text-[13px] sm:text-[14px]"} whitespace-nowrap font-medium leading-tight text-[#E11D48]`}>{displayPrice}</span>
          {price !== null && comparePrice !== null && comparePrice > price && (
            <span className={`${editorial ? "text-[12px] sm:text-[13px]" : "text-[10px] sm:text-[11px]"} whitespace-nowrap font-normal leading-tight text-neutral-400 line-through`}>{displayComparePrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Collections({
  homepageTiles = [],
  products = [],
  newArrivals = [],
  bestChoiceProducts: selectedBestChoiceProducts,
  everydayPlusProducts: selectedEverydayPlusProducts,
}: CollectionsProps) {
  const [desktopStartIndex, setDesktopStartIndex] = useState(0);
  const [activeCollectionTab, setActiveCollectionTab] = useState("new-arrivals");

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const mobileProductsScrollRef = useRef<HTMLDivElement>(null);
  const reviewSliderRef = useRef<HTMLDivElement>(null);
  const everydayPlusSliderRef = useRef<HTMLDivElement>(null);
  const [homepageReviews, setHomepageReviews] = useState<HomepageReview[]>([]);

  useEffect(() => {
    let active = true;

    async function loadHomepageReviews() {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(
          "id, product_id, customer_name, rating, title, content, image_url, video_url, verified_purchase, created_at",
        )
        .eq("is_visible", true)
        .not("title", "ilike", "[SAMPLE]%")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Failed to load homepage reviews:", error);
        return;
      }

      if (!active) return;

      const rows = (data ?? []) as HomepageReview[];
      const withImages = rows.filter((review) => Boolean(review.image_url));
      const withVideo = rows.filter(
        (review) => !review.image_url && Boolean(review.video_url),
      );
      const textOnly = rows.filter(
        (review) => !review.image_url && !review.video_url,
      );

      // Prioritize real customer photos, then videos, then text-only reviews.
      setHomepageReviews([...withImages, ...withVideo, ...textOnly].slice(0, 12));
    }

    loadHomepageReviews();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const slider = reviewSliderRef.current;
    if (!slider || homepageReviews.length < 2) return;

    // Auto-advance one review card at a time, then smoothly loop to the start.
    const interval = window.setInterval(() => {
      const firstCard = slider.firstElementChild as HTMLElement | null;
      if (!firstCard) return;

      const styles = window.getComputedStyle(slider);
      const gap =
        Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const step = firstCard.getBoundingClientRect().width + gap;
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      // Nothing to slide if all review cards already fit in the viewport.
      if (maxScroll <= 8 || step <= 0) return;

      const nextLeft =
        slider.scrollLeft >= maxScroll - step * 0.65
          ? 0
          : Math.min(slider.scrollLeft + step, maxScroll);

      slider.scrollTo({
        left: nextLeft,
        behavior: "smooth",
      });
    }, 3600);

    return () => window.clearInterval(interval);
  }, [homepageReviews.length]);
  // Use the dedicated Travel Power category artwork.
  const displayCollections = homepageTiles.map((tile, index) => ({
    id: tile.id,
    title: tile.title || tile.category_name,
    slug: tile.category_slug,
    image:
      tile.category_slug === "travel-power"
        ? travelCategoryImage
        : tile.image_url || categoryImages[index] || banner02,
  }));

  // New Arrivals remains its own section.
  // Keep all Admin-configured homepage tabs visible.
  const visibleHomepageTiles = homepageTiles;
  const selectedHomepageTile = visibleHomepageTiles.find(
    (tile) => tile.id === activeCollectionTab
  );

  const isChargingStationTab = selectedHomepageTile
    ? (
        selectedHomepageTile.category_slug === "power-station" ||
        selectedHomepageTile.category_slug === "charging-stations" ||
        selectedHomepageTile.title.toLowerCase().includes("charging station")
      )
    : false;

  const activeProducts = selectedHomepageTile
    ? isChargingStationTab
      ? products
          .filter((product) =>
            product.category_slug === "power-station" ||
            product.category?.slug === "power-station"
          )
          .slice(0, 12)
      : products
          .filter((product) =>
            !!product.category_id &&
            (selectedHomepageTile.category_ids ?? [selectedHomepageTile.category_id])
              .includes(product.category_id)
          )
          .slice(0, 12)
    : newArrivals;

  // Keep a de-duplicated source for sections that still use the general
  // product list. Admin-selected sections use the exact arrays from the
  // homepage loader whenever those props are supplied.
  const uniqueProducts = [...products, ...newArrivals].filter(
    (product, index, all) => all.findIndex((item) => item.id === product.id) === index,
  );

  // BEST CHOICE: only products explicitly selected by Admin.
  const bestChoiceSource =
    selectedBestChoiceProducts ??
    uniqueProducts.filter((product) => product.best_choice === true);

  const bestChoiceProducts = bestChoiceSource
    .filter((product) => product.is_active !== false)
    .filter((product) => product.best_choice === true)
    .slice(0, 4);

  const bestChoiceIds = new Set(bestChoiceProducts.map((product) => product.id));

  // EVERYDAY PLUS: only products explicitly ticked by Admin.
  // Never infer membership from category or from being a non-case product.
  const everydayPlusSource =
    selectedEverydayPlusProducts ??
    uniqueProducts.filter((product) => product.everyday_plus === true);

  const everydayPlusProducts = everydayPlusSource
    .filter((product) => product.is_active !== false)
    .filter((product) => product.everyday_plus === true)
    .filter((product) => !bestChoiceIds.has(product.id))
    .filter((product) => {
      const categoryValue =
        typeof product.category === "string"
          ? product.category
          : `${product.category?.slug ?? ""} ${product.category?.name ?? ""}`;
      const categoryText = [
        categoryValue,
        product.category_slug ?? "",
        product.category_name ?? "",
      ].join(" ").toLowerCase();
      return !/iphone[-_ ]?cases?|phone[-_ ]?cases?|mobile[-_ ]?cases?/.test(categoryText);
    })
    .slice(0, 12);

  // Desktop: keep a 5-product window. Mobile renders the full list
  // inside a native horizontal scroller so touch-swipe works across all items.
  const desktopProducts = activeProducts.slice(
    desktopStartIndex,
    desktopStartIndex + 5,
  );

  const canGoDesktopNext =
    desktopStartIndex + 5 < activeProducts.length;
  const canGoDesktopPrev = desktopStartIndex > 0;

  const scrollMobileProducts = (direction: "next" | "prev") => {
    const container = mobileProductsScrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>("[data-product-card]");
    const distance = firstCard
      ? firstCard.getBoundingClientRect().width + 12
      : 220;

    container.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
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

  const scrollEverydayPlus = (direction: "next" | "prev") => {
    const slider = everydayPlusSliderRef.current;
    if (!slider) return;

    const firstCard = slider.firstElementChild as HTMLElement | null;
    if (!firstCard) return;

    const styles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const distance = firstCard.getBoundingClientRect().width + gap;

    slider.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
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
      <div className="mb-6 text-center sm:mb-8">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF4D00] sm:text-[10px]">
          INFIBETTER COLLECTIONS
        </p>
        <h2
          className="
            font-sans text-[25px] font-bold leading-[1.08]
            tracking-[-0.04em] text-[#171717]
            sm:text-[30px] lg:text-[34px]
          "
        >
          Explore Charging Essentials
        </h2>
        <p className="mx-auto mt-2 max-w-[440px] text-[12px] leading-relaxed text-[#737B87] sm:text-[13px]">
          Find the right power for home, work and everywhere in between.
        </p>
      </div>

      <div
        ref={categoryScrollRef}
        aria-label="Shop by category"
        className="
          mx-0 grid grid-cols-3 items-stretch gap-2 overflow-visible
          px-0 pb-2
          sm:grid-cols-2 sm:gap-4 sm:pb-0
          lg:mx-auto lg:max-w-[1160px] lg:grid-cols-3 lg:gap-6
        "
      >
        {collections.map((item, index) => (
          <Link
            key={item.slug}
            to="/shop"
            search={{ category: item.slug } as never}
            className="
              group flex min-w-0 w-full flex-col overflow-hidden rounded-[14px]
              border border-[#E9EAEC] bg-white
              transition-all duration-300
              hover:-translate-y-1 hover:border-[#DDE3EA]
              hover:bg-white hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]
              sm:rounded-[18px]
              lg:min-h-[250px]
            "
          >
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-white">
              <img
                src={index === 2 ? travelCategoryImage : categoryImages[index]}
                alt={item.title}
                loading="lazy"
                draggable={false}
                className="
                  block h-[84%] w-[84%] object-contain object-center
                  bg-white
                  transition-transform duration-500 ease-out
                  group-hover:scale-[1.02]
                "
              />
            </div>

            <div className="flex min-h-[58px] items-center justify-between gap-1.5 px-2 py-2 sm:min-h-[76px] sm:gap-3 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h3
                  className="
                    text-[10px] font-semibold leading-tight
                    tracking-[-0.025em] text-[#171717]
                    transition-colors group-hover:text-[#FF4D00]
                    sm:text-[17px] lg:text-[18px]
                  "
                >
                  {item.title}
                </h3>
                <p className="mt-0.5 truncate text-[8px] leading-tight text-[#7A8493] sm:mt-1 sm:text-[12px]">
                  {item.subtitle}
                </p>
              </div>

              <span
                className="
                  flex h-6 w-6 flex-none items-center justify-center sm:h-9 sm:w-9
                  rounded-full border border-[#E5E7EB] bg-white
                  text-[#344054] shadow-[0_3px_10px_rgba(15,23,42,0.07)]
                  transition-all duration-300
                  group-hover:border-[#FF4D00] group-hover:bg-[#FF4D00]
                  group-hover:text-white group-hover:translate-x-0.5
                "
                aria-hidden="true"
              >
                <ArrowRight size={12} strokeWidth={1.8} className="sm:!h-[15px] sm:!w-[15px]" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* VOUCHER SLIDER ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â BELOW SHOP BY CATEGORY */}
      <VoucherSlider />

      {/* =====================================================
          EVERYDAY PLUS ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â EVERYDAY ACCESSORIES
      ====================================================== */}
      <div className="mt-9 border-t border-[#ECECEC] pt-7 sm:mt-11 sm:pt-9">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0066E6] sm:text-[10px]">
              INFIBETTER EVERYDAY EDIT
            </p>
            <h2 className="font-sans text-[27px] font-bold leading-[1.08] tracking-[-0.035em] text-[#171717] sm:text-[31px] lg:text-[34px]">
              Everyday Plus
            </h2>
            <p className="mt-2 text-[10px] leading-relaxed text-neutral-500 sm:text-[11px]">
              Smart essentials that make every day easier.
            </p>
          </div>

          <div className="mb-0.5 flex flex-none items-center gap-2">
            <button
              type="button"
              onClick={() => scrollEverydayPlus("prev")}
              aria-label="Previous Everyday Plus products"
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-[#0066E6] hover:text-[#0066E6] sm:inline-flex"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => scrollEverydayPlus("next")}
              aria-label="Next Everyday Plus products"
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#344054] shadow-sm transition hover:border-[#0066E6] hover:text-[#0066E6] sm:inline-flex"
            >
              <ChevronRight size={15} />
            </button>
            <Link
              to="/shop"
              className="group flex h-8 flex-none items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-[9px] font-semibold text-[#0066E6] shadow-[0_2px_8px_rgba(15,23,42,0.045)] transition-all hover:border-[#0066E6]/30 hover:bg-[#F8FBFF]"
            >
              View all
              <ArrowRight size={11} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {everydayPlusProducts.length > 0 ? (
          <div
            ref={everydayPlusSliderRef}
            className="mt-6 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
            aria-label="Everyday Plus products carousel"
          >
            {everydayPlusProducts.map((product, index) => (
              <div
                key={`everyday-plus-${product.id}`}
                className="w-full min-w-0 flex-none basis-[78%] snap-start sm:basis-[calc((100%_-_1rem)/2)] lg:basis-[calc((100%_-_3rem)/4)]"
              >
                <ProductMiniCard
                  product={product}
                  floatDelay={(index % 4) * 0.35}
                  fallbackImage={banner02}
                  badgeLabel="Everyday Plus"
                  editorial
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex min-h-[88px] items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-4 text-center text-[11px] text-neutral-400">
            No everyday products available yet.
          </div>
        )}
      </div>

      <section
        aria-labelledby="customer-reviews-heading"
        className="relative left-1/2 mt-12 w-screen -translate-x-1/2 overflow-hidden bg-white py-8 sm:mt-14 sm:py-10 lg:py-12"
      >
        <div className="mb-5 flex items-end justify-between gap-4 px-5 sm:mb-7 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0066E6] sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0066E6]" />
              Real customer feedback
            </p>
            <h2
              id="customer-reviews-heading"
              className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.04em] text-[#111111] sm:text-[28px] lg:text-[32px]"
            >
              Loved by customers. Seen in real life.
            </h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#697586] sm:text-[13px]">
              Real experiences from people who use INFIBETTER every day.
            </p>
          </div>

          <a
            href="/reviews"
            className="group inline-flex min-h-9 flex-none items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 text-[10px] font-semibold text-[#263445] transition hover:border-[#0066E6] hover:text-[#0066E6] sm:min-h-10 sm:px-4 sm:text-[11px]"
          >
            View all
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {homepageReviews.length > 0 ? (
          <div
            ref={reviewSliderRef}
            aria-label="Customer reviews slider"
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-8 lg:gap-5 lg:px-12"
          >
            {homepageReviews.map((review) => {
              const productName =
                products.find((product) => product.id === review.product_id)?.name ??
                "INFIBETTER Product";
              const hasMedia = Boolean(review.image_url || review.video_url);

              return (
                <article
                  key={review.id}
                  className="group flex w-[280px] flex-none snap-start flex-col overflow-hidden rounded-[18px] border border-[#E7E9ED] bg-white shadow-[0_5px_18px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D8E0EA] hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)] sm:w-[320px] lg:w-[340px]"
                >
                  {review.image_url ? (
                    <a
                      href={review.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group/media relative block aspect-[4/3] overflow-hidden bg-[#F5F7FA]"
                      aria-label={`View customer photo for ${productName}`}
                    >
                      <img
                        src={review.image_url}
                        alt={`Customer photo: ${productName}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/media:scale-[1.045]"
                      />
                      <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[9px] font-medium text-white backdrop-blur-md">
                        Customer photo
                      </span>
                    </a>
                  ) : review.video_url ? (
                    <a
                      href={review.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#34465F_0%,#172337_72%)] text-white"
                    >
                      <span className="absolute h-24 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                        <Play size={19} fill="currentColor" />
                      </span>
                      <span className="absolute bottom-3 left-3 text-[10px] font-medium text-white/90">
                        Customer video
                      </span>
                    </a>
                  ) : (
                    <div className="relative flex min-h-[142px] items-center overflow-hidden bg-[linear-gradient(135deg,#F5F8FC_0%,#EAF0F7_100%)] px-5 py-5 sm:min-h-[154px]">
                      <span className="absolute -right-4 -top-9 text-[150px] font-serif leading-none text-[#D9E4F1]">
                        ”
                      </span>
                      <div className="relative z-10">
                        <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2878D0] shadow-sm">
                          <MessageSquare size={15} />
                        </span>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#2878D0]">
                          Customer story
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-4 sm:p-[18px]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5 text-[#F5A623]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={13}
                            fill={index < review.rating ? "currentColor" : "none"}
                            strokeWidth={1.8}
                          />
                        ))}
                      </div>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-[#16865D]">
                          <BadgeCheck size={11} />
                          Verified buyer
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 truncate text-[9px] font-semibold uppercase tracking-[0.06em] text-[#0066E6]">
                      {productName}
                    </p>
                    {review.title && (
                      <h3 className="mt-1 text-[14px] font-semibold leading-snug text-[#202939]">
                        {review.title}
                      </h3>
                    )}
                    {review.content && (
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-[11px] leading-[1.65] text-[#596273]">
                        {review.content}
                      </p>
                    )}

                    <div className="mt-auto flex items-center gap-2 border-t border-[#ECEEF2] pt-3">
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#EEF4FB] text-[10px] font-bold uppercase text-[#2869A8]">
                        {(review.customer_name || "C").trim().charAt(0)}
                      </span>
                      <span className="truncate text-[10px] font-semibold text-[#344054]">
                        {review.customer_name || "Customer"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-[12px] text-[#7A8493] sm:px-8">
            Customer reviews will appear here once published.
          </div>
        )}
      </section>
    </section>
  );
}
















