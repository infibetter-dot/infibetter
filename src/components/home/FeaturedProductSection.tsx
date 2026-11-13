
import React, { useState } from "react";

import chargerImage1 from "@/assets/hero/25w_fast.png";
import chargerImage2 from "@/assets/hero/25w_fast1.png";
import chargerImage3 from "@/assets/hero/25w_fast2.png";

interface FeaturedProductSectionProps {
  name: string;
  description: string;
  image: string;
  slug: string;
  price?: number;
  eyebrow?: string;
}

const chargerImages = [chargerImage1, chargerImage2, chargerImage3];

// PRODUCT USP
const productUsps = [
  { label: "25W Fast Charging", icon: "bolt" },
  { label: "TEC Cooling", icon: "cooling" },
  { label: "7-in-1 Wireless", icon: "wireless" },
];

// USP ICONS
const UspIcon = ({ type }: { type: string }) => {
  const iconProps = {
    viewBox: "0 0 24 24",
    className: "h-[13px] w-[13px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (type === "cooling") {
    return (
      <svg {...iconProps}>
        <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (type === "wireless") {
    return (
      <svg {...iconProps}>
        <path d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 8 0M11 15a2 2 0 0 1 2 0" />
        <circle
          cx="12"
          cy="19"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />
    </svg>
  );
};

const FeaturedProductSection: React.FC<
  FeaturedProductSectionProps
> = ({
  name,
  description,
  image,
  slug,
  price,
  eyebrow = "INFIBETTER FEATURED",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const galleryImages =
    chargerImages.length > 0 ? chargerImages : [image];

  const prevImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (touchStart === null) return;

    const difference =
      touchStart - event.changedTouches[0].clientX;

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
        {/* LEFT — PRODUCT INFORMATION */}
        <div
          className="
            order-2 flex min-w-0 flex-col
            items-center justify-center
            px-5 py-7 text-center
            sm:px-12 sm:py-12
            lg:order-1 lg:px-10 lg:py-10
            xl:px-14
          "
        >
          <span className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF4D00] sm:mb-5 sm:text-[11px]">
            {eyebrow}
          </span>

          <h2 className="max-w-[520px] text-[27px] font-bold leading-[1.02] tracking-[-0.045em] text-[#171717] sm:text-[40px] sm:leading-[1.08] lg:text-[clamp(34px,3.1vw,46px)]">
            {name}
          </h2>

          <p className="mt-3 max-w-[440px] text-[13px] leading-[1.55] text-[#777777] sm:mt-5 sm:text-base sm:leading-[1.8]">
            {description}
          </p>

          {/* THREE USP PILLS — ALWAYS ONE ROW */}
          <div
            className="
              mt-5 flex w-full max-w-full
              flex-nowrap items-center justify-center
              gap-1.5 sm:mt-6 sm:gap-2
            "
          >
            {productUsps.map((usp) => (
              <div
                key={usp.label}
                className="
                  inline-flex min-w-0 flex-shrink
                  min-h-[32px] items-center justify-center
                  gap-1 whitespace-nowrap rounded-full
                  border border-[#EEEEEE] bg-white
                  px-2 py-1.5
                  text-[8px] font-medium tracking-[-0.02em]
                  text-[#333333]
                  shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                  sm:min-h-[34px] sm:flex-none
                  sm:gap-1.5 sm:px-3.5 sm:text-[10px]
                "
              >
                <span className="flex h-3 w-3 flex-shrink-0 items-center justify-center text-[#1683FF]">
                  <UspIcon type={usp.icon} />
                </span>

                <span className="whitespace-nowrap">
                  {usp.label}
                </span>
              </div>
            ))}
          </div>

          {/* PRODUCT PRICE */}
          {typeof price === "number" && price > 0 && (
            <p className="mt-3 text-lg font-semibold text-[#171717] sm:mt-5 sm:text-xl">
              ${price.toFixed(2)}
            </p>
          )}

          {/* SHOP NOW BUTTON */}
          <a
            href={`/products/${slug}`}
            className="
              group relative mt-5 inline-flex min-h-[42px] min-w-[150px]
              items-center justify-center gap-3 overflow-hidden rounded-full
              border border-white/80 bg-gradient-to-b from-white via-white/90 to-[#EDEDED]/90
              px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.04em]
              text-[#171717]
              shadow-[0_4px_14px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,1)]
              backdrop-blur-xl transition-all duration-300 ease-out
              hover:-translate-y-0.5 hover:border-white
              hover:shadow-[0_8px_24px_rgba(0,0,0,0.16),inset_0_1px_2px_white]
              active:translate-y-0 active:scale-[0.97]
              sm:mt-7
              before:absolute before:inset-0 before:rounded-full
              before:bg-gradient-to-br before:from-white/90 before:via-transparent
              before:to-white/10 before:opacity-80 before:content-['']
            "
          >
            <span className="pointer-events-none absolute left-[15%] top-0 h-full w-[35%] -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70 blur-[2px]" />

            <span className="relative z-10">Shop Now</span>

            <span className="relative z-10 text-sm transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* RIGHT — FULL-BLEED PRODUCT GALLERY */}
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
          {galleryImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${name} gallery ${index + 1}`}
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
              className={`
                absolute inset-0 block h-full w-full
                object-cover object-center
                transition-opacity duration-500 ease-in-out
                ${
                  activeIndex === index
                    ? "z-10 opacity-100"
                    : "z-0 opacity-0"
                }
              `}
            />
          ))}

          {/* PROMOTIONAL COPY */}
          <div
            className="
              pointer-events-none absolute left-[6%] top-[20%] z-20
              flex w-[45%] max-w-[310px] flex-col items-start
              text-left text-[#172033]
            "
          >
            <h3
              className="
                max-w-full text-[14px] font-bold leading-[1.12]
                tracking-[-0.04em] text-[#172033]
                sm:text-[20px] sm:leading-[1.1]
                lg:text-[clamp(22px,2.1vw,32px)]
              "
            >
              iPhone 25W
              <span className="block">Fast Charging</span>
            </h3>

            <p
              className="
                mt-2 whitespace-nowrap text-[34px] font-extrabold
                leading-[0.95] tracking-[-0.065em] text-[#172033]
                sm:mt-3 sm:text-[48px]
                lg:text-[clamp(48px,4.2vw,64px)]
              "
            >
              2× Faster
            </p>

            <span className="mt-3 block h-[3px] w-12 rounded-full bg-[#FF4D00] sm:mt-4 sm:h-1 sm:w-16" />
          </div>

          {/* PREVIOUS IMAGE */}
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#171717] shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 sm:left-4 sm:h-9 sm:w-9"
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

          {/* NEXT IMAGE */}
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#171717] shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 sm:right-4 sm:h-9 sm:w-9"
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
            {activeIndex + 1} / {galleryImages.length}
          </div>

          {/* IMAGE DOTS */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-md sm:bottom-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                aria-current={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/55 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductSection;
