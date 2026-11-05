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

function Chevron({ direction }: { direction: "left" | "right" }) {
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
                loading="lazy"
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
              />
            ))}
          </div>
        </div>

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

          <a href={PRODUCT_URL} className="travelmag-cta group">
            SHOP NOW
            <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
