import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { formatUSDFromVND } from "@/lib/format";
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
  badge?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  variant?: "default" | "best-seller";
}

export function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price) || 0;

  const hasDiscount = oldPrice > price;

  const discountPercent =
    product.discount_percent ??
    (hasDiscount
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0);

  /**
   * Resolve product image.
   *
   * We try the project's storage helper first.
   * If the helper returns nothing or throws,
   * we fall back directly to image_url.
   */
  let imageUrl = "";

  if (product.image_url) {
    try {
      imageUrl =
        getImageUrl(product.image_url, "card") || product.image_url;
    } catch {
      imageUrl = product.image_url;
    }
  }

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block min-w-0"
    >
      {/* =========================================================
          PRODUCT IMAGE
          Apple-style:
          - light gray background
          - no border
          - large clean image
          - subtle hover zoom
      ========================================================= */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#F5F5F7]">
        <div className="aspect-square w-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                const img = event.currentTarget;

                // Prevent an infinite error loop
                if (img.dataset.fallbackApplied === "true") {
                  return;
                }

                img.dataset.fallbackApplied = "true";

                // Try the original database URL
                if (
                  product.image_url &&
                  img.src !== product.image_url
                ) {
                  img.src = product.image_url;
                }
              }}
              className="
                h-full
                w-full
                object-contain
                p-7
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.035]
              "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[12px] text-[#86868B]">
                No image
              </span>
            </div>
          )}
        </div>

        {/* =======================================================
            WISHLIST
            Very subtle. Only appears on hover.
        ======================================================= */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-[#1D1D1F]
            opacity-0
            shadow-sm
            backdrop-blur
            transition-all
            duration-200
            hover:bg-white
            group-hover:opacity-100
          "
        >
          <Heart
            size={16}
            strokeWidth={1.7}
          />
        </button>

        {/* =======================================================
            SMALL PRODUCT LABEL
            Keep only useful labels.
        ======================================================= */}
        {(variant === "best-seller" ||
          product.best_seller ||
          product.badge ||
          hasDiscount) && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {(variant === "best-seller" || product.best_seller) && (
              <span
                className="
                  rounded-full
                  bg-white/95
                  px-2.5
                  py-1
                  text-[9px]
                  font-semibold
                  tracking-[-0.01em]
                  text-[#1D1D1F]
                  shadow-sm
                  backdrop-blur
                "
              >
                Best Seller
              </span>
            )}

            {hasDiscount && discountPercent > 0 && (
              <span
                className="
                  rounded-full
                  bg-[#1D1D1F]
                  px-2.5
                  py-1
                  text-[9px]
                  font-semibold
                  tracking-[-0.01em]
                  text-white
                "
              >
                -{discountPercent}%
              </span>
            )}

            {!hasDiscount &&
              product.badge &&
              !product.best_seller && (
                <span
                  className="
                    rounded-full
                    bg-white/95
                    px-2.5
                    py-1
                    text-[9px]
                    font-medium
                    text-[#424245]
                    shadow-sm
                    backdrop-blur
                  "
                >
                  {product.badge}
                </span>
              )}
          </div>
        )}

        {/* =======================================================
            OUT OF STOCK
        ======================================================= */}
        {product.stock === 0 && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-white/25
              backdrop-blur-[1px]
            "
          >
            <span
              className="
                rounded-full
                bg-[#1D1D1F]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                text-white
              "
            >
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          PRODUCT INFORMATION
          Apple-style:
          name
          short functional description
          price
      ========================================================= */}
      <div className="px-0.5 pt-4">
        <h3
          className="
            line-clamp-2
            min-h-[42px]
            text-[15px]
            font-semibold
            leading-[21px]
            tracking-[-0.018em]
            text-[#1D1D1F]
            transition-colors
            duration-200
            group-hover:text-[#0071E3]
          "
        >
          {product.name}
        </h3>

        {/* Short product description */}
        <p
          className="
            mt-1.5
            line-clamp-1
            text-[12px]
            leading-[17px]
            text-[#86868B]
          "
        >
          Designed for your everyday setup.
        </p>

        {/* Price */}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
          <span
            className="
              text-[17px]
              font-semibold
              tracking-[-0.025em]
              text-[#1D1D1F]
            "
          >
            {formatUSDFromVND(price)}
          </span>

          {hasDiscount && (
            <span
              className="
                text-[12px]
                text-[#86868B]
                line-through
              "
            >
              {formatUSDFromVND(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}