
import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import powerStationImage from "@/assets/hero/power_station.png";

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
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-7 scale-[0.99] opacity-0",
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

        {/* Hero content */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-3 sm:px-6 sm:pt-8 lg:px-10 lg:pt-9">
          <div
            className={[
              "w-full max-w-[1120px] text-center font-[Arial,sans-serif]",
              "transition-[opacity,transform] delay-150 duration-700 ease-out",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0",
            ].join(" ")}
          >
            {/* Brand */}
            <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_5px_rgba(0,28,75,0.85)] sm:text-[9px]">
              INFIBETTER · EVERYDAY WIRELESS CHARGING
            </p>

            {/* Heading */}
            <h2 className="mt-1.5 text-[clamp(1.3rem,2.8vw,2.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-white [text-shadow:0_2px_9px_rgba(0,28,75,0.8)] sm:mt-3">
              A Smarter Way to Charge.
            </h2>

            {/* Description */}
            <p className="mx-auto mt-1.5 max-w-[650px] text-[9px] font-semibold leading-[1.4] text-white [text-shadow:0_1px_6px_rgba(0,28,75,0.9)] sm:mt-3 sm:text-[12px]">
              One stand. Three devices. Zero cable clutter.
            </p>

            {/* CTA button */}
            <div className="mt-3 flex justify-center sm:mt-5 lg:mt-6">
              <Link
                to="/products/$slug"
                params={{ slug: "infi-magcool-x7-25w" }}
                className="group inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white bg-white px-6 py-2 font-[Arial,sans-serif] text-[8px] font-bold uppercase tracking-[0.07em] text-[#173452] transition-colors duration-200 hover:bg-[#F0F6FC] active:bg-[#E5EEF8] sm:min-h-11 sm:px-7 sm:text-[10px]"
              >
                <span>Explore MAGCOOL X7</span>

                <ArrowRight
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
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
