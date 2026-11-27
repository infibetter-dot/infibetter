
import React from "react";

import caseBannerDesktop from "@/assets/hero/case_banner.png";
import caseBannerMobile from "@/assets/hero/case_banner mobile.png";

const PRODUCT_URL = "/products/infi-mag-105w-gan-charging-station";

const desktopUsps = [
  "Dual Retractable USB-C Cables",
  "2-in-1 Magnetic Wireless Charging",
  "Up to 65W USB-C PD",
  "EU / US / UK Plug Compatibility",
];

const FeaturedCaseSection: React.FC = () => {
  return (
    <section
      aria-label="INFI Mag 105W GaN Charging Station"
      className="relative left-1/2 z-0 -mt-px my-0 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#071A35]"
    >
      {/* MOBILE */}
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:hidden">
        <img
          src={caseBannerMobile}
          alt="INFI Mag 105W GaN Charging Station with retractable USB-C cables"
          width={1086}
          height={1448}
          fetchPriority="high"
          loading="eager"
          draggable={false}
          className="absolute inset-0 block h-full w-full object-cover object-center"
        />

        {/* Top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-[#F3F7FF]/95 via-[#F3F7FF]/75 to-transparent" />

        {/* Mobile Content */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-[5.5%] text-center">
          {/* Brand */}
          <p
            className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#E84B12]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
            }}
          >
            INFIBETTER · 105W GAN CHARGING
          </p>

          {/* Headline */}
          <h2
            className="mt-2 max-w-[320px] text-[clamp(1.45rem,6vw,1.85rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#10233F]"
            style={{
              fontFamily:
                '"SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
            }}
          >
            One Station.
            <span className="block">Every Charge.</span>
          </h2>

          {/* Subtitle */}
          <p
            className="mt-2 max-w-[285px] text-[10px] font-normal leading-[1.4] text-[#34465F]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 400,
            }}
          >
            Power your devices. Keep your desk tidy.
          </p>

          {/* Learn More Button - Apple style */}
          <a
            href={PRODUCT_URL}
            className="mt-3 inline-flex min-h-8 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-[#0071E3] transition-colors duration-200 hover:bg-[#F5F5F7] active:scale-[0.98]"
            style={{
              fontFamily:
                '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
            }}
          >
            Learn more
          </a>
        </div>
      </div>

      {/* DESKTOP: unchanged layout */}
      <div className="relative hidden w-full overflow-hidden sm:block sm:aspect-[16/9] lg:aspect-[16/6.5] xl:aspect-[16/6]">
        <img
          src={caseBannerDesktop}
          alt="INFI Mag 105W GaN Charging Station"
          fetchPriority="high"
          loading="eager"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="relative z-10 flex h-full w-full items-center px-10 lg:px-[8.5%]">
          <div className="w-full max-w-[540px] text-left text-white">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#FF6A2A] drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
              INFIBETTER · ALL-IN-ONE DESKTOP CHARGING
            </p>

            <h2 className="max-w-[520px] text-[clamp(2.1rem,4.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-white [text-shadow:0_3px_14px_rgba(0,0,0,0.5)]">
              One Station.
              <span className="block">Every Charge.</span>
            </h2>

            <p className="mt-5 max-w-[390px] text-base font-medium leading-7 text-white/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.65)]">
              Power your devices. Keep your desk tidy.
            </p>

            <div className="mt-6 flex max-w-[470px] flex-wrap gap-2">
              {desktopUsps.map((usp) => (
                <span
                  key={usp}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/70 bg-[#F5F8FF]/95 px-3 py-2 text-xs font-semibold text-[#10233F] shadow-[0_4px_14px_rgba(0,0,0,0.22)]"
                >
                  {usp}
                </span>
              ))}
            </div>

            <a
              href={PRODUCT_URL}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/70 bg-[#F5F8FF] px-8 py-3 text-xs font-medium uppercase tracking-[0.05em] text-[#10233F] shadow-[0_6px_22px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]"
              style={{
                fontFamily:
                  '"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 500,
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCaseSection;
