import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCardProduct } from "@/components/product-card";
import { formatVND } from "@/lib/format";
import { getImageUrl } from "@/lib/storage";
interface Props {
  products: ProductCardProduct[];
}

export default function FavoriteProducts({
  products,
}: Props) {
  return (
    <section className="container-x max-w-[1400px] py-32">

      <div className="mb-10 flex items-end justify-between gap-8">

  <div className="max-w-xl">

    <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
      BEST SELLER
    </p>

    <h2 className="mt-3 font-display text-4xl md:text-5xl">
      Được yêu thích nhất
    </h2>

    <p className="mt-4 text-neutral-600 leading-7">
      Những sản phẩm được khách hàng lựa chọn nhiều nhất
      trong bộ sưu tập Olive Living.
    </p>

  </div>

  <Link
    to="/best-seller"
    className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition"
  >
    Xem tất cả
    <ArrowRight size={18}/>
  </Link>

</div>

<div
  className="
    grid
    grid-cols-2
    gap-5

    md:grid-cols-2
    lg:grid-cols-4
  "
>

  {products.slice(0,4).map((product)=>{

    const salePrice = Number(product.price)

    const originalPrice = Math.round(
      salePrice * 1.35
    )

    const discount = Math.round(
      (
        (originalPrice-salePrice)/
        originalPrice
      )*100
    )

    return(

      <Link
        key={product.id}
        to="/products/$slug"
        params={{slug:product.slug}}
        className="group"
      >
      
      <article
  className="
    flex
    h-full
    flex-col

    overflow-hidden

    rounded-[20px]

    border
    border-orange-200

    bg-white

    transition-all
    duration-500

    hover:-translate-y-1
    hover:shadow-[0_10px_30px_rgba(249,115,22,.10)]
  "
>

  {/* IMAGE */}

  <div
    className="
      relative
      aspect-[4/5]
      overflow-hidden
      bg-[#F7F5F2]
    "
  >

    <span
      className="
        absolute
        left-3
        top-3
        z-20

        rounded-full

        bg-black

        px-2.5
        py-1

        text-[9px]
        font-semibold
        uppercase
        tracking-[0.18em]

        text-white
      "
    >
      BEST
    </span>

    <div
  className="
    absolute
    right-3
    top-3
    z-20

    flex
    items-center
    gap-1

    rounded-full

    bg-white/95

    px-2.5
    py-1

    shadow-md
    backdrop-blur
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#EF4444"
    className="h-3.5 w-3.5"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 016.5 4 5.4 5.4 0 0112 7.09 5.4 5.4 0 0117.5 4 4.5 4.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>

  <span className="text-[11px] font-semibold text-neutral-700">
    {Math.floor(Math.random() * 250) + 320}
  </span>
</div>

   

    <img
      src={getImageUrl(product.image_url, "card")}
      alt={product.name}
      loading="lazy"
      className="
        h-full
        w-full

        object-cover

        transition-all
        duration-700

        group-hover:scale-105
      "
    />

  </div>

  {/* CONTENT */}

  <div
    className="
      flex
      min-h-[165px]
      flex-1
      flex-col

      px-4
      py-4
    "
  >

    <h3
      className="
        line-clamp-2

        min-h-[40px]

        text-[14px]
        font-medium

        leading-5

        text-[#2F2F2F]
      "
    >
      {product.name}
    </h3>

    <div
      className="
        mt-2
        flex
        items-center
        gap-1
      "
    >
      <span className="text-[11px] tracking-[1px] text-[#D4A017]">
        ★★★★★
      </span>

      <span className="text-[11px] text-neutral-500">
        4.9
      </span>
    </div>

    <div className="mt-3">

  <div className="flex items-center gap-2">

   

    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
      -{discount}%
    </span>

  </div>

      <div
        className="
          text-[22px]
          font-bold
          leading-none
          tracking-tight
          text-[#2F2F2F]
        "
      >
        {formatVND(salePrice)}
      </div>

      <p className="mt-2 text-[13px] font-semibold text-green-600">
  Tiết kiệm{" "}
  {formatVND(originalPrice - salePrice)}
</p>

      <div
        className="
          mt-1
          text-[12px]
          text-neutral-400
          line-through
        "
      >
        {formatVND(originalPrice)}
      </div>

    </div>

    <div className="mt-3 h-7">

      {(product.stock ?? 99) <= 5 && (

        <span
          className="
            inline-flex
            items-center

            rounded-full

            bg-[#FFF5EC]

            px-3
            py-1

            text-[11px]
            font-medium

            text-[#C76A2F]
          "
        >
          🔥 Còn {product.stock} sản phẩm
        </span>

      )}

    </div>

    <div className="mt-auto pt-4">

      <div
        className="
          flex
          h-10
          w-full

          items-center
          justify-center
          gap-2

          rounded-xl

          border
          border-[#2F2F2F]

          bg-white

          text-[13px]
          font-semibold

          text-[#2F2F2F]

          transition-all
          duration-300

          group-hover:bg-[#2F2F2F]
          group-hover:text-white
        "
      >
        Mua ngay

        <ArrowRight
          size={15}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </div>

    </div>

  </div>

</article>
        
      </Link>

      );
  })}

</div>

    </section>
  );
}