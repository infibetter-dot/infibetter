import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function ScrollToTopBottom() {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButtons(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!showButtons) return null;

  return (
  <div
    className="
      fixed
      right-3
      top-1/2
      z-[80]
      flex
      -translate-y-1/2
      flex-col
      gap-2

      opacity-55
      transition-opacity
      duration-300
      hover:opacity-100

      sm:right-5
    "
  >
    {/* SCROLL TOP */}

    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        border
        border-[#D8D1C8]
        bg-white/70
        text-[#4F5948]
        shadow-[0_4px_14px_rgba(0,0,0,0.08)]
        backdrop-blur-sm

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:bg-white
        hover:shadow-[0_7px_20px_rgba(0,0,0,0.12)]
        active:scale-90

        sm:h-10
        sm:w-10
      "
    >
      <ArrowUp
        size={16}
        strokeWidth={1.5}
      />
    </button>

    {/* SCROLL BOTTOM */}

    <button
      type="button"
      onClick={scrollToBottom}
      aria-label="Cuộn xuống cuối trang"
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        border
        border-[#D8D1C8]
        bg-white/70
        text-[#4F5948]
        shadow-[0_4px_14px_rgba(0,0,0,0.08)]
        backdrop-blur-sm

        transition-all
        duration-300

        hover:translate-y-0.5
        hover:bg-white
        hover:shadow-[0_7px_20px_rgba(0,0,0,0.12)]
        active:scale-90

        sm:h-10
        sm:w-10
      "
    >
      <ArrowDown
        size={16}
        strokeWidth={1.5}
      />
    </button>
  </div>
);
}