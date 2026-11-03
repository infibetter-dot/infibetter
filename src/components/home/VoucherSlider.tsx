
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: string;
  value: number;
  min_order: number | null;
  max_discount: number | null;
  quantity: number | null;
  used: number | null;
  start_at: string | null;
  end_at: string | null;
  active: boolean | null;
  badge: string | null;
  icon: string | null;
}

type IconType = "percent" | "shipping" | "tag";

const getVoucherIcon = (type: string): IconType => {
  const normalized = type.toLowerCase();

  if (normalized.includes("ship")) return "shipping";
  if (normalized === "percent" || normalized === "percentage") {
    return "percent";
  }

  return "tag";
};

const getDiscountLabel = (voucher: Voucher) => {
  const type = voucher.type.toLowerCase();
  const value = Number(voucher.value) || 0;

  if (type.includes("ship")) return "FREE SHIPPING";
  if (type === "percent" || type === "percentage") {
    return `${value}% OFF`;
  }

  return `$${value.toLocaleString("en-US")} OFF`;
};

const getVoucherNote = (voucher: Voucher) => {
  if (voucher.min_order && voucher.min_order > 0) {
    return `Min. order $${Number(voucher.min_order).toLocaleString("en-US")}`;
  }

  return voucher.badge || "Exclusive offer";
};

const VoucherIcon = ({ type }: { type: IconType }) => {
  const common = {
    className: "h-[17px] w-[17px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  return (
    <svg {...common}>
      {type === "percent" && (
        <>
          <path d="M19 5 5 19" />
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
        </>
      )}

      {type === "shipping" && (
        <>
          <path d="M3 7h11v11H3z" />
          <path d="M14 11h4l3 3v4h-7z" />
          <circle cx="7.5" cy="18" r="1.8" />
          <circle cx="18" cy="18" r="1.8" />
        </>
      )}

      {type === "tag" && (
        <>
          <path d="M20 13 13 20 3 10V4h6z" />
          <circle cx="7.5" cy="8" r="1" />
        </>
      )}
    </svg>
  );
};

const VoucherSlider: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadVouchers = async () => {
      try {
        const { data, error } = await supabase
          .from("vouchers")
          .select(`
            id,
            code,
            title,
            description,
            type,
            value,
            min_order,
            max_discount,
            quantity,
            used,
            start_at,
            end_at,
            active,
            badge,
            icon
          `)
          .eq("active", true)
          .eq("show_home", true)
          .eq("is_personal", false)
          .order("start_at", { ascending: true });

        if (error) throw error;

        const now = new Date();

        const available = (data ?? []).filter((voucher) => {
          const start = voucher.start_at
            ? new Date(voucher.start_at)
            : null;

          const end = voucher.end_at
            ? new Date(voucher.end_at)
            : null;

          const quantity = voucher.quantity;
          const used = voucher.used ?? 0;

          const validStart = !start || start <= now;
          const validEnd = !end || end > now;
          const validQuantity =
            quantity === null || quantity > used;

          return validStart && validEnd && validQuantity;
        });

        if (mounted) {
          setVouchers(available as Voucher[]);
        }
      } catch (error) {
        console.error("[VoucherSlider] Load error:", error);

        if (mounted) setVouchers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadVouchers();

    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (direction: "prev" | "next") => {
    scrollRef.current?.scrollBy({
      left: direction === "next" ? 280 : -280,
      behavior: "smooth",
    });
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode((current) =>
          current === code ? "" : current
        );
      }, 1800);
    } catch (error) {
      console.error("[VoucherSlider] Copy error:", error);
    }
  };

  if (loading || vouchers.length === 0) return null;

  return (
    <section className="my-5 w-full px-3 sm:my-7 sm:px-6 lg:px-0">
      <div className="mx-auto w-full max-w-[1440px]">

        {/* SECTION HEADER */}
        <div className="mb-3">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#FF4D00]">
            INFIBETTER PRIVILEGES
          </p>

          <h2 className="text-[23px] font-bold tracking-[-0.04em] text-[#171717] sm:text-[28px]">
            Exclusive Offers
          </h2>

          <p className="mt-0.5 text-[11px] text-[#888888]">
            A little something for your next upgrade.
          </p>
        </div>

        {/* HORIZONTAL VOUCHER SLIDER */}
        <div className="relative">

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-0.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vouchers.map((voucher) => (
              <article
                key={voucher.id}
                className="flex h-[138px] w-[min(270px,78vw)] flex-none snap-start flex-col justify-between rounded-[16px] border border-[#EAE7E2] bg-[#F8F7F4] p-3 sm:h-[142px] sm:w-[290px]"
              >
                {/* VOUCHER CONTENT */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[8px] font-semibold uppercase tracking-[0.17em] text-[#8B8177]">
                      {voucher.badge || "EXCLUSIVE OFFER"}
                    </p>

                    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[#EAE3DA] bg-white text-[#A18B76]">
                      <VoucherIcon type={getVoucherIcon(voucher.type)} />
                    </div>
                  </div>

                  {/* DISCOUNT */}
                  <h3 className="mt-1 truncate text-[24px] font-bold leading-none tracking-[-0.05em] text-[#171717]">
                    {getDiscountLabel(voucher)}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="mt-1 line-clamp-2 text-[10px] leading-[1.4] text-[#77716B]">
                    {voucher.description || voucher.title}
                  </p>
                </div>

                {/* PROMO CODE */}
                <div className="flex items-center justify-between gap-2 border-t border-dashed border-[#D9D3CB] pt-2">
                  <div className="min-w-0">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-[#999087]">
                      PROMO CODE
                    </p>

                    <p className="mt-0.5 truncate text-[10px] font-bold tracking-[0.07em] text-[#25211E]">
                      {voucher.code}
                    </p>

                    <p className="mt-0.5 truncate text-[8px] text-[#999087]">
                      {getVoucherNote(voucher)}
                    </p>
                  </div>

                  {/* COPY BUTTON */}
                  <button
                    type="button"
                    onClick={() => copyCode(voucher.code)}
                    className="h-7 flex-none rounded-full border border-[#DCD6CE] bg-white px-3 text-[9px] font-semibold text-[#39332E] transition hover:bg-[#171717] hover:text-white active:scale-95"
                  >
                    {copiedCode === voucher.code ? "Copied!" : "Copy code"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* PREVIOUS BUTTON */}
          {vouchers.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous vouchers"
                onClick={() => scroll("prev")}
                className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E3DE] bg-white/90 text-[#39332E] shadow-md backdrop-blur-md transition hover:bg-white active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {/* NEXT BUTTON */}
              <button
                type="button"
                aria-label="Next vouchers"
                onClick={() => scroll("next")}
                className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E3DE] bg-white/90 text-[#39332E] shadow-md backdrop-blur-md transition hover:bg-white active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default VoucherSlider;