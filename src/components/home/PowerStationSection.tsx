import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Snowflake, Zap, Watch } from "lucide-react";

import powerStationImage from "@/assets/hero/power_station.png";

const productFeatures = [
  { label: "25W Qi2.2", icon: Zap },
  { label: "TEC Cooling", icon: Snowflake },
  { label: "3-in-1 Apple Charging", icon: Watch },
];

const PowerStationSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Convenient 3-in-1 wireless charging"
      className={[
        "relative left-1/2 my-0 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#DCEBFA]",
        "transform-gpu transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.2,0.75,0.25,1)]",
        "motion-reduce:transform-none motion-reduce:transition-none",
        isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-7 scale-[0.99] opacity-0",
      ].join(" ")}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[16/6.5] xl:aspect-[16/6]">
        <img
          src={powerStationImage}
          alt="MAGCOOL X7 25W 3-in-1 wireless charging stand for iPhone, Apple Watch and AirPods"
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Copy layout and placement are unchanged; only text contrast is improved. */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-4 sm:px-6 sm:pt-5 lg:px-10 lg:pt-5">
          <div
            className={[
              "w-full max-w-[1120px] text-center",
              "transition-[opacity,transform] delay-150 duration-700 ease-out",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            ].join(" ")}
          >
            <p className="text-[7px] font-extrabold uppercase tracking-[0.2em] text-white [text-shadow:0_1px_5px_rgba(0,28,75,0.85)] sm:text-[9px]">
              INFIBETTER · EVERYDAY WIRELESS CHARGING
            </p>

            <h2 className="mt-1 text-[clamp(1.35rem,2.8vw,2.45rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-white [text-shadow:0_2px_9px_rgba(0,28,75,0.8)]">
              A Smarter Way to Charge.
            </h2>

            <p className="mx-auto mt-1 max-w-[650px] text-[9px] font-semibold leading-[1.35] text-white [text-shadow:0_1px_6px_rgba(0,28,75,0.9)] sm:mt-1.5 sm:text-[12px]">
              One convenient stand for your iPhone, Apple Watch and AirPods.
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-1 sm:mt-2.5 sm:gap-1.5">
              {productFeatures.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-6 items-center gap-1 rounded-full border border-white/90 bg-white/90 px-2 py-1 text-[7px] font-semibold text-[#173452] shadow-[0_2px_8px_rgba(20,55,90,0.10)] sm:min-h-7 sm:gap-1.5 sm:px-2.5 sm:text-[9px]"
                >
                  <Icon className="h-2.5 w-2.5 text-[#087BFF] sm:h-3 sm:w-3" />
                  {label}
                </span>
              ))}

              <Link
                to="/products/$slug"
                params={{ slug: "infi-magcool-x7-25w" }}
                className="group relative inline-flex min-h-7 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/90 bg-gradient-to-b from-white via-[#EDF4FC] to-[#B9CDE2] px-3.5 py-1 text-[7px] font-extrabold uppercase tracking-[0.07em] text-[#10243E] shadow-[0_4px_12px_rgba(16,45,80,0.18),inset_0_1px_2px_white,inset_0_-1px_2px_rgba(50,75,100,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_7px_18px_rgba(16,45,80,0.24),0_0_14px_rgba(65,165,255,0.2),inset_0_1px_2px_white] active:translate-y-0 active:scale-[0.98] sm:min-h-8 sm:px-4 sm:text-[8px]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-90 transition-transform duration-700 group-hover:translate-x-[450%]" />
                <span className="relative z-10">Explore MAGCOOL X7</span>
                <ArrowRight
                  size={11}
                  strokeWidth={1.9}
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-[#48B7FF] to-transparent",
            "transition-opacity duration-1000",
            isVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </div>
    </section>
  );
};

export default PowerStationSection;
