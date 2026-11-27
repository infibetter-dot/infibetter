
import React from "react";

import compactDesign from "@/assets/hero/compact design.png";

const PRODUCT_URL =
  "/products/infi-maggo-5-in-1-10000mah-power-bank";

const MagGoSection: React.FC = () => {
  return (
    <section
      aria-label="INFI MagGo 5-in-1 10000mAh Power Bank"
      className="relative left-1/2 my-0 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#F5F5F7]"
    >
      {/* MOBILE BANNER */}
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:hidden">
        <img
          src={compactDesign}
          alt="INFI MagGo 5-in-1 10000mAh Magnetic Power Bank"
          width={1086}
          height={1448}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Light top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[42%] bg-gradient-to-b from-white/65 via-white/25 to-transparent" />

        {/* CONTENT OVER IMAGE */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-[5.5%] text-center">

          {/* BRAND */}
          <p
            className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#6E6E73]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
            }}
          >
            INFIBETTER · MAGGO SERIES
          </p>

          {/* HEADLINE */}
          <h2
            className="mt-2 max-w-[330px] text-[clamp(1.5rem,6vw,1.9rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#1D1D1F]"
            style={{
              fontFamily:
                '"SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
            }}
          >
            Power More.
            <span className="block">Carry Less.</span>
          </h2>

          {/* SUBTITLE */}
          <p
            className="mt-2 max-w-[290px] text-[10px] font-normal leading-[1.45] text-[#424245]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 400,
            }}
          >
            10,000mAh power. Wireless freedom.
            Everything you need, in one compact design.
          </p>

          {/* CTA */}
          <a
            href={PRODUCT_URL}
            className="mt-4 inline-flex min-h-10 min-w-[150px] items-center justify-center gap-3 rounded-full border border-[#D2D2D7] bg-white px-7 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#1D1D1F] shadow-sm transition-transform active:scale-[0.98]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
            }}
          >
            Learn More
            <span className="text-sm">→</span>
          </a>
        </div>
      </div>

      {/* DESKTOP BANNER */}
      <div className="relative hidden w-full overflow-hidden sm:block sm:aspect-[16/9] lg:aspect-[16/6.5] xl:aspect-[16/6]">
        <img
          src={compactDesign}
          alt="INFI MagGo 5-in-1 Magnetic Power Bank"
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Light top gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-transparent" />

        {/* CONTENT OVER IMAGE */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-8 pt-[3%] text-center">
          <div className="max-w-[650px]">

            {/* BRAND */}
            <p
              className="text-xs font-medium uppercase tracking-[0.2em] text-[#6E6E73]"
              style={{
                fontFamily:
                  '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 500,
              }}
            >
              INFIBETTER · MAGGO SERIES
            </p>

            {/* HEADLINE */}
            <h2
              className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-bold leading-[1] tracking-[-0.055em] text-[#1D1D1F]"
              style={{
                fontFamily:
                  '"SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
              }}
            >
              Power More.
              <span className="block">Carry Less.</span>
            </h2>

            {/* SUBTITLE */}
            <p
              className="mt-3 text-sm font-normal text-[#424245]"
              style={{
                fontFamily:
                  '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 400,
              }}
            >
              10,000mAh power. Wireless freedom. Everything in one.
            </p>

            {/* CTA */}
            <a
              href={PRODUCT_URL}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-3 rounded-full border border-[#D2D2D7] bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.06em] text-[#1D1D1F] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F5F5F7] active:scale-[0.98]"
              style={{
                fontFamily:
                  '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 500,
              }}
            >
              Learn More
              <span className="text-base">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MagGoSection;
