import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCardProduct } from "@/components/product-card";
import { formatUSDFromVND } from "@/lib/format";
import { motion } from "framer-motion";
import HomeProductCard from "./HomeProductCard";

interface Props {
  products: ProductCardProduct[];
}

export default function NewArrival({ products }: Props) {
  if (!products?.length) return null;

  return (

   <section
  className="
    relative
    overflow-hidden

    bg-gradient-to-b
    from-[#FFFDF9]
    via-[#FAF7F2]
    to-[#FFFDF9]

    py-8

    lg:py-20
  "
>

  <div
    className="
      absolute
      left-10
      top-20

      h-[420px]
      w-[420px]

      rounded-full

      bg-[#E8D5BE]

      opacity-30

      blur-[140px]
    "
  />

      {/* Background */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#F5E8D8] opacity-40 blur-[150px]" />

      <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[#F2E6D6] opacity-30 blur-[180px]" />

       {/* Glow */}
  <div
    className="
      absolute
      left-1/2
      top-8
      h-48
      w-48
      -translate-x-1/2
      rounded-full
      bg-[#EFD9C2]
      opacity-30
      blur-[90px]
    "
  />

  <div className="container-x relative z-10 px-1 sm:px-2 lg:px-0">

      

        

        {/* HEADER */}

      {/* HERO */}

<div
  className="
    mb-16

    grid
    grid-cols-1

    items-center
    gap-8

    md:grid-cols-[42%_58%]

    lg:grid-cols-[1.1fr_.9fr]
    lg:gap-14
  "
>

  {/* LEFT */}

  <motion.div
    initial={{
      opacity: 0,
      x: -40,
    }}
    whileInView={{
      opacity: 1,
      x: 0,
    }}
    viewport={{
      once: true,
    }}

    transition={{
  duration: 0.8,
  ease: "easeOut",
}}
  
    className="
relative

overflow-hidden

rounded-[24px]

border

border-[#E9C88C]

shadow-[0_20px_60px_rgba(233,200,140,.22)]

before:absolute
before:inset-0

before:rounded-[24px]

before:border

before:border-[#F7DCA8]

before:opacity-60
"
  >

    <motion.img
      src="/editorial/amber-glass.jpg"
      alt="Amber Glass"

      animate={{
        scale: [1, 1.025, 1],
      }}

      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}

      className="
        w-full

        h-[340px]

        md:h-[420px]

        lg:h-[620px]

        object-cover
      "
    />

    <div
      className="
        absolute

        inset-0

        bg-gradient-to-t

        from-[#EAD7BF]/20

        to-transparent
      "
    />

  </motion.div>



{/* Gold Light Sweep */}
<motion.div
  className="
    absolute
top-16
bottom-16

    -left-24
    z-20

    w-16

    rounded-full

    rotate-[18deg]

    bg-gradient-to-r
    from-transparent
    via-[#FFF4CF]
    to-transparent

    opacity-20

    blur-[16px]

    pointer-events-none
  "
  animate={{
    x: [-180, 850],
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    repeatDelay: 5,
    ease: "linear",
  }}
/>

{/* Soft Gold Glow */}
<div
  className="
    absolute
    inset-0

    bg-gradient-to-tr
    from-[#E6C88A]/5
    via-transparent
    to-[#FFF7E2]/8

    pointer-events-none
  "
/>
  {/* RIGHT */}

  <motion.div
    initial={{
      opacity: 0,
      x: 40,
    }}
    whileInView={{
      opacity: 1,
      x: 0,
    }}
    viewport={{
      once: true,
    }}
    transition={{
      duration: 0.8,
      delay: 0.2,
    }}
    className="
      min-w-0

      text-center

      md:text-left
    "
  >

    <p
      className="
        text-xs

        uppercase

        tracking-[0.35em]

        text-[#B88B67]
      "
    >
      NEW ARRIVAL
    </p>

    <motion.h2
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
        delay: 0.3,
      }}
      className="
        mt-3

        font-display

        text-[40px]

        leading-[1.05]

        sm:text-[52px]

        lg:text-7xl
      "
    >
      Designed for Modern Living
    </motion.h2>

    <div
      className="
        mt-6

        space-y-4

        text-[15px]

        leading-7

        text-neutral-600

        lg:text-[17px]

        lg:leading-8
      "
    >

      <p>
        Có những món đồ không chỉ đơn thuần là vật dụng trong ngôi nhà.
      </p>

      <p>
        Chúng mang đến cảm giác thư giãn, tạo nên sự cân bằng và khiến mỗi góc nhỏ trở nên ấm áp hơn.
      </p>

    </div>

    <motion.div
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
      }}
      className="mt-8"
    >

      <Link
        to="/shop"

        className="
          group

          relative

          inline-flex

          items-center

          gap-3

          overflow-hidden

          rounded-full

          bg-[#DDF3E6]

          px-8
          py-4

          font-semibold

          text-[#2E6B4E]

          shadow-lg

          transition-all
          duration-500
        "
      >

        <span
          className="
            absolute

            left-[-120%]

            top-0

            h-full

            w-[45%]

            rotate-12

            bg-white/35

            blur-md
          "
          style={{
            animation: "shine 4s linear infinite",
          }}
        />

        <span className="relative z-10">
          Khám phá toàn bộ bộ sưu tập
        </span>

        <motion.div
          animate={{
            x: [0, 8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <ArrowRight size={18} />
        </motion.div>

      </Link>

    </motion.div>

  </motion.div>

</div>

        {/* GRID */}

       <div
  className="
    grid
    grid-cols-2

    gap-0.5

    lg:grid-cols-4
    lg:gap-5
  "
>

          {products.slice(0, 8).map((product, index) => {

            const salePrice = Number(product.price);

            const originalPrice = Math.round(salePrice * 1.35);

            const discount = Math.round(
              ((originalPrice - salePrice) / originalPrice) * 100
            );

           return (

  <motion.div
  className="w-full"
    key={product.id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.6,
      delay: index * 0.08,
    }}
  >
    <HomeProductCard
      product={product}
      badge="NEW"
      highlight={index === 0}
    />
  </motion.div>

);

              

        

          })}

        </div>

        {products.length > 8 && (

  <div className="mt-6 flex justify-center">

    <Link
      to="/shop"
      className="
        inline-flex
        items-center
        gap-2

        rounded-full

        border
        border-[#D9D3CA]

        bg-white

        px-8
        py-3

        text-sm
        font-medium

        transition-all
        duration-300

        hover:bg-black
        hover:text-white
      "
    >
      Xem thêm {products.length - 8} sản phẩm

      <ArrowRight size={16} />

    </Link>

  </div>

)}

      </div>

      <div className="mb-2" />

      <style>{`
@keyframes shine {

  0%{
    left:-120%;
  }

  45%{
    left:-120%;
  }

  100%{
    left:150%;
  }

}
`}</style>

    </section>
  );
}