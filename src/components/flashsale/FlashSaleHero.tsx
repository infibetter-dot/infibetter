import {
  ArrowDown,
  Flame,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FlashSaleCountdown from "./FlashSaleCountdown";

interface Props {
  endAt: string;
}

export default function FlashSaleHero({
  endAt,
}: Props) {
  const scrollProducts = () => {
    document
      .getElementById("flash-products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[#E8E1D8]
        bg-[#F7F4EF]
        shadow-[0_18px_60px_rgba(74,62,48,0.08)]
      "
    >
      {/* =====================================================
          BACKGROUND DECOR
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-[#D97745]/10
          blur-[90px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/3
          h-80
          w-80
          rounded-full
          bg-[#E8C9B2]/20
          blur-[100px]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          grid
          max-w-[1380px]
          gap-10
          px-5
          py-8
          sm:px-8
          sm:py-12
          lg:grid-cols-[1.05fr_.95fr]
          lg:items-center
          lg:px-12
          lg:py-14
        "
      >
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="max-w-[620px]">
          {/* Badge */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#E3D7CA]
              bg-white/80
              px-3.5
              py-2
              shadow-[0_3px_12px_rgba(74,62,48,0.05)]
              backdrop-blur
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-[#D97745]
                text-white
              "
            >
              <Flame
                size={13}
                strokeWidth={2.2}
              />
            </span>

            <span
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#6B6258]
              "
            >
              Flash Sale
            </span>
          </div>

          {/* Heading */}

          <h1
            className="
              mt-6
              text-[42px]
              font-semibold
              leading-[0.98]
              tracking-[-0.045em]
              text-[#25211E]
              sm:text-[54px]
              lg:text-[68px]
            "
          >
            Flash Sale
            <span className="block text-[#D97745]">
              Giảm đến 40%
            </span>
          </h1>

          {/* Description */}

          <p
            className="
              mt-5
              max-w-[540px]
              text-[15px]
              leading-7
              text-[#756C63]
              sm:text-[16px]
            "
          >
            Ưu đãi đặc biệt dành cho một số sản phẩm
            trong thời gian giới hạn. Giá ưu đãi sẽ
            kết thúc khi Flash Sale kết thúc.
          </p>

          {/* CTA */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <Button
              size="lg"
              onClick={scrollProducts}
              className="
                h-12
                rounded-full
                bg-[#D97745]
                px-7
                text-[14px]
                font-semibold
                text-white
                shadow-[0_8px_24px_rgba(217,119,69,0.22)]
                transition-all
                hover:bg-[#C9683A]
                hover:shadow-[0_10px_28px_rgba(217,119,69,0.28)]
              "
            >
              Mua ngay
              <span className="ml-2">
                →
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={scrollProducts}
              className="
                h-12
                rounded-full
                border-[#D8CEC3]
                bg-white/70
                px-7
                text-[14px]
                font-semibold
                text-[#4D463F]
                hover:border-[#CDBEAF]
                hover:bg-white
              "
            >
              Xem sản phẩm
            </Button>
          </div>
        </div>

        {/* ===================================================
            COUNTDOWN
        =================================================== */}

        <div
          className="
            relative
            w-full
          "
        >
          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-[#E7DED3]
              bg-white
              p-5
              shadow-[0_12px_40px_rgba(74,62,48,0.08)]
              sm:p-7
            "
          >
            {/* Header */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F8EDE5]
                    text-[#D97745]
                  "
                >
                  <Timer
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8178]
                    "
                  >
                    Ưu đãi có hạn
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[16px]
                      font-semibold
                      text-[#2F2A26]
                    "
                  >
                    Kết thúc sau
                  </p>
                </div>
              </div>

              <span
                className="
                  rounded-full
                  bg-[#F8EDE5]
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[#D97745]
                "
              >
                Limited
              </span>
            </div>

            {/* Divider */}

            <div
              className="
                my-5
                h-px
                bg-[#EEE8E1]
              "
            />

            {/* Countdown */}

            <FlashSaleCountdown
              endAt={endAt}
            />

            {/* Bottom message */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-2
                rounded-xl
                bg-[#F8F5F1]
                px-4
                py-3
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#D97745]
                "
              />

              <p
                className="
                  text-[12px]
                  leading-5
                  text-[#756C63]
                "
              >
                Giá ưu đãi chỉ áp dụng trong thời gian
                Flash Sale.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCROLL INDICATOR
      ===================================================== */}

      <button
        type="button"
        onClick={scrollProducts}
        aria-label="Xem sản phẩm Flash Sale"
        className="
          absolute
          bottom-4
          left-1/2
          z-20
          hidden
          -translate-x-1/2
          items-center
          justify-center
          rounded-full
          border
          border-[#DDD3C9]
          bg-white/80
          p-2
          text-[#756C63]
          shadow-sm
          backdrop-blur
          transition
          hover:bg-white
          hover:text-[#D97745]
          lg:flex
        "
      >
        <ArrowDown
          size={17}
          strokeWidth={1.8}
        />
      </button>
    </section>
  );
}