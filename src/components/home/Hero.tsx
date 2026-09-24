import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
        mx-auto
        mt-2
        w-full
        max-w-[1320px]
        overflow-hidden
        rounded-[10px]
        border
        border-[#E2E4E8]
        bg-[#F7F7F7]
        shadow-[0_2px_10px_rgba(15,23,42,0.04)]

        aspect-[16/5.25]

        sm:mt-3
        sm:rounded-[11px]

        lg:mt-3
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
            object-cover
            object-center
            transition-opacity
            duration-700

            ${
              index === current
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />
      ))}

      {/* =====================================================
          VERY LIGHT OVERLAY
          Only to keep text readable.
      ====================================================== */}

      <div className="absolute inset-0 bg-white/[0.03]" />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          z-20
          flex
          items-center
        "
      >
        <div
          className="
            ml-[7%]
            w-[310px]
            max-w-[34%]

            sm:ml-[7%]
            sm:w-[350px]

            lg:w-[380px]
          "
        >
          {/* =================================================
              TITLE
          ================================================== */}

          <h1
            className="
              text-[25px]
              font-semibold
              leading-[1.05]
              tracking-[-0.045em]
              text-[#111827]

              sm:text-[31px]

              lg:text-[35px]
            "
          >
            Your Apple{" "}
            <span className="text-[#0877E8]">
              setup.
            </span>
          </h1>

          {/* =================================================
              SUBTITLE
          ================================================== */}

          <p
            className="
              mt-2
              text-[10px]
              font-medium
              leading-4
              text-[#475569]

              sm:text-[11px]

              lg:text-[12px]
            "
          >
            Cases, bands & chargers.
          </p>

          {/* =================================================
              PRODUCT LINE
          ================================================== */}

          <p
            className="
              mt-1
              text-[7px]
              font-medium
              tracking-[0.01em]
              text-[#64748B]

              sm:text-[8px]

              lg:text-[9px]
            "
          >
            iPhone · Watch · AirPods
          </p>

          {/* =================================================
              PRIMARY CTA
          ================================================== */}

          <Link
            to="/shop"
            className="
              group
              mt-3
              flex
              h-8
              w-[185px]
              items-center
              justify-between
              rounded-[6px]
              bg-[#0877E8]
              px-3.5
              text-[9px]
              font-semibold
              text-white
              shadow-[0_4px_12px_rgba(8,119,232,0.20)]
              transition-all
              duration-200
              hover:bg-[#0668CC]
              hover:shadow-[0_6px_16px_rgba(8,119,232,0.25)]
              active:scale-[0.98]

              sm:mt-4
              sm:h-9
              sm:w-[205px]
              sm:px-4
              sm:text-[10px]

              lg:h-9
              lg:w-[220px]
              lg:text-[10px]
            "
          >
            <span>Shop accessories</span>

            <ArrowRight
              size={12}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>

          {/* =================================================
              QUICK TAGS
          ================================================== */}

          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
              sm:gap-2
            "
          >
            <Link
              to="/shop"
              className="
                flex
                h-7
                items-center
                rounded-[6px]
                border
                border-[#D7DCE2]
                bg-white/90
                px-2.5
                text-[7px]
                font-medium
                text-[#334155]
                backdrop-blur-sm
                transition-all
                duration-200
                hover:border-[#0877E8]
                hover:bg-white
                hover:text-[#0877E8]

                sm:px-3
                sm:text-[8px]
              "
            >
              For travel
            </Link>

            <Link
              to="/shop"
              className="
                flex
                h-7
                items-center
                rounded-[6px]
                border
                border-[#D7DCE2]
                bg-white/90
                px-2.5
                text-[7px]
                font-medium
                text-[#334155]
                backdrop-blur-sm
                transition-all
                duration-200
                hover:border-[#0877E8]
                hover:bg-white
                hover:text-[#0877E8]

                sm:px-3
                sm:text-[8px]
              "
            >
              At home
            </Link>

            <Link
              to="/shop"
              className="
                flex
                h-7
                items-center
                rounded-[6px]
                border
                border-[#D7DCE2]
                bg-white/90
                px-2.5
                text-[7px]
                font-medium
                text-[#334155]
                backdrop-blur-sm
                transition-all
                duration-200
                hover:border-[#0877E8]
                hover:bg-white
                hover:text-[#0877E8]

                sm:px-3
                sm:text-[8px]
              "
            >
              In the car
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          LEFT ARROW
      ====================================================== */}

      <button
        type="button"
        onClick={prev}
        aria-label="Previous banner"
        className="
          absolute
          left-3
          top-1/2
          z-30
          flex
          h-7
          w-7
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-white/70
          bg-white/75
          text-[#334155]
          shadow-sm
          backdrop-blur-sm
          transition-all
          duration-200
          hover:bg-white
          hover:text-[#0877E8]

          sm:left-4
          sm:h-8
          sm:w-8

          lg:left-5
          lg:h-9
          lg:w-9
        "
      >
        <ChevronLeft size={15} strokeWidth={1.8} />
      </button>

      {/* =====================================================
          RIGHT ARROW
      ====================================================== */}

      <button
        type="button"
        onClick={next}
        aria-label="Next banner"
        className="
          absolute
          right-3
          top-1/2
          z-30
          flex
          h-7
          w-7
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-white/70
          bg-white/75
          text-[#334155]
          shadow-sm
          backdrop-blur-sm
          transition-all
          duration-200
          hover:bg-white
          hover:text-[#0877E8]

          sm:right-4
          sm:h-8
          sm:w-8

          lg:right-5
          lg:h-9
          lg:w-9
        "
      >
        <ChevronRight size={15} strokeWidth={1.8} />
      </button>

      {/* =====================================================
          SLIDE INDICATOR
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
        "
      >
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              h-1
              rounded-full
              transition-all
              duration-300

              ${
                current === index
                  ? "w-5 bg-[#0877E8]"
                  : "w-1.5 bg-[#64748B]/35"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}

