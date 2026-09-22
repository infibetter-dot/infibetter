import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeProductCard from "./HomeProductCard";

interface Props {
  products: any[];
}

export default function BestSeller({ products }: Props) {

  const sliderRef = useRef<HTMLDivElement>(null);

const scrollProducts = (direction: "left" | "right") => {
  if (!sliderRef.current) return;

  sliderRef.current.scrollBy({
    left: direction === "right" ? 320 : -320,
    behavior: "smooth",
  });
};

  return (
    <section className="py-12 lg:py-16">

        <div className="w-full px-3 lg:px-8 xl:container-x">

      <div
  className="
    relative

    overflow-hidden

    rounded-2xl
    lg:rounded-[32px]

    border
    border-[#E6DDD2]

    ring-1
    ring-[#F4ECE3]

    bg-gradient-to-b
    from-[#FFFFFF]
    via-[#FCFAF8]
    to-[#F8F5F1]

  px-2
py-5

sm:px-4
sm:py-6

lg:px-8
lg:py-10

    shadow-[0_28px_80px_rgba(80,60,40,.07)]

    transition-all
    duration-500
  "
>
          {/* Accent Line */}

          <div
            className="
              absolute
              left-0
              top-0
              h-1
              w-full

              bg-gradient-to-r
              from-[#C77B55]
              via-[#E8C79C]
              to-[#C77B55]
            "
          />

          {/* Background Glow */}

          <div
            className="
              absolute
              right-0
              top-0

              h-40
              w-40

              rounded-full

              bg-[#C77B55]/5

              blur-3xl

              lg:h-72
              lg:w-72
            "
          />

          {/* Header */}

          <div
            className="
              relative

              mb-6

              flex
              flex-col

              gap-4

              lg:mb-8
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div>
              <span
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  bg-[#FFF5EC]

                  px-4
py-2

text-[11px]

font-semibold

tracking-[0.18em]

uppercase

shadow-sm

                  text-[#C76A2F]
                "
              >
                🔥 TOP SELLING
              </span>

              <h2
                className="
                  mt-3

                  text-2xl
                  font-semibold
                  leading-tight

                  text-[#2F2F2F]

                  lg:text-3xl
                "
              >
                Top bán chạy
              </h2>

              <p
                className="
                  mt-2

                  max-w-md

                  text-sm

                  leading-6

                  text-neutral-500

                  lg:max-w-xl
                "
              >
                Những sản phẩm được khách hàng Olive Living yêu thích và lựa
                chọn nhiều nhất.
              </p>

            <div className="mt-4 flex flex-wrap gap-2">

  <span
    className="
      rounded-full

      bg-[#FFF6EC]

      px-3
      py-1

      text-xs
      font-medium

      text-[#C77B55]
    "
  >
    ⭐ Khách hàng yêu thích
  </span>

  <span
    className="
      rounded-full

      bg-[#F7F5F2]

      px-3
      py-1

      text-xs

      text-neutral-600
    "
  >
    Cập nhật mỗi tuần
  </span>

</div>

            </div>

            
          </div>

          <div
  className="
    mb-6

    flex
    items-center
    justify-between

    border-b
    border-[#ECE4DA]

    pb-4
  "
>


</div>

{/* Products */}

<div className="relative">

  {/* Nút trái */}
  <button
    type="button"
    onClick={() => scrollProducts("left")}
    className="
      absolute
      left-0
      top-1/2
      z-30
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      border-[#E6DDD2]
      bg-white/95
      text-[#2F2F2F]
      shadow-md
      backdrop-blur-sm
      transition-all
      duration-200
      hover:scale-105
      hover:bg-white
      active:scale-95
    "
    aria-label="Sản phẩm trước"
  >
    <ChevronLeft className="h-5 w-5" />
  </button>

  {/* Slider */}
  <div
    ref={sliderRef}
    className="
      -mx-2
      flex
      snap-x
      snap-mandatory
      gap-3
      overflow-x-auto
      px-12
      pb-4
      scrollbar-none

      sm:gap-4
      sm:px-14

      lg:gap-6
      lg:px-14
    "
  >
    {products.map((product: any, index: number) => (
      <div
        key={product.id}
        className="
          w-[72%]
          shrink-0
          snap-start

          sm:w-[48%]

          md:w-[32%]

          lg:w-[calc((100%-72px)/4)]
          lg:min-w-[250px]
        "
      >
        <HomeProductCard
          product={product}
          badge={index === 0 ? "BEST SELLER" : undefined}
          highlight={index === 0}
        />
      </div>
    ))}
  </div>

  {/* Nút phải */}
  <button
    type="button"
    onClick={() => scrollProducts("right")}
    className="
      absolute
      right-0
      top-1/2
      z-30
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      border-[#E6DDD2]
      bg-white/95
      text-[#2F2F2F]
      shadow-md
      backdrop-blur-sm
      transition-all
      duration-200
      hover:scale-105
      hover:bg-white
      active:scale-95
    "
    aria-label="Sản phẩm tiếp theo"
  >
    <ChevronRight className="h-5 w-5" />
  </button>

</div>
</div>
</div>
</section>
);
}