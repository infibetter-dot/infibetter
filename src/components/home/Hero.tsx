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
        w-[calc(100%-32px)]
        max-w-[1280px]
        overflow-hidden
        rounded-[16px]
        bg-white
        sm:w-[calc(100%-40px)]
        sm:rounded-[18px]
        lg:w-[calc(100%-48px)]
        lg:aspect-[16/5.4]
        lg:bg-transparent
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =====================================================
          MOBILE HERO
          - Card layout like the reference UI
          - Image first, content below
          - No desktop overlay on mobile
      ====================================================== */}
      <div className="block lg:hidden">
        <div className="relative w-full overflow-hidden rounded-[12px] bg-[#F3F5F7] aspect-[880/400]">
          {slides.map((slide, index) => (
            <img
              key={`mobile-${slide}`}
              src={slide}
              alt=""
              draggable={false}
              className={`
                absolute inset-0
                h-full w-full
                object-contain object-center
                transition-opacity duration-700
                ${index === current ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}
        </div>

        <div className="px-5 pb-5 pt-4 text-center">
          <h1 className="text-[27px] font-bold leading-[1.02] tracking-[-0.045em] text-[#171717]">
            Your Apple <span className="text-[#0877E8]">setup.</span>
          </h1>

          <p className="mt-2 text-[11px] leading-4 text-neutral-500">
            Cases, bands &amp; chargers.
          </p>

          <div className="mt-3 flex justify-center gap-1.5">
            {["For travel", "At home", "In the car"].map((label) => (
              <span
                key={label}
                className="
                  rounded-full
                  border border-[#D9DDE3]
                  bg-white
                  px-3 py-1.5
                  text-[9px]
                  font-medium
                  text-[#4B5563]
                "
              >
                {label}
              </span>
            ))}
          </div>

          <Link
            to="/shop"
            className="
              group mt-3 flex h-11 w-full
              items-center justify-center
              gap-2
              rounded-[10px]
              bg-[#0877E8]
              px-4
              text-[11px] font-semibold text-white
              shadow-[0_7px_18px_rgba(8,119,232,0.20)]
              transition-all duration-300
              active:scale-[0.99]
            "
          >
            Shop accessories
            <ChevronRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Mobile dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {slides.map((_, index) => (
            <button
              key={`mobile-dot-${index}`}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                h-1 rounded-full transition-all duration-300
                ${
                  current === index
                    ? "w-5 bg-[#0877E8]"
                    : "w-1.5 bg-[#D1D5DB]"
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          DESKTOP HERO
      ====================================================== */}
      <div className="relative hidden h-full lg:block">
        {slides.map((slide, index) => (
          <img
            key={`desktop-${slide}`}
            src={slide}
            alt=""
            draggable={false}
            className={`
              absolute inset-0
              h-full w-full
              object-cover object-center
              transition-opacity duration-1000
              ${index === current ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-white/18 via-white/0 to-transparent" />

        <div className="container-x relative z-20 flex h-full items-center">
          <div className="relative max-w-[450px] pl-7 text-[#111827]">
            <div
              className="
                absolute left-0 top-1 bottom-1 w-[2px]
                rounded-full
                bg-gradient-to-b
                from-[#007AFF] via-[#4DA3FF] to-transparent
              "
            />

            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF] shadow-[0_0_0_4px_rgba(0,122,255,0.10)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#667085]">
                INFIBETTER · APPLE ESSENTIALS
              </span>
            </div>

            <h1 className="max-w-[410px] text-[48px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827]">
              Your Apple
              <br />
              <span className="text-[#007AFF]">setup.</span>
            </h1>

            <p className="mt-3 max-w-[350px] text-[12px] leading-5 text-[#667085]">
              Cases, charging and everyday gear —
              <br />
              designed to work beautifully together.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/shop"
                className="
                  group flex h-10 items-center gap-4 rounded-full
                  bg-[#111827] px-5 text-[11px] font-semibold text-white
                  shadow-[0_8px_24px_rgba(17,24,39,0.16)]
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:bg-[#007AFF]
                "
              >
                Shop accessories
                <ChevronRight size={13} />
              </Link>

              <Link
                to="/shop"
                className="
                  flex h-10 items-center rounded-full
                  border border-black/10 bg-white/55 px-4
                  text-[11px] font-medium text-[#344054]
                  backdrop-blur-md transition-all duration-300
                  hover:border-black/20 hover:bg-white/75
                "
              >
                Explore
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["For travel", "At home", "On the go"].map((label) => (
                <span
                  key={label}
                  className="
                    rounded-full border border-black/10 bg-white/45
                    px-3 py-1.5 text-[9px] font-medium text-[#667085]
                    backdrop-blur-md
                  "
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="
            absolute left-7 top-1/2 z-30 flex h-10 w-10
            -translate-y-1/2 items-center justify-center rounded-full
            bg-black/15 text-white backdrop-blur-md transition-all
            duration-300 hover:bg-white hover:text-black
          "
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="
            absolute right-7 top-1/2 z-30 flex h-10 w-10
            -translate-y-1/2 items-center justify-center rounded-full
            bg-black/15 text-white backdrop-blur-md transition-all
            duration-300 hover:bg-white hover:text-black
          "
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={`desktop-dot-${index}`}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                h-1 rounded-full transition-all duration-300
                ${
                  current === index
                    ? "w-8 bg-white"
                    : "w-1 bg-white/40 hover:bg-white/70"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
