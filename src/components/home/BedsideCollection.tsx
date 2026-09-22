import {
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

import { Link } from "@tanstack/react-router";
import { ProductCardProduct } from "@/components/product-card";
import { formatVND } from "@/lib/format";
import { getImageUrl } from "@/lib/storage";

import { motion } from "framer-motion";


interface Props {
  products: ProductCardProduct[];
}

export default function BedsideCollection({
  products,
}: Props) {

  if (!products?.length) return null;

  return (

    <section className="bg-[#FCFBF8] py-16 lg:py-20">

      <div className="container-x px-2 sm:px-4">

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">

          <div className="max-w-2xl">

            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.35em]
                text-neutral-500
              "
            >
              BEDSIDE COLLECTION
            </p>

            <h2
              className="
                mt-2
                font-display
                text-3xl
                sm:text-4xl
                lg:text-5xl
              "
            >
              Đồ Nội Thất
            </h2>

            <p
              className="
                mt-3
                text-[14px]
                leading-6
                text-neutral-500
              "
            >
              Bộ sưu tập đồ nội thất mang phong cách Scandinavian,
              tối giản và tinh tế cho không gian sống.
            </p>

          </div>
<Link
  to="/shop"
  search={{
    category: "noi-that-decor",
  }}
  className="
    inline-flex
    items-center
    gap-2
    text-sm
    font-medium
    transition
    hover:gap-1.5
  "
>
  Xem tất cả

  <ArrowRight size={17} />
</Link>

        </div>

        {/* GRID */}

        <div
  className="
    grid
    grid-cols-2

    gap-1

    px-0

    lg:grid-cols-4
    lg:gap-5
  "
>

          {products.map((product) => {

            const salePrice = Number(product.price);

const originalPrice = Number(product.old_price ?? product.price);

const saving = Math.max(0, originalPrice - salePrice);

const discountPercent =
  originalPrice > salePrice
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

            return (

              <Link
                key={product.id}
                to="/products/$slug"
                params={{
                  slug: product.slug,
                }}
                className="group block h-full"
              >

                <article
  className="
    flex
    h-full
    min-w-0
    flex-col

                    overflow-hidden

                    rounded-[18px]

                    border
                    border-[#ECE7DF]

                    bg-white

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >

                                {/* IMAGE */}

                  <div
                    className="
                      relative

                      aspect-square

                      overflow-hidden

                      bg-[#F8F6F2]
                    "
                  >

                    {(product.stock ?? 99) <= 5 && (

                      <span
                        className="
                          absolute
                          right-2
                          top-2
                          z-20

                          rounded-full

                          bg-white/95

                          px-2
                          py-[3px]

                          text-[9px]
                          font-medium

                          text-[#C77B55]

                          shadow
                        "
                      >
                        Còn {product.stock}
                      </span>

                    )}

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
    min-h-[118px]
    flex-1
    flex-col

    px-2.5
py-3
  "
>

  <h3
  className="
    min-h-[38px]

    line-clamp-2

    text-[13px]

    font-medium

    leading-5

    text-[#2F2F2F]
  "
>
                      {product.name}
                    </h3>

                    <div
                      className="
                        mt-1

                        flex
                        items-center

                        gap-1
                      "
                    >

                      <span
                        className="
                          text-[10px]

                          tracking-[1px]

                          text-[#C89B3C]
                        "
                      >
                        ★★★★★
                      </span>

                      <span
                        className="
                          text-[10px]

                          text-neutral-500
                        "
                      >
                        4.9
                      </span>

                    </div>

                    <div className="mt-1">

  <div className="flex items-end gap-2">

    <span className="text-[18px] font-bold tracking-tight text-[#C76A2F]">
      {formatVND(salePrice)}
    </span>

    {originalPrice > salePrice && (
  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
    -{discountPercent}%
  </span>
)}

  </div>

  <div className="mt-1 flex items-center gap-2">

    {originalPrice > salePrice && (
  <span className="text-[11px] text-neutral-400 line-through">
    {formatVND(originalPrice)}
  </span>
)}

  

  </div>

</div>
                                    

                    {(product.stock ?? 99) > 5 && (
                      <div className="h-5" />
                    )}

                    <div className="mt-1">

 {originalPrice > salePrice && (
  <span className="text-[12px] font-semibold tracking-tight text-[#1E3A8A]">
    Tiết kiệm {formatVND(saving)}
  </span>
)}
</div>

      <div className="mt-2 flex gap-2">


  <span
    className="
inline-flex
items-center
justify-center

whitespace-nowrap

rounded-full

bg-emerald-50

px-2.5
py-1

text-[10px]
font-medium

text-emerald-700
"
  >
    🚚 Free Ship
  </span>

  <span
    className="
inline-flex
items-center
justify-center

whitespace-nowrap

rounded-full

bg-sky-50

px-2.5
py-1

text-[10px]
font-medium

text-sky-700
"
  >
    ↩ 15 ngày
  </span>

</div>

<div className="mt-auto flex gap-2 pt-3">

  {/* Mua ngay */}

  <motion.button
  whileHover={{
    scale: 1.04,
    y: -2,
  }}
  whileTap={{
    scale: 0.98,
  }}
  animate={{
    scale: [1, 1.015, 1],
  }}
  transition={{
    scale: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
  className="
    flex-1
    h-10

    rounded-xl

    bg-[#DDF3E6]

    text-[#2E6B4E]
    text-[12px]
    font-semibold

    shadow-sm

    transition-colors
    duration-300

    hover:bg-[#CFEAD8]
  "
>
  Mua ngay
</motion.button>


  {/* Giỏ hàng */}
 

 <motion.button
  whileHover={{
    scale: 1.08,
    rotate: -5,
  }}
  whileTap={{
    scale: 0.95,
  }}
  className="
    flex
    h-10
    w-10

    items-center
    justify-center

    rounded-xl

    border
    border-[#D9E8DF]

    bg-[#F3FAF6]

    text-[#2E6B4E]

    transition-colors
    duration-300

    hover:bg-[#2E6B4E]
    hover:text-white
    hover:border-[#2E6B4E]
  "
>
  <motion.div
    animate={{
      rotate: [0, -10, 10, -10, 0],
    }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 6,
      ease: "easeInOut",
    }}
  >
    <ShoppingCart
      size={17}
      strokeWidth={2.2}
    />
  </motion.div>
</motion.button>

</div>

                  </div>

                </article>

              </Link>

            );

          })}

        </div>

      </div>

    </section>

  );

}