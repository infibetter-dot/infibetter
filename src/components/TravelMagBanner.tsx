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
            ‹
          </button>

          <button
            type="button"
            className="travelmag-arrow travelmag-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
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

          <a href={PRODUCT_URL} className="travelmag-cta">
            SHOP NOW <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
