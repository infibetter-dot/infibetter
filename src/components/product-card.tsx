import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { getImageUrl } from "@/lib/storage";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

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
  subtitle?: string;
  colors?: string[];
  is_new?: boolean;
}

function parsePrice(value: number | string | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === undefined || value === null || value === "") return 0;

  const normalized = value
    .toString()
    .replace(/[^0-9.,-]/g, "")
    .replace(/,(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value: number | string | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsePrice(value));
}

export function ProductCard({
  product,
  variant = "default",
}: {
  product: ProductCardProduct;
  variant?: "default" | "best-seller";
}) {
  const isNew = product.is_new || product.badge?.toLowerCase() === "new";
  const isBestSeller =
    variant === "best-seller" && !isNew && product.badge?.toLowerCase() !== "new";

  const oldPrice = parsePrice(product.old_price);
  const currentPrice = parsePrice(product.price);
  const cart = useCart();
  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    cart.add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: currentPrice,
        image: product.image_url,
      },
      1,
    );
    toast.success("Added to cart");
  }

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      aria-label={`View ${product.name}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#E9EBEF] bg-white p-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.055)] transition-[border-color,box-shadow] duration-300 hover:border-[#D9DEE7] hover:shadow-[0_8px_20px_rgba(15,23,42,0.09)] sm:p-3"
    >
      {/* Badge and quick-link are kept OUTSIDE the image so they never cover the product */}
      <div className="mb-1 flex h-8 shrink-0 items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          {isNew && (
            <span className="inline-flex rounded-full bg-[#0866D9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-[0_2px_6px_rgba(0,70,170,0.18)]">
              New
            </span>
          )}
          {isBestSeller && (
            <span className="inline-flex rounded-full border border-[#ECEEF1] bg-white/95 px-2.5 py-1 text-[8px] font-semibold tracking-[0.06em] text-[#454B55] shadow-[0_1px_4px_rgba(15,23,42,0.045)]">
              Best Seller
            </span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-gradient-to-br from-white via-white/90 to-[#E8EDF3]/80 text-[#343A44] shadow-[0_2px_6px_rgba(15,23,42,0.075),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-xl transition-all duration-200 group-hover:shadow-[0_3px_7px_rgba(15,23,42,0.10)]"
        >
          <span className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white to-white/10" />
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="relative z-10 h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.5 14.5L14.5 5.5M6.5 5.5H14.5V13.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Clean product image: no badge or button overlays */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[16px] bg-white">
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url, "card")}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-0 transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}

        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2 py-1 text-[9px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Fixed title/subtitle zones help align prices across cards */}
      <div className="flex min-w-0 flex-1 flex-col px-1 pb-2 pt-2.5 sm:px-1.5">
        <h3
          title={product.name}
          className="min-h-[36px] break-words text-[13px] font-bold leading-[1.35] tracking-[-0.02em] text-[#171717] sm:min-h-[41px] sm:text-[15px]"
        >
          {product.name}
        </h3>

        <p className="mt-1 min-h-[28px] line-clamp-2 text-[10px] font-medium leading-[1.4] text-[#7A8493] sm:min-h-[31px] sm:text-[11px]">
          {product.subtitle || "Designed for everyday use"}
        </p>

        <div className="mt-1.5 flex min-h-7 min-w-0 items-center justify-between gap-2 sm:min-h-8">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[15px] font-bold leading-5 tracking-[-0.02em] text-[#0066E6] sm:text-[16px]">
              {formatPrice(product.price)}
            </span>

            {product.old_price !== undefined &&
              product.old_price !== null &&
              oldPrice > currentPrice && (
                <span className="text-[10px] font-medium text-[#9CA3AF] line-through sm:text-[11px]">
                  {formatPrice(product.old_price)}
                </span>
              )}
          </div>

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className="group/add relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-gradient-to-br from-white via-white/90 to-[#E7ECF2]/85 text-[#222831] shadow-[0_2px_6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_3px_8px_rgba(15,23,42,0.12)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white to-white/10" />
            <ShoppingCart
              aria-hidden="true"
              className="relative z-10 h-3.5 w-3.5"
              strokeWidth={1.8}
            />
          </button>
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5" aria-label="Available colors">
            {product.colors.slice(0, 6).map((color, index) => (
              <span
                key={`${color}-${index}`}
                title={color}
                className="h-[15px] w-[15px] rounded-full border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:h-[17px] sm:w-[17px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
