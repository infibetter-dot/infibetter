import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

import { getImageUrl } from "@/lib/storage";

export interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  price: number | string;

  old_price?: number | string;

  discount_percent?: number;
  image_url: string | null;
  stock?: number;

  best_seller?: boolean;

  rating?: number;

  review_count?: number;

  sold?: number;

  likes?: number;

  badge?: string;
}

/**
 * INFIBETTER PRICE SYSTEM
 * -----------------------
 * Database/base price = USD.
 *
 * ProductCard does NOT use:
 *   - formatUSDFromVND()
 *   - formatVND()
 *   - old VND conversion helpers
 *
 * This component formats the USD database price directly.
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

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: "en-US",
  VND: "vi-VN",
  CAD: "en-CA",
  AUD: "en-AU",
  EUR: "de-DE",
  GBP: "en-GB",
  SGD: "en-SG",
};

function parseUSD(value: unknown): number | null {
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

  if (!cleaned) {
    return null;
  }

  let normalized = cleaned;

  // Supports:
  // 40.78
  // 40,78
  // 1,299.99
  if (normalized.includes(",") && !normalized.includes(".")) {
    normalized = normalized.replace(",", ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatProductPrice(
  value: unknown,
  currency: CurrencyCode,
): string {
  const usd = parseUSD(value);

  if (usd === null) {
    return "—";
  }

  const safeCurrency: CurrencyCode =
    currency in USD_RATES ? currency : "USD";

  const rate = USD_RATES[safeCurrency];

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

  const fractionDigits = safeCurrency === "VND" ? 0 : 2;

  return new Intl.NumberFormat(CURRENCY_LOCALES[safeCurrency], {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);
}

function getProductStats(product: ProductCardProduct) {
  const seedSource = `${product.id}-${product.slug}-${product.name}`;
  let hash = 2166136261;

  for (let i = 0; i < seedSource.length; i++) {
    hash ^= seedSource.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const random = (min: number, max: number) => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;

    const normalized = (hash >>> 0) / 4294967295;
    return Math.floor(min + normalized * (max - min + 1));
  };

  const likes = product.likes ?? random(48, 185);
  const reviewCount = product.review_count ?? random(28, 148);
  const sold = product.sold ?? random(24, 125);
  const rating =
    product.rating ??
    Number((4.7 + random(0, 3) * 0.1).toFixed(1));

  return {
    likes,
    reviewCount,
    sold,
    rating,
  };
}

export function ProductCard({
  product,
  variant = "default",
}: {
  product: ProductCardProduct;
  variant?: "default" | "best-seller";
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    getCurrency(),
  );

  useEffect(() => {
    return subscribeToCurrencyChange(setCurrencyState);
  }, []);

  const price = parseUSD(product.price);
  const oldPrice = parseUSD(product.old_price);

  const { rating, reviewCount, sold } = getProductStats(product);

  const displayPrice = formatProductPrice(
    product.price,
    currency,
  );

  const displayOldPrice =
    oldPrice !== null
      ? formatProductPrice(product.old_price, currency)
      : null;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="
        group
        relative
        block
        overflow-hidden
        rounded-[10px]
        bg-white
        transition-all
        duration-300
        hover:-translate-y-[2px]
        hover:shadow-md
      "
    >
      {/* =================================================
          IMAGE
      ================================================== */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-t-[10px]
          bg-white
        "
      >
        {/* BEST SELLER */}
        {variant === "best-seller" && (
          <span
            className="
              absolute
              left-2
              top-2
              z-20
              rounded-[5px]
              bg-[#FF7E3F]
              px-2
              py-1
              text-[8px]
              font-bold
              tracking-[0.06em]
              text-white
            "
          >
            BEST SELLER
          </span>
        )}

        {/* LIKE */}
        {variant === "best-seller" && (
          <div
            className="
              absolute
              right-2
              top-2
              z-20
              flex
              items-center
              gap-1
              rounded-[5px]
              bg-white/95
              px-1.5
              py-1
              shadow-sm
              backdrop-blur
            "
          >
            <Heart
              size={11}
              className="fill-[#EF4444] text-[#EF4444]"
            />

            <span className="text-[9px] font-medium text-neutral-700">
              {getProductStats(product).likes}
            </span>
          </div>
        )}

        {/* LOW STOCK */}
        {product.stock !== undefined &&
          product.stock <= 3 &&
          product.stock > 0 && (
            <span
              className="
                absolute
                left-2
                top-2
                z-10
                rounded-[5px]
                bg-white/90
                px-1.5
                py-1
                text-[8px]
                font-medium
                text-neutral-700
              "
            >
              Low stock
            </span>
          )}

        {/* OUT OF STOCK */}
        {product.stock === 0 && (
          <span
            className="
              absolute
              left-2
              top-2
              z-10
              rounded-[5px]
              bg-neutral-900/85
              px-1.5
              py-1
              text-[8px]
              font-medium
              text-white
            "
          >
            Out of stock
          </span>
        )}

        {/* PRODUCT IMAGE */}
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url, "card")}
            alt={product.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-contain
              scale-[0.92]
              p-0
              transition-transform
              duration-500
              group-hover:scale-[0.96]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
      </div>

      {/* =================================================
          PRODUCT INFO
      ================================================== */}

      <div className="bg-white px-2.5 pb-2.5 pt-2">

        {/* PRODUCT NAME */}
        <h3
          className="
            line-clamp-2
            min-h-[30px]
            text-[11px]
            font-semibold
            uppercase
            leading-[15px]
            text-[#242424]
          "
        >
          {product.name}
        </h3>

        {/* RATING */}
        <div className="mt-1 flex items-center gap-1">
          <Star
            size={9}
            className="fill-[#F4B400] text-[#F4B400]"
          />

          <span className="text-[9px] font-medium text-neutral-700">
            {rating}
          </span>

          <span className="text-[9px] text-neutral-400">
            · {reviewCount} reviews
          </span>
        </div>

        {/* SOLD */}
        <p className="mt-0.5 text-[9px] text-neutral-500">
          {sold} sold
        </p>

        {/* OLD PRICE */}
        {price !== null &&
          oldPrice !== null &&
          oldPrice > price && (
            <p className="mt-1 text-[9px] text-neutral-400 line-through">
              {displayOldPrice}
            </p>
          )}

        {/* CURRENT PRICE */}
        <p
          className="
            mt-0.5
            text-[15px]
            font-semibold
            leading-5
            tracking-tight
            text-[#1D1D1F]
          "
        >
          {displayPrice}
        </p>

        {/* ACTION */}
        <div className="mt-1.5 flex gap-1">

          {/* BUY */}
          <div
            className="
              flex
              h-7
              flex-1
              items-center
              justify-center
              rounded-[6px]
              bg-[#0071E3]
              text-[9px]
              font-semibold
              text-white
              transition-colors
              group-hover:bg-[#0077ED]
            "
          >
            Buy now
          </div>

          {/* CART */}
          <div
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-[6px]
              border
              border-[#D2D2D7]
              bg-white
              text-[#1D1D1F]
              transition-colors
              group-hover:bg-[#F5F5F7]
            "
          >
            <ShoppingBag size={12} />
          </div>

        </div>
      </div>
    </Link>
  );
}
