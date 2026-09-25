import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock3,
  Star,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProductCardProduct } from "@/components/product-card";
import { formatUSDFromVND } from "@/lib/format";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/storage";

interface Props {
  product: ProductCardProduct;
}

export default function EditorialFeature({
  product,
}: Props) {
  const salePrice = Number(product.price);

  const originalPrice = Math.round(
    salePrice * 1.35
  );

  const discount = Math.round(
    ((originalPrice - salePrice) /
      originalPrice) *
      100
  );

  const [timeLeft, setTimeLeft] = useState({
  hours: 8,
  minutes: 12,
  seconds: 31,
});

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      let { hours, minutes, seconds } = prev;

      if (seconds > 0) {
        seconds--;
      } else {
        seconds = 59;

        if (minutes > 0) {
          minutes--;
        } else {
          minutes = 59;

          if (hours > 0) {
            hours--;
          } else {
            hours = 8;
            minutes = 12;
            seconds = 31;
          }
        }
      }

      return {
        hours,
        minutes,
        seconds,
      };
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

  return (

<section className="relative overflow-hidden bg-[#F7F3EE] py-16 lg:py-28">

  {/* BACKGROUND */}

  <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-[#EFE2D5] opacity-40 blur-[150px]" />

  <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#EFE2D5] opacity-40 blur-[150px]" />

  <div className="container-x relative">

    <div
      className="
        grid
        grid-cols-1
        items-center
        gap-12
        lg:grid-cols-[1.05fr_.95fr]
        lg:gap-16
      "
    >

      {/* ========================= */}
      {/* LEFT IMAGE */}
      {/* ========================= */}

      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .8 }}
        className="
    group
    relative
    w-full
    lg:h-full
        "
      >

        <div
  className="
    h-full
    overflow-hidden
    rounded-[24px]
    lg:rounded-[36px]
    shadow-[0_20px_60px_rgba(0,0,0,.08)]
  "
>

          <img
  src={getImageUrl(product.image_url, "card")}
  alt={product.name}
  className="
    w-full
    h-full
    aspect-[4/5]
    object-cover
    transition-transform
    duration-700
    group-hover:scale-105
  "
/>

        </div>

        {/* LABEL */}

        <div className="absolute left-5 top-5 lg:left-7 lg:top-7">

          <span
            className="
              rounded-full
              bg-black
              px-4
              py-1.5
              text-[9px]
              font-medium
              uppercase
              tracking-[0.25em]
              text-white
            "
          >

            EDITOR'S PICK

          </span>

        </div>

        {/* FLOAT CARD */}

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
          className="
            absolute
            left-5
            bottom-5
            lg:left-7
            lg:bottom-7
            rounded-2xl
            bg-white/95
            px-4
            py-3
            shadow-xl
            backdrop-blur
          "
        >

          <div className="flex items-center gap-3">

            <div className="text-2xl">

              🔥

            </div>

            <div>

              <p className="text-xs font-semibold">

                Bestseller tuần này

              </p>

              <p className="mt-1 text-xs text-neutral-500">

                128+ sản phẩm đã bán

              </p>

            </div>

          </div>

        </motion.div>

      </motion.div>

      {/* ========================= */}
{/* RIGHT CONTENT */}
{/* ========================= */}

<motion.div
  initial={{ opacity: 0, x: 60 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: .8 }}
  className="
  w-full
  max-w-full
  lg:max-w-[420px]
  lg:ml-auto
"
>

  <p
    className="
      text-[9px]
      font-medium
      uppercase
      tracking-[0.3em]
      text-neutral-500
    "
  >
    FEATURED COLLECTION
  </p>

  <h2
    className="
      mt-1
max-w-[420px]
font-display
text-[22px]
leading-tight
sm:text-[28px]
lg:text-[34px]
    "
  >
    {product.name}
  </h2>

  <p
    className="
      mt-1
max-w-[420px]
text-[13px]
leading-6
lg:text-[13px]
    "
  >
    Thiết kế Scandinavian hiện đại,
    cân bằng giữa tính nghệ thuật và công năng,
    mang đến điểm nhấn tinh tế cho không gian sống.
  </p>

  {/* FEATURES */}

  <div className="mt-5 space-y-3">

    {[
      {
        title: "Premium Materials",
        desc: "Chất liệu cao cấp được tuyển chọn kỹ lưỡng.",
      },
      {
        title: "Scandinavian Design",
        desc: "Đường nét tối giản chuẩn Bắc Âu.",
      },
      {
        title: "Handmade Finish",
        desc: "Hoàn thiện thủ công với độ chính xác cao.",
      },
    ].map((item) => (

      <div
        key={item.title}
        className="
          flex
          items-start
          gap-3
        "
      >

        <div
         className="
absolute
right-4
top-4
lg:right-6
lg:top-6
flex
h-10
w-10
lg:h-10
lg:w-12
items-center
justify-center
rounded-full
bg-gradient-to-br
from-[#FF9A1F]
to-[#FF5C1A]
text-xs
lg:text-base
font-bold
text-white
shadow-xl
"
        >

          ✓

        </div>

        <div>

          <h4
            className="
              text-[13px]
              font-semibold
            "
          >
            {item.title}
          </h4>

          <p
            className="
             mt-0.5
text-[10px]
leading-5
            "
          >
            {item.desc}
          </p>

        </div>

      </div>

    ))}

  </div>

  {/* PRICE CARD */}

  <motion.div
  whileHover={{
    y: -4,
    boxShadow: "0 24px 60px rgba(0,0,0,.08)",
  }}
  transition={{ duration: .35 }}
  className="
    mt-10
    w-full
    max-w-[480px]
    overflow-hidden
    rounded-[24px]
    border
    border-[#E9DED2]
    bg-white
    shadow-lg
  "
>

  {/* HEADER */}

  <div className="border-b border-[#F2E8DD] px-4 py-3">

    <div className="relative flex items-start gap-3 pr-12 lg:pr-20">

      <div className="flex-1">

        <span
          className="
            inline-flex
            rounded-full
            bg-[#C77B55]
            px-2.5
py-1
text-[9px]
            font-semibold
            uppercase
            tracking-[.18em]
            text-white
          "
        >
          Giá hôm nay
        </span>

        <div className="mt-1 flex items-end gap-2">

          <span
            className="
              text-[28px]
lg:text-[30px]
              font-bold
              leading-none
            "
          >
            {formatUSDFromVND(salePrice)}
          </span>

          <span
            className="
              pb-1
              text-xs
              text-neutral-400
              line-through
            "
          >
            {formatUSDFromVND(originalPrice)}
          </span>

        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">

          <span
            className="
              rounded-full
              bg-[#FFF4EA]
              px-2.5
py-1
text-[9px]
              font-medium
              text-[#C76A2F]
            "
          >
            Tiết kiệm {formatUSDFromVND(originalPrice - salePrice)}
          </span>

          <span
            className="
              rounded-full
              bg-[#EEF8EF]
              px-3
              py-1.5
              text-[12px]
              font-medium
              text-[#2E7D32]
            "
          >
            Voucher 150K
          </span>

        </div>

      </div>

      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="
          flex
          h-10
          w-12
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-[#FF9A1F]
          to-[#FF5C1A]
          text-lg
          font-bold
          text-white
        "
      >
        -{discount}%
      </motion.div>

    </div>

  </div>

  {/* BODY */}

  <div className="px-4 py-3">

    {/* COUNTDOWN */}

<div className="mb-3 rounded-xl bg-[#FFF7F0] p-2.5">

  <div className="flex items-center gap-2">

    <Clock3
      size={15}
      className="text-[#C77B55]"
    />

    <span className="text-xs font-semibold text-[#C77B55]">

      Ưu đãi kết thúc sau

    </span>

  </div>

  <div className="mt-1 grid grid-cols-3 gap-2">

    <div className="rounded-lg bg-black py-1.5 text-center text-white">

      <div className="text-base lg:text-xl font-bold">

        {String(timeLeft.hours).padStart(2, "0")}

      </div>

      <div className="mt-1 text-[9px] uppercase tracking-[.2em]">

        Hours

      </div>

    </div>

    <div className="rounded-lg bg-black py-1.5 text-center text-white">

      <div className="text-base lg:text-xl font-bold">

        {String(timeLeft.minutes).padStart(2, "0")}

      </div>

      <div className="mt-1 text-[9px] uppercase tracking-[.2em]">

        Minutes

      </div>

    </div>

    <div className="rounded-lg bg-black py-1.5 text-center text-white">

      <div className="text-base lg:text-xl font-bold">

        {String(timeLeft.seconds).padStart(2, "0")}

      </div>

      <div className="mt-1 text-[9px] uppercase tracking-[.2em]">

        Seconds

      </div>

    </div>

  </div>

</div>

    <Link
      to="/products/$slug"
      params={{
        slug: product.slug,
      }}
      className="
        group
        flex
        h-10
        lg:h-10
        w-full
        items-center
        justify-center
        gap-3
        rounded-full
        bg-black
        text-xs
        font-semibold
        text-white
        transition-all
        duration-300
        hover:bg-[#C77B55]
      "
    >

      Khám phá ngay

      <ArrowRight
        size={18}
        className="transition group-hover:translate-x-1"
      />

    </Link>

        <div className="mt-3 border-t border-[#F2E8DD] pt-3">

      <div className="grid grid-cols-3 gap-3">

        <div className="text-center">

          <Truck
            size={16}
            className="mx-auto text-[#C77B55]"
          />

          <p className="mt-1 text-[10px] font-medium">

            Freeship

          </p>

        </div>

        <div className="text-center">

          <ShieldCheck
            size={16}
            className="mx-auto text-[#C77B55]"
          />

          <p className="mt-1 text-[10px] font-medium">

            Bảo hành

          </p>

        </div>

        <div className="text-center">

          <Star
            size={16}
            className="mx-auto text-[#C77B55]"
          />

          <p className="mt-1 text-[10px] font-medium">

            Đánh giá 4.9

          </p>

        </div>

      </div>

      <p
        className="
          mt-3
          text-center
          text-[10px]
          leading-4
          text-neutral-500
        "
      >
        Mỗi sản phẩm của Olive Living đều được tuyển chọn
        kỹ lưỡng nhằm mang lại trải nghiệm sử dụng lâu dài,
        hài hòa giữa công năng và giá trị thẩm mỹ.
      </p>

    </div>

  </div>

</motion.div>

</motion.div>

</div>

</div>

</section>

);

}