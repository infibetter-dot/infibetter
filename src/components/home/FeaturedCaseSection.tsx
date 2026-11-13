
import React, { useState } from "react";

import caseBanner1 from "@/assets/hero/case_banner.png";
import caseBanner2 from "@/assets/hero/case_banner1.png";
import caseBanner3 from "@/assets/hero/case_banner2.png";

const caseImages = [caseBanner1, caseBanner2, caseBanner3];

const caseUsps = [
  { label: "Up to 105W", icon: "bolt" },
  { label: "Retractable cables", icon: "cable" },
  { label: "Magnetic wireless", icon: "magnetic" },
];

const UspIcon = ({ type }: { type: string }) => {
  if (type === "cable") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          d="M8 3v5M16 3v5M6 8h12v3a6 6 0 0 1-6 6v4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 3v2M18 3v2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "magnetic") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          d="M7 4v6a5 5 0 0 0 10 0V4M7 4H4v6a8 8 0 0 0 16 0V4h-3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const FeaturedCaseSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const prevImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? caseImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((prev) =>
      prev === caseImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;

    const difference = touchStart - event.changedTouches[0].clientX;

    if (Math.abs(difference) > 45) {
      difference > 0 ? nextImage() : prevImage();
    }

    setTouchStart(null);
  };

  return (
    <section className="relative left-1/2 my-6 w-screen -translate-x-1/2 px-3 sm:static sm:my-10 sm:w-full sm:translate-x-0 sm:px-6 lg:my-12 lg:px-8">
      <div
        className="
          mx-auto grid w-full max-w-[1440px]
          grid-cols-1 overflow-hidden
          rounded-[22px] border border-[#E7E7E7]
          bg-white shadow-sm
          lg:grid-cols-2
        "
      >
        {/* LEFT — CASE INFORMATION */}
        <div
          className="
            order-2 flex min-w-0 flex-col
            items-center justify-center
            px-5 py-7 text-center
            sm:px-12 sm:py-12
            lg:order-1 lg:px-10 lg:py-10 xl:px-14
          "
        >
          <span className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF4D00] sm:mb-5 sm:text-[11px]">
            Qi2.2 Fast Charging
          </span>

          <h2 className="max-w-[520px] text-[27px] font-bold leading-[1.02] tracking-[-0.045em] text-[#171717] sm:text-[40px] sm:leading-[1.08] lg:text-[clamp(34px,3.1vw,46px)]">
            MAGCOOL X7 25W
          </h2>

          <p className="mt-3 max-w-[440px] text-[13px] leading-[1.55] text-[#777777] sm:mt-5 sm:text-base sm:leading-[1.8]">
            7-in-1 Wireless Charging with 25W Qi2.2 Fast Charging & TEC
            Cooling.
          </p>

          {/* PRODUCT USP PILLS */}
          <div className="mt-5 flex max-w-full flex-wrap items-center justify-center gap-2 sm:mt-6">
            {caseUsps.map((usp) => (
              <div
                key={usp.label}
                className="
                  inline-flex min-h-[32px] items-center justify-center
                  gap-1.5 whitespace-nowrap rounded-full
                  border border-[#EEEEEE] bg-white
                  px-3 py-1.5
                  text-[9px] font-medium tracking-[-0.01em]
                  text-[#333333]
                  shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                  sm:min-h-[34px] sm:px-3.5 sm:text-[10px]
                "
              >
                <span className="text-[#1683FF]">
                  <UspIcon type={usp.icon} />
                </span>
                {usp.label}
              </div>
            ))}
          </div>

          {/* SHOP NOW — GLOW + LIGHT SWEEP */}
          <a
            href="/products/magcool-x7-25w"
            className="
              group relative mt-5 inline-flex min-h-[44px] min-w-[155px]
              items-center justify-center gap-3 overflow-hidden rounded-full
              border border-white/90
              bg-gradient-to-b from-white via-white to-[#EEEEEE]
              px-6 py-2
              text-[11px] font-semibold uppercase tracking-[0.05em]
              text-[#171717]
              shadow-[0_4px_16px_rgba(0,0,0,0.10)]
              animate-shop-glow
              transition-all duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_6px_24px_rgba(0,120,255,0.18),0_0_18px_rgba(255,255,255,1)]
              active:translate-y-0 active:scale-[0.97]
              sm:mt-6
            "
          >
            {/* Moving light sweep */}
            <span
              className="
                pointer-events-none absolute inset-y-0 -left-1/2
                w-1/2 -skew-x-[22deg]
                bg-gradient-to-r from-transparent via-white to-transparent
                opacity-80 blur-[2px]
                animate-shop-shine
              "
            />

            {/* Inner highlight */}
            <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/80" />

            <span className="relative z-10">Shop Now</span>

            <span className="relative z-10 text-sm transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* RIGHT — IMAGE GALLERY */}
        <div
          className="
            relative order-1 isolate h-[260px] w-full min-w-0
            overflow-hidden bg-[#F3F3F3]
            sm:h-[360px]
            lg:order-2 lg:h-full lg:min-h-[420px]
            xl:min-h-[460px]
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {caseImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`MAGCOOL X7 gallery ${index + 1}`}
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
              className={`
                absolute inset-0 block h-full w-full
                object-cover object-center
                transition-opacity duration-500 ease-in-out
                ${activeIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"}
              `}
            />
          ))}

          {/* PREVIOUS BUTTON */}
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous image"
            className="
              absolute left-3 top-1/2 z-20
              flex h-8 w-8 -translate-y-1/2
              items-center justify-center rounded-full
              border border-white/70 bg-white/80
              text-[#171717] shadow-md backdrop-blur-md
              transition-all hover:scale-105 hover:bg-white
              active:scale-95
              sm:left-4 sm:h-9 sm:w-9
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* NEXT BUTTON */}
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next image"
            className="
              absolute right-3 top-1/2 z-20
              flex h-8 w-8 -translate-y-1/2
              items-center justify-center rounded-full
              border border-white/70 bg-white/80
              text-[#171717] shadow-md backdrop-blur-md
              transition-all hover:scale-105 hover:bg-white
              active:scale-95
              sm:right-4 sm:h-9 sm:w-9
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* IMAGE COUNTER */}
          <div className="absolute right-3 top-3 z-20 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-medium tracking-wider text-white backdrop-blur-md sm:right-4 sm:top-4">
            {activeIndex + 1} / {caseImages.length}
          </div>

          {/* IMAGE DOTS */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-md sm:bottom-4">
            {caseImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                aria-current={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    activeIndex === index
                      ? "w-6 bg-white"
                      : "w-2 bg-white/55 hover:bg-white/90"
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCaseSection;
