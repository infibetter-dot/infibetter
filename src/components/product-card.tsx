import { Link } from "@tanstack/react-router";
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
  subtitle?: string;
  colors?: string[];
  is_new?: boolean;
}

function parsePrice(value: number | string | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === undefined || value === null || value === "") {
    return 0;
  }

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
  const isNew =
    product.is_new || product.badge?.toLowerCase() === "new";

  const isBestSeller =
    variant === "best-seller" &&
    !isNew &&
    product.badge?.toLowerCase() !== "new";

  const oldPrice = parsePrice(product.old_price);
  const currentPrice = parsePrice(product.price);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.10),0_2px_5px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.17),0_5px_12px_rgba(15,23,42,0.08)]"
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-white">
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

        {isNew && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-[#0866D9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_3px_8px_rgba(0,70,170,0.22)]">
            New
          </span>
        )}

        {isBestSeller && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[#292929] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            Best Seller
          </span>
        )}

        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2 py-1 text-[9px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Product details */}
      <div className="px-1.5 pb-2 pt-2.5">
        <h3 className="line-clamp-1 text-[15px] font-bold leading-[1.25] tracking-[-0.025em] text-[#111111] sm:text-[16px]">
          {product.name}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-[10px] font-medium leading-4 text-[#262626] sm:text-[11px]">
          {product.subtitle || "Designed for everyday use"}
        </p>

        {/* Price */}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[14px] font-bold leading-5 tracking-[-0.02em] text-[#111111] sm:text-[15px]">
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

        {/* Color swatches */}
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
