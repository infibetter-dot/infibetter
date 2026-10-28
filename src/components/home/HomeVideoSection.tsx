import { useRef, useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";

type VideoItem = {
  label: string;
  title: string;
  description: string;
  video: string;
  href: string;
};

const videos: VideoItem[] = [
  {
    label: "INFIBETTER",
    title: "Armor MagSafe Case",
    description: "Protection meets everyday style.",
    video: "/videos/video1.mp4",
    href: "/products/armor-magsafe-case",
  },
  {
    label: "POWER",
    title: "Power your everyday.",
    description: "Smart accessories for life on the go.",
    video: "/videos/video2.mp4",
    href: "/products/foldcharge-3-in-1",
  },
  {
    label: "DESIGN",
    title: "Designed to move.",
    description: "Minimal design. Everyday convenience.",
    video: "/videos/video3.mp4",
    href: "/products/products/trifold-charger",
  },
  {
    label: "LIFESTYLE",
    title: "Stay connected.",
    description: "Made to fit your everyday routine.",
    video: "/videos/infibetter-video-4.mp4",
    href: "/products/armor-magsafe-case",
  },
];

function VideoCard({ item, index }: { item: VideoItem; index: number }) {
  const [videoError, setVideoError] = useState(false);

  return (
    <article
      data-video-card
      className="
        group relative isolate aspect-[9/16] min-w-0
        w-[72%] shrink-0 snap-start overflow-hidden
        rounded-[14px] bg-[#E9EDF2]
        sm:w-[42%] sm:rounded-[18px]
        lg:w-auto
      "
    >
      {!videoError ? (
        <video
          src={item.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={item.title}
          className="
            absolute inset-0 h-full w-full object-cover
            transition-transform duration-700
            group-hover:scale-[1.03]
          "
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E9EDF2] p-3 text-center">
          <p className="text-xs text-neutral-500">Video unavailable</p>
        </div>
      )}

      {/* Icon-only product link in the top-right corner */}
      <a
        href={item.href}
        aria-label={`View ${item.title}`}
        title={`View ${item.title}`}
        className="
          absolute right-3 top-3 z-10
          inline-flex h-9 w-9 items-center justify-center
          rounded-xl border border-white/70
          bg-white/80 text-[#171717]
          shadow-[0_2px_8px_rgba(15,23,42,0.12)]
          backdrop-blur-md transition
          hover:bg-white hover:shadow-md
          active:scale-95
          sm:right-4 sm:top-4
        "
      >
        <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
      </a>

      {/* Content panel */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <div className="rounded-xl border border-white/30 bg-white/75 p-3 text-[#171717] shadow-sm backdrop-blur-md sm:p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#0066E6] sm:text-[10px]">
            {item.label} · 0{index + 1}
          </p>

          <h3 className="mt-1.5 text-sm font-semibold leading-tight tracking-tight sm:text-base">
            {item.title}
          </h3>

          <p className="mt-1 text-[10px] leading-relaxed text-neutral-600 sm:text-xs">
            {item.description}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function HomeVideoSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToNextCard = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(
      carousel.querySelectorAll<HTMLElement>("[data-video-card]"),
    );

    if (!cards.length) return;

    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(card.offsetLeft - carousel.scrollLeft);
      const closestDistance = Math.abs(
        cards[closestIndex].offsetLeft - carousel.scrollLeft,
      );

      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    const nextIndex = (currentIndex + 1) % cards.length;

    carousel.scrollTo({
      left: cards[nextIndex].offsetLeft - cards[0].offsetLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#F7F8FA] py-6 sm:py-8 lg:py-10">
      {/* Keep the carousel inside the 16px mobile page gutters */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-4 lg:px-5">
        <div className="mb-4 sm:mb-5">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0066E6] sm:text-[10px]">
            Made for everyday life
          </p>

          <h2 className="text-[25px] font-bold leading-tight tracking-[-0.04em] text-[#171717] sm:text-[32px]">
            Power your everyday.
          </h2>

          <p className="mt-2 max-w-lg text-[11px] leading-relaxed text-neutral-500 sm:text-[13px]">
            Discover smarter accessories designed to keep you connected.
          </p>
        </div>

        <div className="relative">
          <div
            ref={carouselRef}
            className="
              flex snap-x snap-mandatory
              gap-3 overflow-x-auto overscroll-x-contain
              px-0 pb-3 pt-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              sm:px-0
              lg:grid lg:grid-cols-4 lg:gap-3
              lg:overflow-visible
            "
          >
            {videos.map((item, index) => (
              <VideoCard key={item.video} item={item} index={index} />
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToNextCard}
            aria-label="View next video"
            className="
              absolute right-2 top-1/2 z-20
              flex h-9 w-9 -translate-y-1/2
              items-center justify-center
              rounded-full border border-white/70
              bg-gradient-to-b from-white/75 via-white/55 to-white/40
              text-[#171717]/75
              shadow-[0_3px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
              backdrop-blur-xl transition active:scale-95
              hover:bg-white/80
              sm:right-2
              lg:hidden
            "
          >
            <ChevronRight size={17} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 lg:hidden">
          <p className="text-[11px] text-neutral-500">
            <span className="mr-2 text-[#171717]">← →</span>
            Swipe to explore all 4 videos
          </p>
        </div>
      </div>
    </section>
  );
}
