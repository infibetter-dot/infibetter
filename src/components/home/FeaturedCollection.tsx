import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const collections = [
  {
    title: "Flowerpot",
    subtitle: "Modern Scandinavian",
    image: "/editorial/flowerpot.png",
    href: "/products/flowerpot",
  },
  {
    title: "Cordless",
    subtitle: "Portable Collection",
    image: "/editorial/cordless.png",
    href: "/products/cordless",
  },
  {
    title: "Panthella",
    subtitle: "Timeless Design",
    image: "/editorial/panthella.png",
    href: "/products/panthella",
  },
  {
    title: "UFO Red",
    subtitle: "Editor's Choice",
    image: "/editorial/ufo-red.png",
    href: "/products/ufo-red",
  },
];

export default function FeaturedCollection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % collections.length);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-10 lg:py-20">
      <div className="container mx-auto px-4">

        {/* Header */}

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#C77B55]">
              EDITOR'S PICKS
            </p>

            <h2 className="mt-2 font-serif text-2xl lg:text-4xl">
              Bộ sưu tập nổi bật
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Những thiết kế được yêu thích nhất tháng này.
            </p>
          </div>

          <Link
            to="/collections"
            className="hidden items-center gap-2 text-sm font-medium lg:flex"
          >
            Xem tất cả
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-6">

          {collections.map((item, index) => {

            const active = activeIndex === index;

            return (
              <Link
                key={item.title}
                to={item.href}
                className="group block"
              >
                <article
                  className={`
                    relative
                    overflow-hidden
                    rounded-3xl
                    transition-all
                    duration-700

                    ${
                      active
                        ? "scale-[1.03] shadow-2xl ring-2 ring-[#D9A066]"
                        : "shadow-md"
                    }

                    lg:hover:scale-[1.03]
                    lg:hover:shadow-2xl
                  `}
                >
                  {/* Image */}

                  <div className="relative aspect-[3/4] overflow-hidden">

                    <img
                      src={item.image}
                      alt={item.title}
                      className={`
                        h-full
                        w-full
                        object-cover
                        transition-all
                        duration-700

                        ${
                          active
                            ? "brightness-110 scale-105"
                            : "brightness-100"
                        }

                        lg:group-hover:scale-110
                      `}
                    />

                    {/* Overlay */}

                    <div
                      className={`
                        absolute
                        inset-0
                        transition-all
                        duration-700

                        ${
                          active
                            ? "bg-gradient-to-t from-black/30 via-transparent to-transparent"
                            : "bg-black/5"
                        }
                      `}
                    />

                    {/* Shine */}

                    {active && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -left-1/2 top-0 h-full w-1/3 rotate-12 animate-[shine_1.2s_ease] bg-white/25 blur-xl" />
                      </div>
                    )}

                  </div>

                  {/* Text */}

                  <div className="absolute bottom-4 left-4">

                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/80">
                      OLIVE LIVING
                    </p>

                    <h3 className="mt-1 font-serif text-lg text-white lg:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-1 hidden text-sm text-white/80 lg:block">
                      {item.subtitle}
                    </p>

                  </div>

                </article>
              </Link>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes shine {
          from {
            transform: translateX(-220%) rotate(12deg);
          }

          to {
            transform: translateX(420%) rotate(12deg);
          }
        }
      `}</style>
    </section>
  );
}