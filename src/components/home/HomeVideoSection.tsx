
import { useState } from "react";

const videos = [
  {
    src: "/videos/lv_0_20261017175215.mp4",
    label: "INFIBETTER",
    title: "Charge smarter.",
  },
  {
    src: "/videos/infibetter-video-2.mp4",
    label: "POWER",
    title: "Power your everyday.",
  },
  {
    src: "/videos/infibetter-video-3.mp4",
    label: "DESIGN",
    title: "Designed to move.",
  },
  {
    src: "/videos/infibetter-video-4.mp4",
    label: "LIFESTYLE",
    title: "Stay connected.",
  },
];

function VideoCard({
  src,
  label,
  title,
}: {
  src: string;
  label: string;
  title: string;
}) {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="group relative aspect-square min-w-0 overflow-hidden rounded-xl bg-[#E9EDF2] sm:rounded-2xl">
      {!videoError ? (
        <video
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${label} product showcase`}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#E9EDF2] px-3 text-center">
          <p className="text-xs font-semibold text-neutral-700">
            Video unavailable
          </p>
          <p className="mt-1 break-all text-[10px] text-neutral-500">
            {src.split("/").pop()}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 text-white sm:bottom-4 sm:left-4 sm:right-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
          {label}
        </p>

        <h3 className="mt-1 text-sm font-semibold leading-tight tracking-tight sm:text-base lg:text-lg">
          {title}
        </h3>
      </div>
    </div>
  );
}

export default function HomeVideoSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video.src}
            src={video.src}
            label={video.label}
            title={video.title}
          />
        ))}
      </div>
    </section>
  );
}