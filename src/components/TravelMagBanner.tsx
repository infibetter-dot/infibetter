
import { useState } from "react";
import "./TravelMagBanner.css";

import powerbanks from "../assets/hero/powerbanks.png";
import powerbanks1 from "../assets/hero/powerbanks1.png";

const PRODUCT_URL =
  "https://infibetter.com/products/travelmag-hybrid-10k";

const slides = [
  {
    image: powerbanks,
    alt: "TravelMag Hybrid 10K - First View",
  },
  {
    image: powerbanks1,
    alt: "TravelMag Hybrid 10K - Second View",
  },
];

const productUsps = [
  { label: "10,000mAh Capacity", icon: "battery" },
  { label: "Magnetic Charging", icon: "magnetic" },
  { label: "Built-in Kickstand", icon: "stand" },
];

function UspIcon({ type }: { type: string }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    className: "travelmag-usp-svg",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (type === "battery") {
    return (
      <svg {...iconProps}>
        <rect x="3" y="7" width="17" height="10" rx="2" />
        <path d="M20 10h1v4h-1" />
        <path d="m13 8-4 5h3l-1 3 5-6h-3l1-2Z" />
      </svg>
    );
  }

  if (type === "magnetic") {
    return (
      <svg {...iconProps}>
        <path d="M7 3v7a5 5 0 0 0 10 0V3" />
        <path d="M7 3H4v7a8 8 0 0 0 16 0V3h-3" />
        <path d="M4 6h3M17 6h3" />
      </svg>
    );
  }

  if (type === "stand") {
    return (
      <svg {...iconProps}>
        <rect x="5" y="3" width="14" height="11" rx="2" />
        <path d="M12 14v2" />
        <path d="m8 21 4-5 4 5" />
        <path d="M7 21h10" />
      </svg>
    );
  }

  return null;
}

function Chevron({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function TravelMagBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="travelmag-section">
      <div className="travelmag-banner">

        {/* LEFT — PRODUCT GALLERY */}
        <div className="travelmag-visual">
          <a
            href={PRODUCT_URL}
            className="travelmag-image-link"
            aria-label="Shop TravelMag Hybrid 10K"
          >
            {slides.map((slide, index) => (
              <img
                key={slide.image}
                src={slide.image}
                alt={slide.alt}
                className={`travelmag-image ${
                  activeSlide === index ? "active" : ""
                }`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </a>

          <div className="travelmag-counter">
            {activeSlide + 1} / {slides.length}
          </div>

          <button
            type="button"
            className="travelmag-arrow travelmag-prev"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            <Chevron direction="left" />
          </button>

          <button
            type="button"
            className="travelmag-arrow travelmag-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <Chevron direction="right" />
          </button>

          <div className="travelmag-pagination">
            {slides.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                className={`travelmag-dot ${
                  activeSlide === index ? "active" : ""
                }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={
                  activeSlide === index ? "true" : undefined
                }
              />
            ))}
          </div>
        </div>

        {/* RIGHT — PRODUCT INFORMATION */}
        <div className="travelmag-content">
          <span className="travelmag-eyebrow">
            INFIBETTER POWER SERIES
          </span>

          <h2>TRAVELMAG HYBRID 10K</h2>

          <p className="travelmag-description">
            10,000mAh Magnetic Powerbank with Kickstand.
            <br className="desktop-break" />
            Charge anywhere, work and stream hands-free.
          </p>

          {/* THREE PRODUCT USP PILLS */}
          <div className="travelmag-usps">
            {productUsps.map((usp) => (
              <div
                className="travelmag-usp"
                key={usp.label}
              >
                <span className="travelmag-usp-icon">
                  <UspIcon type={usp.icon} />
                </span>

                <span className="travelmag-usp-label">
                  {usp.label}
                </span>
              </div>
            ))}
          </div>

          {/* SHOP NOW */}
          <a
            href={PRODUCT_URL}
            className="travelmag-cta group"
          >
            SHOP NOW
            <ArrowRight />
          </a>
        </div>

      </div>
    </section>
  );
}
