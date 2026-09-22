import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import hero1 from "@/assets/hero/banner02.png";
import hero2 from "@/assets/hero/banner01.png";
import hero3 from "@/assets/hero/banner03.png";

const slides = [hero1, hero3];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  /* =====================================================
     AUTO SLIDE
  ====================================================== */

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [paused]);

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden

        /*
         * Mobile
         * Giữ tỷ lệ ngang để ảnh không bị crop.
         */
        aspect-video

        /*
         * Desktop
         * Vẫn giữ tỷ lệ ảnh nhưng thấp hơn,
         * tránh Hero chiếm gần toàn bộ màn hình.
         */
        lg:aspect-[16/7]
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =====================================================
          SLIDES
      ====================================================== */}

      {slides.map((slide, index) => (
        <img
          key={slide}
          src={slide}
          alt=""
          draggable={false}
          className={`
            absolute
            inset-0
            h-full
            w-full

            /*
             * Giữ ảnh phủ toàn bộ khung.
             * Khung Hero đã được đặt theo tỷ lệ ngang
             * nên hạn chế crop tối đa.
             */
            object-cover
            object-center

            transition-opacity
            duration-1000

            ${
              index === current
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />
      ))}

      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div className="absolute inset-0 bg-black/15" />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          container-x
          relative
          z-20
          flex
          h-full
          items-center
        "
      >
        <div
          className="
            max-w-[300px]
            text-white

            sm:max-w-[380px]

            /*
             * Desktop nhỏ gọn hơn
             */
            lg:max-w-[430px]
          "
        >
          {/* =================================================
              LABEL
          ================================================== */}

          <p
            className="
              mb-2
              text-[7px]
              font-medium
              uppercase
              tracking-[0.28em]
              text-white/90

              sm:mb-3
              sm:text-[9px]

              lg:mb-3
              lg:text-[10px]
              lg:tracking-[0.35em]
            "
          >
            THÀNH VIÊN MỚI
          </p>

          {/* =================================================
              TITLE
          ================================================== */}

          <h1
            className="
              font-display
              text-[25px]
              leading-[1.08]
              tracking-[-0.02em]

              sm:text-[34px]
              sm:leading-[1.06]

              /*
               * Desktop nhỏ hơn trước
               */
              lg:text-[44px]
              lg:leading-[1.08]
            "
          >
            Ưu đãi 5%
            <br />
            cho đơn đầu tiên.
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <p
            className="
              mt-2
              max-w-[260px]
              text-[9px]
              leading-4
              text-white/90

              sm:mt-3
              sm:max-w-[340px]
              sm:text-[12px]
              sm:leading-5

              /*
               * Desktop nhỏ gọn
               */
              lg:mt-4
              lg:max-w-[380px]
              lg:text-[13px]
              lg:leading-5
            "
          >
            Giảm tối đa 35.000đ · Không yêu cầu giá trị
            đơn hàng.
          </p>

          {/* =================================================
              BUTTONS
          ================================================== */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-2

              sm:mt-5
              sm:gap-3

              lg:mt-5
              lg:gap-3
            "
          >
            {/* -------------------------------------------------
                NHẬN ƯU ĐÃI
            -------------------------------------------------- */}

            <Link
              to="/voucher-register"
              className="
                flex
                h-8
                min-w-[92px]
                items-center
                justify-center
                rounded-full
                bg-white
                px-3
                text-[10px]
                font-semibold
                text-[#2F2F2F]
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#F5F5F5]

                sm:h-10
                sm:min-w-[120px]
                sm:px-4
                sm:text-[12px]

                /*
                 * Desktop nhỏ hơn
                 */
                lg:h-10
                lg:min-w-[135px]
                lg:px-5
                lg:text-[12px]
              "
            >
              Nhận ưu đãi
            </Link>

            {/* -------------------------------------------------
                XEM SẢN PHẨM
            -------------------------------------------------- */}

            <Link
              to="/shop"
              className="
                flex
                h-8
                min-w-[92px]
                items-center
                justify-center
                rounded-full
                border
                border-white/50
                bg-black/10
                px-3
                text-[10px]
                font-medium
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-white/15

                sm:h-10
                sm:min-w-[120px]
                sm:px-4
                sm:text-[12px]

                /*
                 * Desktop nhỏ hơn
                 */
                lg:h-10
                lg:min-w-[135px]
                lg:px-5
                lg:text-[12px]
              "
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          ARROW LEFT
      ====================================================== */}

      <button
        type="button"
        onClick={prev}
        aria-label="Ảnh trước"
        className="
          absolute
          left-2
          top-1/2
          z-30
          flex
          h-7
          w-7
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-black/15
          text-white
          backdrop-blur-md
          transition-all
          duration-300
          hover:bg-white
          hover:text-black

          sm:left-4
          sm:h-9
          sm:w-9

          lg:left-7
          lg:h-10
          lg:w-10
        "
      >
        <ChevronLeft
          className="
            h-4
            w-4

            sm:h-5
            sm:w-5

            lg:h-5
            lg:w-5
          "
        />
      </button>

      {/* =====================================================
          ARROW RIGHT
      ====================================================== */}

      <button
        type="button"
        onClick={next}
        aria-label="Ảnh tiếp theo"
        className="
          absolute
          right-2
          top-1/2
          z-30
          flex
          h-7
          w-7
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-black/15
          text-white
          backdrop-blur-md
          transition-all
          duration-300
          hover:bg-white
          hover:text-black

          sm:right-4
          sm:h-9
          sm:w-9

          lg:right-7
          lg:h-10
          lg:w-10
        "
      >
        <ChevronRight
          className="
            h-4
            w-4

            sm:h-5
            sm:w-5

            lg:h-5
            lg:w-5
          "
        />
      </button>

      {/* =====================================================
          INDICATOR
      ====================================================== */}

      <div
        className="
          absolute
          bottom-3
          left-1/2
          z-30
          flex
          -translate-x-1/2
          items-center
          gap-1.5

          sm:bottom-5
          sm:gap-2

          lg:bottom-5
          lg:gap-2.5
        "
      >
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Chuyển đến slide ${index + 1}`}
            className={`
              h-1
              rounded-full
              transition-all
              duration-300

              ${
                current === index
                  ? "w-6 bg-white sm:w-8 lg:w-8"
                  : "w-1 bg-white/40 hover:bg-white/70"
              }
            `}
          />
        ))}
      </div>

      {/* =====================================================
          SCROLL - DESKTOP
      ====================================================== */}

      <div
        className="
          absolute
          bottom-6
          right-7
          z-30
          hidden
          flex-col
          items-center
          text-white/70
          lg:flex
        "
      >
        <span
          className="
            mb-3
            rotate-90
            text-[9px]
            uppercase
            tracking-[0.35em]
          "
        >
          Scroll
        </span>

        <div className="h-10 w-px bg-white/35" />
      </div>
    </section>
  );
}