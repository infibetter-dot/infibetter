
import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Cable,
  RefreshCw,
  Zap,
} from "lucide-react";

import powerStationImage from "@/assets/hero/power_station.png";

const PowerStationSection: React.FC = () => {
  return (
    <section
      className="
        relative left-1/2 my-6 w-screen
        -translate-x-1/2 px-3
        sm:static sm:my-10 sm:w-full
        sm:translate-x-0 sm:px-6
        lg:my-12 lg:px-8
      "
    >
      <div
        className="
          mx-auto grid w-full max-w-[1440px]
          grid-cols-1 overflow-hidden
          rounded-[22px] border border-[#E7E7E7]
          bg-white shadow-sm
          lg:grid-cols-2
        "
      >
        {/* =====================================================
            LEFT — FULL-BLEED PRODUCT GALLERY
        ====================================================== */}
        <div
          className="
            relative order-1 isolate
            h-[260px] w-full min-w-0
            overflow-hidden bg-[#F3F3F3]
            sm:h-[360px]
            lg:h-full lg:min-h-[420px]
            xl:min-h-[460px]
          "
        >
          <img
            src={powerStationImage}
            alt="INFIBETTER MAGSTATION PRO 105W Power Station"
            draggable={false}
            loading="lazy"
            className="
              absolute inset-0 block
              h-full w-full
              object-cover object-center
            "
          />

          {/* PRODUCT LABEL */}
          <div
            className="
              absolute right-3 top-3 z-30
              rounded-full bg-black/45
              px-3 py-1.5
              text-[9px] font-semibold
              tracking-wide text-white
              backdrop-blur-md
              sm:right-4 sm:top-4
            "
          >
            105W POWER STATION
          </div>

          {/* =================================================
              PROMOTIONAL COPY — LEFT EMPTY IMAGE AREA
          ================================================== */}
          <div
            className="
              pointer-events-none absolute
              left-[4%] top-1/2 z-20
              flex w-[41%] max-w-[235px]
              -translate-y-1/2
              flex-col items-start
              text-left text-[#171717]
            "
          >
            {/* POWER BADGE */}
            <span
              className="
                inline-flex min-h-[25px]
                items-center justify-center
                rounded-full
                bg-gradient-to-b
                from-[#39A5FF] to-[#0066E6]
                px-3 py-1
                text-[16px] font-extrabold
                leading-none tracking-[-0.04em]
                text-white
                shadow-[0_3px_10px_rgba(0,102,230,0.25)]
                sm:min-h-[29px]
                sm:px-4 sm:text-[20px]
              "
            >
              105W
            </span>

            {/* HEADLINE */}
            <h3
              className="
                mt-2 w-full
                text-[19px] font-extrabold
                leading-[1.05]
                tracking-[-0.055em]
                text-[#171717]
                sm:text-[24px]
                lg:text-[clamp(23px,2.2vw,30px)]
              "
            >
              Build to Last
            </h3>

            {/* DESCRIPTION */}
            <p
              className="
                mt-1.5 w-full
                text-[8px] font-medium
                leading-[1.4]
                text-[#454545]
                sm:text-[10px]
                lg:text-[11px]
              "
            >
              2.6FT Retractable USB-C Cable
            </p>

            {/* SPECIFICATIONS — THREE EQUAL COLUMNS */}
            <div
              className="
                mt-4 grid w-full
                grid-cols-3 items-start
                border-t border-black/10
                pt-2.5
                sm:mt-5 sm:pt-3
              "
            >
              {/* SPEC 1 */}
              <div
                className="
                  flex min-w-0 flex-col
                  items-center justify-start
                  text-center
                "
              >
                <Cable
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#252525] sm:h-4 sm:w-4"
                />

                <span
                  className="
                    mt-1.5 text-[8px]
                    font-bold leading-tight
                    text-[#171717]
                    sm:text-[10px]
                  "
                >
                  0–80cm
                </span>

                <span
                  className="
                    mt-0.5 max-w-full
                    text-[6px] leading-[1.3]
                    text-[#555555]
                    sm:text-[8px]
                  "
                >
                  Adjustable Length
                </span>
              </div>

              {/* SPEC 2 */}
              <div
                className="
                  flex min-w-0 flex-col
                  items-center justify-start
                  border-x border-black/10
                  px-1 text-center
                "
              >
                <RefreshCw
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#252525] sm:h-4 sm:w-4"
                />

                <span
                  className="
                    mt-1.5 text-[8px]
                    font-bold leading-tight
                    text-[#171717]
                    sm:text-[10px]
                  "
                >
                  10,000X
                </span>

                <span
                  className="
                    mt-0.5 max-w-full
                    text-[6px] leading-[1.3]
                    text-[#555555]
                    sm:text-[8px]
                  "
                >
                  Retract Tests
                </span>
              </div>

              {/* SPEC 3 */}
              <div
                className="
                  flex min-w-0 flex-col
                  items-center justify-start
                  text-center
                "
              >
                <Zap
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#252525] sm:h-4 sm:w-4"
                />

                <span
                  className="
                    mt-1.5 text-[8px]
                    font-bold leading-tight
                    text-[#171717]
                    sm:text-[10px]
                  "
                >
                  65W
                </span>

                <span
                  className="
                    mt-0.5 max-w-full
                    text-[6px] leading-[1.3]
                    text-[#555555]
                    sm:text-[8px]
                  "
                >
                  Fast Charging
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT — PRODUCT INFORMATION
        ====================================================== */}
        <div
          className="
            order-2 flex min-w-0 flex-col
            items-center justify-center
            px-5 py-7 text-center
            sm:px-12 sm:py-12
            lg:px-10 lg:py-10
            xl:px-14
          "
        >
          {/* EYEBROW */}
          <span
            className="
              mb-3 text-[10px] font-semibold
              uppercase tracking-[0.22em]
              text-[#0066E6]
              sm:mb-5 sm:text-[11px]
            "
          >
            INFIBETTER POWER
          </span>

          {/* TITLE */}
          <h2
            id="power-station-heading"
            className="
              max-w-[520px]
              text-[27px] font-bold
              leading-[1.02]
              tracking-[-0.045em]
              text-[#171717]
              sm:text-[40px]
              sm:leading-[1.08]
              lg:text-[clamp(34px,3.1vw,46px)]
            "
          >
            Power up your workspace.
          </h2>

          {/* DESCRIPTION */}
          <p
            className="
              mt-3 max-w-[440px]
              text-[13px] leading-[1.55]
              text-[#777777]
              sm:mt-5 sm:text-base
              sm:leading-[1.8]
            "
          >
            A smarter way to charge your everyday devices.
            Keep your desk organized with powerful,
            convenient charging in one place.
          </p>

          {/* FEATURES */}
          <div
            className="
              mt-5 flex max-w-[440px]
              flex-wrap items-center
              justify-center gap-2
              sm:mt-6
            "
          >
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full border border-[#E8E8E8]
                bg-white px-3 py-2
                text-[9px] font-medium
                text-[#555555] sm:text-[10px]
              "
            >
              <Zap size={12} className="text-[#0066E6]" />
              Up to 105W
            </span>

            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full border border-[#E8E8E8]
                bg-white px-3 py-2
                text-[9px] font-medium
                text-[#555555] sm:text-[10px]
              "
            >
              <Cable size={12} className="text-[#0066E6]" />
              Retractable cables
            </span>

            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full border border-[#E8E8E8]
                bg-white px-3 py-2
                text-[9px] font-medium
                text-[#555555] sm:text-[10px]
              "
            >
              <Zap size={12} className="text-[#0066E6]" />
              Magnetic wireless
            </span>
          </div>

          {/* SHOP NOW — MATCH FEATURED PRODUCT BUTTON */}
          <Link
            to="/products/$slug"
            params={{ slug: "magstation-pro-105w" }}
            className="
              group relative mt-5 inline-flex
              min-h-[42px] min-w-[150px]
              items-center justify-center gap-3
              overflow-hidden rounded-full
              border border-white/80
              bg-gradient-to-b
              from-white via-white/90 to-[#EDEDED]/90
              px-6 py-2
              text-[11px] font-semibold
              uppercase tracking-[0.04em]
              text-[#171717]
              shadow-[0_4px_14px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,1)]
              backdrop-blur-xl
              transition-all duration-300 ease-out
              hover:-translate-y-0.5
              hover:border-white
              hover:shadow-[0_8px_24px_rgba(0,0,0,0.16),inset_0_1px_2px_white]
              active:translate-y-0 active:scale-[0.97]
              sm:mt-7
              before:absolute before:inset-0
              before:rounded-full
              before:bg-gradient-to-br
              before:from-white/90
              before:via-transparent
              before:to-white/10
              before:opacity-80
              before:content-['']
            "
          >
            {/* REFLECTIVE LIGHT */}
            <span
              className="
                pointer-events-none absolute
                left-[15%] top-0 h-full w-[35%]
                -skew-x-12
                bg-gradient-to-r
                from-transparent via-white/80
                to-transparent
                opacity-70 blur-[2px]
              "
            />

            <span className="relative z-10">
              Shop Now
            </span>

            <ArrowRight
              size={14}
              strokeWidth={1.8}
              className="
                relative z-10
                transition-transform duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PowerStationSection;
