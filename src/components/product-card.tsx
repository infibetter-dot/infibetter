import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Heart } from "lucide-react";

import { formatVND } from "@/lib/format";
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

  sold?: number;

  likes?: number;

  badge?: string;
}

export function ProductCard({
  product,
  variant = "default",
}: {
  product: ProductCardProduct;
  variant?: "default" | "best-seller";
}) {
  const oldPrice = Number(product.old_price ?? 0);
  const price = Number(product.price);

  const rating = product.rating ?? 4.9;
  const sold = product.sold ?? 0;

  // Rút gọn tên sản phẩm cho card
 

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`
        group
        relative
        block
        overflow-hidden
        rounded-[10px]
        border
        border-[#E8E4DD]
        bg-white
        transition-all
        duration-300
        hover:-translate-y-[2px]
        hover:shadow-md
        ${
          variant === "best-seller"
            ? "border-[#F0C8A8]"
            : ""
        }
      `}
    >
      {/* =================================================
          IMAGE
      ================================================== */}

      <div
        className="
          relative
          aspect-[1/0.92]
          overflow-hidden
          rounded-t-[10px]
          bg-[#F7F5F2]
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
              {product.likes ?? 128}
            </span>
          </div>
        )}

        {/* SẮP HẾT */}
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
              Sắp hết
            </span>
          )}

        {/* HẾT HÀNG */}
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
            Hết hàng
          </span>
        )}

        {/* PRODUCT IMAGE */}
        {product.image_url && (
          <img
            src={getImageUrl(product.image_url, "card")}
            alt={product.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.02]
            "
          />
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
            · 94 đánh giá
          </span>
        </div>

        {/* SOLD */}
        <p className="mt-0.5 text-[9px] text-neutral-500">
          Đã bán {sold > 0 ? sold : 64}
        </p>

        {/* OLD PRICE */}
        {oldPrice > price && (
          <p className="mt-1 text-[9px] text-neutral-400 line-through">
            {formatVND(oldPrice)}
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
            text-[#31966F]
          "
        >
          {formatVND(price)}
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
              bg-[#DDF3E7]
              text-[9px]
              font-semibold
              text-[#62A982]
              transition-colors
              group-hover:bg-[#CDEBDD]
            "
          >
            Mua ngay
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
              border-[#D6E8DC]
              bg-[#F7FBF8]
              text-[#62A982]
              transition-colors
              group-hover:bg-[#DDF3E7]
            "
          >
            <ShoppingBag size={12} />
          </div>

        </div>
      </div>
    </Link>
  );
}