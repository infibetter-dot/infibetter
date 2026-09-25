import { Link } from "@tanstack/react-router";
import { formatUSDFromVND } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { getImageUrl } from "@/lib/storage";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";


interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image_url: string | null;
  stock?: number;

  color_preview?: string[];
}

interface Props {
  product: Product;
  badge?: string;
  highlight?: boolean;
}

export default function HomeProductCard({
  product,
  badge,
  highlight = false,
}: Props) {
  const salePrice = Number(product.price);

  const originalPrice = Math.round(salePrice * 1.35);

  return (
    <Link
      to="/products/$slug"
      params={{
        slug: product.slug,
      }}
      className="group block h-full"
    >
      <article
  className={clsx(
    `
    flex
    h-full
    flex-col

    overflow-hidden

    rounded-[24px]

    border
    border-[#E8DED2]

    bg-white

    shadow-[0_2px_8px_rgba(0,0,0,.04)]

    transition-all
    hover:-translate-y-3
hover:scale-[1.03]
hover:border-[#C77B55]
hover:shadow-[0_28px_60px_rgba(0,0,0,.14)]
    `,
          highlight && "ring-1 ring-[#C77B55]/20"
        )}
      >
        {/* IMAGE */}

        <div
  className="
    relative

    aspect-square

    overflow-hidden

    rounded-t-[24px]

    bg-gradient-to-b
    from-[#FBFAF8]
    via-[#F7F5F2]
    to-[#F1ECE5]
  "
>
          {badge && (
            <span
              className="
                absolute
                left-4
top-4
                z-20

                rounded-full

                bg-gradient-to-r
                from-[#FF8A00]
                to-[#FF4D4F]

              px-2.5
py-0.5

                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]

                text-white

                shadow-lg
              "
            >
              🔥 {badge}
            </span>
          )}

          {(product.stock ?? 99) <= 5 && (
            <span
              className="
                absolute
                right-4
                top-4
                z-20

                rounded-full

                bg-white/95

                px-2.5
                py-1

                text-[10px]
                font-medium

                text-[#C77B55]

                shadow
              "
            >
              Còn {product.stock}
            </span>
          )}

          
<div
  className="
    absolute
    inset-0

    flex
    items-center
    justify-center

    bg-gradient-to-b
    from-[#FBFAF8]
    via-[#F7F5F2]
    to-[#F1ECE5]
  "
>

<img
  src={product.image_url ? getImageUrl(product.image_url) : ""}
  alt={product.name}
  loading="lazy"
  className="
    max-w-[90%]
    max-h-[90%]
    object-contain
  "
/>

</div>
        </div>

        {/* CONTENT */}

        <div
          className="
            flex
            flex-1
            flex-col

            px-2.5
            py-3

            lg:px-4
            lg:py-4
          "
        >

         {/* PRODUCT NAME */}

<h3
  className="
    line-clamp-2

    min-h-[34px]

    text-[15px]
    font-medium

    leading-5

    text-[#2F2F2F]

    lg:text-[15px]
  "
>
  {product.name}
</h3>

{/* RATING + COLORS */}

<div className="mt-2 flex items-center justify-between">

  {/* Rating */}
  <div className="flex items-center gap-1">
    <span className="text-[11px] tracking-[1px] text-[#D4A017]">
      ★★★★★
    </span>

    <span className="text-[11px] font-medium text-neutral-700">
      4.9
    </span>

    <span className="text-[11px] text-neutral-400">
      (126)
    </span>
  </div>

  {/* Colors */}
  <div className="flex items-center gap-1">

    {product.color_preview?.slice(0, 3).map((color, index) => (
      <span
        key={`${product.id}-${index}`}
        className="
          h-3.5
          w-3.5
          rounded-full
          border
          border-white
          shadow-sm
          ring-1
          ring-neutral-200
          transition-all
          duration-300
          hover:scale-110
        "
        style={{
          backgroundColor: color,
        }}
      />
    ))}

    {(product.color_preview?.length ?? 0) > 3 && (
      <span className="ml-1 text-[10px] text-neutral-500">
        +{product.color_preview!.length - 3}
      </span>
    )}

  </div>

</div>

{/* Đã bán */}

<div className="mt-2 flex items-center justify-between gap-2">

  <span
    className="
      flex
      h-6
      flex-1

      items-center
      justify-center

      whitespace-nowrap

      rounded-full

      bg-emerald-50

      text-[10px]
      font-semibold

      text-emerald-700
    "
  >
    🚚 Freeship
  </span>

  <span
    className="
      flex
      h-6
      flex-1

      items-center
      justify-center

      whitespace-nowrap

      rounded-full

      bg-[#E8F3EC]

      text-[10px]
      font-semibold

      text-[#2E6B4E]
    "
  >
    ↩ 15 ngày
  </span>

</div>


{/* PRICE */}

<div className="mt-2">

  <div
    className="
      text-[11px]

      text-neutral-400

      line-through
    "
  >
    {formatUSDFromVND(originalPrice)}
  </div>

  <div
    className="
      mt-1

      text-[17px]

lg:text-[20px]
      font-bold

      text-[#C76A2F]

      lg:text-[20px]
    "
  >
    {formatUSDFromVND(salePrice)}
  </div>

<div
  className="
    mt-1
    text-[11px]
    font-medium
    text-green-600
  "
>
  Tiết kiệm {formatUSDFromVND(originalPrice - salePrice)}
</div>

</div>

{/* BENEFITS */}





{/* CTA */}

<div
className="
mt-6
flex
gap-3

pb-4
"
>

  {/* Buy Now */}
 
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
    y: {
      duration: 0.2,
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

  {/* Add to Cart */}
  <button
    className="
flex
h-9
w-9

items-center
justify-center

rounded-xl

border
border-[#D9E8DF]

bg-[#F3FAF6]

text-[#2E6B4E]

transition-all
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
    duration: 1.5,
    repeat: Infinity,
    repeatDelay: 4,
  }}
>
  <ShoppingCart
    size={16}
    strokeWidth={2.2}
  />
</motion.div>

  </button>
</div>


        </div>
      </article>
    </Link>
  );
}