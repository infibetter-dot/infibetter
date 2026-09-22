import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const MESSENGER_URL = "https://m.me/oliveliving";
const ZALO_URL = "https://zalo.me/0799379179";

export default function FloatingSupport() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const glassButtonClass = `
    group
    relative
    flex
    h-12
    w-12
    items-center
    justify-center
    overflow-hidden
    rounded-full

    border
    border-white/90

    bg-gradient-to-br
    from-white/80
    via-white/50
    to-neutral-200/35

    backdrop-blur-[18px]
    backdrop-saturate-[180%]

    text-neutral-700

    shadow-[0_10px_28px_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(0,0,0,0.08)]

    transition-all
    duration-300

    hover:scale-105
    hover:from-white/90
    hover:via-white/65
    hover:to-neutral-100/45
    hover:text-neutral-950
    hover:shadow-[0_14px_34px_rgba(0,0,0,0.20),inset_0_1px_2px_rgba(255,255,255,1)]

    before:pointer-events-none
    before:absolute
    before:inset-[2px]
    before:rounded-full
    before:border
    before:border-white/75
    before:content-['']

    after:pointer-events-none
    after:absolute
    after:-left-12
    after:top-[-35%]
    after:h-[170%]
    after:w-8
    after:rotate-[28deg]
    after:bg-gradient-to-b
    after:from-transparent
    after:via-white/90
    after:to-transparent
    after:blur-[5px]
    after:opacity-70
    after:transition-transform
    after:duration-700
    group-hover:after:translate-x-[105px]
  `;

  return (
    <div
      className="
        fixed
        bottom-[120px]
        right-4
        z-[60]

        flex
        flex-col
        items-center
        gap-2.5

        sm:bottom-[125px]

        lg:bottom-6
        lg:right-6
      "
    >
      {/* CLOSE */}
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Ẩn nút hỗ trợ"
        title="Ẩn"
        className="
          group
          mb-1
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full

          border
          border-white/90

          bg-gradient-to-br
          from-white/85
          via-white/60
          to-neutral-200/40

          backdrop-blur-[18px]
          backdrop-saturate-[180%]

          text-neutral-500

          shadow-[0_7px_18px_rgba(0,0,0,0.14),inset_0_1px_1px_rgba(255,255,255,0.95)]

          transition-all
          duration-300

          hover:scale-105
          hover:bg-white/90
          hover:text-neutral-900
        "
      >
        <X
          size={13}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:rotate-90"
        />
      </button>

      {/* MESSENGER */}
      <a
        href={MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat với Olive Living qua Messenger"
        title="Messenger"
        className={glassButtonClass}
      >
        <MessageCircle
          size={21}
          strokeWidth={1.55}
          className="
            relative
            z-10
            drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]
            transition-transform
            duration-300
            group-hover:scale-110
          "
        />
      </a>

      {/* ZALO */}
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat với Olive Living qua Zalo"
        title="Zalo"
        className={glassButtonClass}
      >
        <span
          className="
            relative
            z-10
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-[6px]

            border
            border-neutral-600/90

            bg-white/20
            text-[8px]
            font-bold
            leading-none

            shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]

            transition-transform
            duration-300
            group-hover:scale-110
          "
        >
          Z
        </span>
      </a>
    </div>
  );
}
