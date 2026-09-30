import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import hero1 from "@/assets/hero/banner02.png";
import hero2 from "@/assets/hero/banner01.png";
import hero3 from "@/assets/hero/banner03.png";

const slides = [hero1, hero2, hero3];

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
        w-[calc(100%-48px)]
        max-w-[1280px]
        overflow-hidden
        rounded-[18px]

        /*
         * Mobile
         * Giá»¯ tá»· lá»‡ ngang Ä‘á»ƒ áº£nh khÃ´ng bá»‹ crop.
         */
        aspect-video

        /*
         * Desktop
         * Váº«n giá»¯ tá»· lá»‡ áº£nh nhÆ°ng tháº¥p hÆ¡n,
         * trÃ¡nh Hero chiáº¿m gáº§n toÃ n bá»™ mÃ n hÃ¬nh.
         */
        lg:aspect-[16/5.4]
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
             * Giá»¯ áº£nh phá»§ toÃ n bá»™ khung.
             * Khung Hero Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t theo tá»· lá»‡ ngang
             * nÃªn háº¡n cháº¿ crop tá»‘i Ä‘a.
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

      <div className="absolute inset-0 bg-gradient-to-r from-white/18 via-white/0 to-transparent" />

      {/* =====================================================
          CONTENT — INFIBETTER EDITORIAL PANEL
          A more ownable, minimal structure:
          no large white rectangle, asymmetric alignment,
          subtle glass surface, blue accent line, compact CTA.
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
            relative
            max-w-[310px]
            pl-5
            text-[#111827]

            sm:max-w-[390px]
            sm:pl-6

            lg:max-w-[450px]
            lg:pl-7
          "
        >
          {/* subtle vertical brand accent */}
          <div
            className="
              absolute
              left-0
              top-1
              bottom-1
              w-[2px]
              rounded-full
              bg-gradient-to-b
              from-[#007AFF]
              via-[#4DA3FF]
              to-transparent
            "
          />

          {/* eyebrow */}
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              sm:mb-3
              lg:mb-3
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#007AFF]
                shadow-[0_0_0_4px_rgba(0,122,255,0.10)]
              "
            />

            <span
              className="
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-[#667085]

                sm:text-[8px]

                lg:text-[9px]
                lg:tracking-[0.28em]
              "
            >
              INFIBETTER · APPLE ESSENTIALS
            </span>
          </div>

          {/* title */}
          <h1
            className="
              max-w-[330px]
              text-[28px]
              font-semibold
              leading-[1.02]
              tracking-[-0.045em]
              text-[#111827]

              sm:text-[38px]

              lg:max-w-[410px]
              lg:text-[48px]
            "
          >
            Your Apple
            <br />
            <span className="text-[#007AFF]">setup.</span>
          </h1>

          {/* description */}
          <p
            className="
              mt-2
              max-w-[260px]
              text-[9px]
              leading-4
              text-[#667085]

              sm:mt-3
              sm:max-w-[310px]
              sm:text-[11px]
              sm:leading-5

              lg:mt-3
              lg:max-w-[350px]
              lg:text-[12px]
              lg:leading-5
            "
          >
            Cases, charging and everyday gear —
            <br className="hidden sm:block" />
            designed to work beautifully together.
          </p>

          {/* CTA row */}
          <div
            className="
              mt-3
              flex
              items-center
              gap-2

              sm:mt-4
              sm:gap-2.5

              lg:mt-5
              lg:gap-3
            "
          >
            <Link
              to="/shop"
              className="
                group
                flex
                h-8
                items-center
                gap-4
                rounded-full
                bg-[#111827]
                px-4
                text-[9px]
                font-semibold
                text-white
                shadow-[0_8px_24px_rgba(17,24,39,0.16)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#007AFF]

                sm:h-9
                sm:px-4.5
                sm:text-[10px]

                lg:h-10
                lg:px-5
                lg:text-[11px]
              "
            >
              Shop accessories

              <ChevronRight
                size={13}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
              />
            </Link>

            <Link
              to="/shop"
              className="
                flex
                h-8
                items-center
                rounded-full
                border
                border-black/10
                bg-white/55
                px-3
                text-[9px]
                font-medium
                text-[#344054]
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-black/20
                hover:bg-white/75

                sm:h-9
                sm:px-3.5
                sm:text-[10px]

                lg:h-10
                lg:px-4
                lg:text-[11px]
              "
            >
              Explore
            </Link>
          </div>

          {/* compact use-case chips */}
          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-1.5

              sm:mt-4
              sm:gap-2

              lg:mt-4
            "
          >
            {["For travel", "At home", "On the go"].map((label) => (
              <span
                key={label}
                className="
                  rounded-full
                  border
                  border-black/10
                  bg-white/45
                  px-2.5
                  py-1
                  text-[7px]
                  font-medium
                  text-[#667085]
                  backdrop-blur-md

                  sm:px-3
                  sm:py-1.5
                  sm:text-[8px]

                  lg:text-[9px]
                "
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          ARROW LEFT
      ====================================================== */}

      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
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
        aria-label="Next slide"
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
            aria-label={`Go to slide ${index + 1}`}
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