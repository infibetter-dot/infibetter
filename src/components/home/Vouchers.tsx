import { Ticket, Truck, Gift, Flame, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

const ICONS = {
  gift: Gift,
  truck: Truck,
  ticket: Ticket,
};

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadVouchers();

    const saved = JSON.parse(
      localStorage.getItem("olive_vouchers") || "[]"
    );

    setSavedCodes(saved.map((v: any) => v.code));
  }, []);

  async function loadVouchers() {
    const now = new Date();

    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("active", true)
      .eq("show_home", true)
      .order("start_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      return;
    }

    // CHỈ HIỆN VOUCHER CÒN HIỆU LỰC:
    // - Đang diễn ra: start_at <= now < end_at
    // - Sắp diễn ra: start_at > now
    // - TUYỆT ĐỐI KHÔNG hiện voucher đã hết hạn: end_at <= now
    //
    // Điều kiện thực tế chỉ cần kiểm tra end_at > now,
    // vì voucher có end_at trong tương lai sẽ là đang diễn ra
    // hoặc sắp diễn ra.
    const available = (data ?? []).filter((voucher) => {
      if (!voucher.start_at || !voucher.end_at) return false;

      const start = new Date(voucher.start_at);
      const end = new Date(voucher.end_at);

      // Bỏ dữ liệu ngày không hợp lệ.
      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return false;
      }

      // Voucher đã hết hạn => KHÔNG HIỆN.
      if (end.getTime() <= now.getTime()) {
        return false;
      }

      // Chỉ cho phép:
      // 1. Đang diễn ra
      // 2. Sắp diễn ra
      return start.getTime() <= end.getTime();
    });

    const sorted = [...available].sort((a, b) => {
      // Black Friday luôn đứng đầu.
      const aBF = isBlackFriday(a) ? 1 : 0;
      const bBF = isBlackFriday(b) ? 1 : 0;

      if (aBF !== bBF) {
        return bBF - aBF;
      }

      // Voucher đang diễn ra đứng trước voucher sắp diễn ra.
      const aStarted = new Date(a.start_at) <= now;
      const bStarted = new Date(b.start_at) <= now;

      if (aStarted !== bStarted) {
        return aStarted ? -1 : 1;
      }

      // Sau đó theo thời gian bắt đầu gần nhất.
      return (
        new Date(a.start_at).getTime() -
        new Date(b.start_at).getTime()
      );
    });

    setVouchers(sorted);
  }

  function isBlackFriday(voucher: any) {
    const text = `
      ${voucher.code || ""}
      ${voucher.title || ""}
      ${voucher.description || ""}
      ${voucher.badge || ""}
      ${voucher.event_type || ""}
    `.toLowerCase();

    return (
      voucher.event_type === "black_friday" ||
      text.includes("black friday") ||
      text.includes("black_friday") ||
      text.includes("black-friday") ||
      text.includes("blackfriday") ||
      text.includes("bf2026")
    );
  }

  function isUpcoming(voucher: any) {
    if (!voucher.start_at || !voucher.end_at) return false;

    const now = new Date().getTime();
    const start = new Date(voucher.start_at).getTime();
    const end = new Date(voucher.end_at).getTime();

    return (
      !Number.isNaN(start) &&
      !Number.isNaN(end) &&
      start > now &&
      end > now
    );
  }

  function saveVoucher(voucher: any) {
    const saved = JSON.parse(
      localStorage.getItem("olive_vouchers") || "[]"
    );

    if (saved.find((v: any) => v.code === voucher.code)) {
      toast.info("Voucher đã được lưu");
      return;
    }

    saved.push({ code: voucher.code });

    localStorage.setItem(
      "olive_vouchers",
      JSON.stringify(saved)
    );

    setSavedCodes(saved.map((v: any) => v.code));
    toast.success("Đã lưu voucher");
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  }

  function formatDiscount(item: any) {
    if (item.type === "percent") {
      return `${item.value}%`;
    }

    if (item.type === "fixed") {
      return `${Number(item.value).toLocaleString("vi-VN")}đ`;
    }

    return "FREE";
  }

  // Hiện tối đa 2 voucher ban đầu.
  // Black Friday được ưu tiên đầu tiên, sau đó là 1 voucher thường.
  // Khi bấm "Xem thêm" mới hiện toàn bộ voucher hợp lệ.
  const visibleVouchers = showAll
    ? vouchers
    : vouchers.slice(0, 2);

  const hiddenVoucherCount = Math.max(
    0,
    vouchers.length - 2
  );

  return (
    <section className="bg-[#FAF8F5] py-8 sm:py-12 lg:py-14">
      <div className="container-x">

        {/* HEADER */}

        <div className="mx-auto mb-6 max-w-lg text-center sm:mb-8">
          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            EXCLUSIVE OFFERS
          </p>

          <h2 className="mt-1.5 font-display text-2xl lg:text-3xl">
            Ưu đãi dành riêng cho bạn
          </h2>

  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-neutral-500">
  Đăng ký một lần – nhận ưu đãi quanh năm.
  Nhận voucher theo tháng, ưu đãi đặc biệt vào các dịp lễ
  và những chương trình dành riêng cho khách hàng Olive Living.
</p>

          {/* ĐĂNG KÝ NHẬN VOUCHER */}
          <Link
            to="/voucher-register"
            className="
              mx-auto
              mt-4
              flex
              w-fit
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-900
              px-5
              py-2.5
              text-[11px]
              font-semibold
              tracking-wide
              text-white
              shadow-sm
              transition-all
              hover:bg-gray-800
              active:scale-[0.98]
            "
          >
            <Gift size={14} strokeWidth={2} />
            ĐĂNG KÝ NHẬN VOUCHER
          </Link>
        </div>

        {/* ALL VOUCHERS
            Black Friday dùng đúng layout voucher thường.
            Chỉ đổi màu + thêm hiệu ứng nhẹ.
        */}

        {visibleVouchers.length > 0 && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3.5 sm:grid-cols-2">
            {visibleVouchers
              .filter((item) => {
                if (!item.start_at || !item.end_at) return false;

                const now = Date.now();
                const start = new Date(item.start_at).getTime();
                const end = new Date(item.end_at).getTime();

                return (
                  !Number.isNaN(start) &&
                  !Number.isNaN(end) &&
                  end > now &&
                  start <= end
                );
              })
              .map((item) => {
                const blackFriday = isBlackFriday(item);
                const upcoming = isUpcoming(item);
                const saved = savedCodes.includes(item.code);

                const Icon =
                  ICONS[item.icon as keyof typeof ICONS] ?? Gift;

                return (
                  <motion.div
                    key={item.code}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`
                      group
                      relative
                      flex
                      h-[124px]
                      overflow-hidden
                      rounded-xl
                      border
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-md
                      sm:h-[140px]
                      ${
                        blackFriday
                          ? "hover:shadow-[0_10px_30px_rgba(185,125,70,0.18)]"
                          : ""
                      }

                      ${
                        blackFriday
                          ? `
                            border-[#D8C7B3]
                            bg-[#F3EBDD]
                          `
                          : `
                            border-[#E9E3DA]
                            bg-white
                          `
                      }
                    `}
                  >

                    {/* LEFT STRIPE */}

                    <div
                      className={`
                        absolute
                        left-0
                        top-0
                        h-full
                        w-1.5
                        transition-all
                        group-hover:w-2

                        ${
                          blackFriday
                            ? "bg-gradient-to-b from-[#E8B77D] via-[#C98245] to-[#A96235]"
                            : "bg-[#D97745]"
                        }
                      `}
                    />

                    {/* BLACK FRIDAY SPECIAL EFFECTS */}

                    {blackFriday && (
                      <>
                        {/* Soft champagne glow */}
                        <motion.div
                          className="
                            pointer-events-none
                            absolute
                            -right-10
                            -top-10
                            h-28
                            w-28
                            rounded-full
                            bg-[#F7C98F]/25
                            blur-2xl
                          "
                          animate={{
                            scale: [0.9, 1.15, 0.9],
                            opacity: [0.25, 0.55, 0.25],
                          }}
                          transition={{
                            duration: 3.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Moving light sweep */}
                        <motion.div
                          className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            -left-1/3
                            z-[1]
                            w-1/4
                            rotate-[18deg]
                            bg-gradient-to-r
                            from-transparent
                            via-white/35
                            to-transparent
                            blur-[2px]
                          "
                          animate={{
                            x: ["-80%", "560%"],
                          }}
                          transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            repeatDelay: 2.5,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Tiny twinkling stars */}
                        <motion.span
                          className="pointer-events-none absolute left-[27%] top-[22%] z-[2] text-[9px] text-white"
                          animate={{
                            opacity: [0.15, 1, 0.15],
                            scale: [0.7, 1.25, 0.7],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          ✦
                        </motion.span>

                        <motion.span
                          className="pointer-events-none absolute right-[16%] top-[18%] z-[2] text-[7px] text-[#FFF5E8]"
                          animate={{
                            opacity: [0.1, 0.9, 0.1],
                            scale: [0.7, 1.15, 0.7],
                          }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            delay: 0.6,
                            ease: "easeInOut",
                          }}
                        >
                          ✦
                        </motion.span>

                        <motion.span
                          className="pointer-events-none absolute bottom-[20%] right-[34%] z-[2] text-[6px] text-white"
                          animate={{
                            opacity: [0.1, 0.75, 0.1],
                            scale: [0.6, 1.2, 0.6],
                          }}
                          transition={{
                            duration: 2.1,
                            repeat: Infinity,
                            delay: 1.1,
                            ease: "easeInOut",
                          }}
                        >
                          ✦
                        </motion.span>
                      </>
                    )}

                    {/* LEFT VALUE */}

                    <div
                      className={`
                        relative
                        z-10
                        flex
                        w-[96px]
                        shrink-0
                        flex-col
                        items-center
                        justify-center
                        border-r
                        border-dashed
                        px-2
                        py-3
                        sm:w-[120px]

                        ${
                          blackFriday
                            ? "border-[#D8C9B8] bg-[#EFE5D6]/70"
                            : "border-[#E5DED5] bg-[#FAF8F5]/40"
                        }
                      `}
                    >

                      <div
                        className={`
                          mb-1
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full

                          ${
                            blackFriday
                              ? "bg-[#E7D7C2]"
                              : "bg-[#FFF4EA]"
                          }
                        `}
                      >
                        {blackFriday ? (
                          <Flame
                            size={14}
                            className="text-[#B87343]"
                          />
                        ) : (
                          <Icon
                            size={14}
                            className="text-[#D97745]"
                          />
                        )}
                      </div>

                      {/* BF BADGE / NORMAL BADGE */}

                      {blackFriday ? (
                        <span
                          className="
                            rounded-full
                            bg-[#C98245]
                            px-1.5
                            py-0.5
                            text-[7px]
                            font-bold
                            uppercase
                            leading-none
                            tracking-wide
                            text-white
                            sm:text-[8px]
                          "
                        >
                          BLACK FRIDAY
                        </span>
                      ) : null}

                      <p
                        className={`
                          w-full
                          truncate
                          text-center
                          font-mono
                          font-medium

                          ${
                            blackFriday
                              ? "mt-1 text-[8px] text-[#857666] sm:text-[9px]"
                              : "text-[9px] text-neutral-400"
                          }
                        `}
                      >
                        {item.code}
                      </p>

                      <p
                        className={`
                          mt-0.5
                          text-center
                          font-bold
                          leading-tight
                          tracking-tight

                          ${
                            blackFriday
                              ? "text-lg text-[#B87343] sm:text-xl"
                              : "text-lg text-[#D97745]"
                          }
                        `}
                      >
                        {formatDiscount(item)}
                      </p>

                      <span
                        className={`
                          text-[9px]

                          ${
                            blackFriday
                              ? "text-[#857666]"
                              : "text-neutral-400"
                          }
                        `}
                      >
                        Voucher
                      </span>
                    </div>

                    {/* RIGHT INFO */}

                    <div
                      className={`
                        relative
                        z-10
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        justify-between
                        p-3

                        ${
                          blackFriday
                            ? "text-[#40382F]"
                            : ""
                        }
                      `}
                    >

                      <div className="min-w-0">

                        <div className="flex items-center gap-1.5">

                          <h3
                            className={`
                              line-clamp-1
                              min-w-0
                              text-xs
                              font-semibold

                              ${
                                blackFriday
                                  ? "text-[#3D362E]"
                                  : "text-neutral-800"
                              }
                            `}
                          >
                            {item.title ||
                              (blackFriday
                                ? "BLACK FRIDAY 39"
                                : "")}
                          </h3>

                          {blackFriday ? (
                            <span
                              className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-0.5
                                rounded-full
                                bg-[#C98245]
                                px-1.5
                                py-0.5
                                text-[7px]
                                font-semibold
                                text-white
                              "
                            >
                              <Flame size={8} />
                              HOT
                            </span>
                          ) : (
                            item.badge && (
                              <span
                                className="
                                  shrink-0
                                  rounded-full
                                  px-1.5
                                  py-0.5
                                  text-[8px]
                                  font-semibold
                                  text-white
                                "
                                style={{
                                  backgroundColor:
                                    item.badge_color || "#111",
                                }}
                              >
                                {item.badge}
                              </span>
                            )
                          )}

                        </div>

                        <p
                          className={`
                            mt-0.5
                            line-clamp-1
                            text-[11px]

                            ${
                              blackFriday
                                ? "text-[#75695C]"
                                : "text-neutral-500"
                            }
                          `}
                        >
                          {item.description}
                        </p>

                        <p
                          className={`
                            mt-1
                            text-[11px]

                            ${
                              blackFriday
                                ? "text-[#75695C]"
                                : "text-neutral-500"
                            }
                          `}
                        >
                          Đơn từ:{" "}
                          <span
                            className={`
                              font-semibold

                              ${
                                blackFriday
                                  ? "text-[#3D362E]"
                                  : "text-neutral-800"
                              }
                            `}
                          >
                            {Number(
                              item.min_order || 0
                            ).toLocaleString("vi-VN")}
                            đ
                          </span>
                        </p>

                      </div>

                      {/* BOTTOM */}

                      <div
                        className={`
                          mt-2
                          flex
                          items-center
                          justify-between
                          border-t
                          pt-1.5

                          ${
                            blackFriday
                              ? "border-[#DED1C2]"
                              : "border-neutral-100"
                          }
                        `}
                      >

                        <div className="min-w-0">

                          <p
                            className={`
                              text-[10px]
                              font-medium

                              ${
                                blackFriday
                                  ? "text-[#B87343]"
                                  : "text-[#D97745]"
                              }
                            `}
                          >
                            {upcoming
                              ? "Sắp diễn ra"
                              : `Còn ${Math.max(
                                  0,
                                  Number(item.quantity || 0) -
                                    Number(item.used || 0)
                                )}`}
                          </p>

                          <p
                            className={`
                              text-[9px]

                              ${
                                blackFriday
                                  ? "text-[#968979]"
                                  : "text-neutral-400"
                              }
                            `}
                          >
                            {upcoming
                              ? `Bắt đầu: ${new Date(
                                  item.start_at
                                ).toLocaleDateString("vi-VN")}`
                              : `HSD: ${new Date(
                                  item.end_at
                                ).toLocaleDateString("vi-VN")}`}
                          </p>

                        </div>

                        {/* ACTION */}

                        {blackFriday ? (
                          <div className="flex shrink-0 items-center gap-1.5">

                            <button
                              onClick={() =>
                                copyCode(item.code)
                              }
                              className="
                                flex
                                h-7
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-[#D3C4B3]
                                bg-white/60
                                px-2
                                text-[9px]
                                font-medium
                                text-[#554A3F]
                                transition
                                hover:bg-white
                              "
                            >
                              <Copy size={11} />

                              <span className="hidden sm:inline">
                                Sao chép
                              </span>
                            </button>

                            <button
                              onClick={() =>
                                saveVoucher(item)
                              }
                              disabled={saved}
                              className={`
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-[10px]
                                font-semibold
                                transition

                                ${
                                  saved
                                    ? "bg-[#6D8B5B] text-white"
                                    : "bg-[#D9905C] text-white hover:bg-[#C98245]"
                                }
                              `}
                            >
                              {saved ? (
                                <>
                                  <Check
                                    size={11}
                                    className="mr-0.5 inline"
                                  />
                                  Đã lưu
                                </>
                              ) : (
                                "Lấy ưu đãi"
                              )}
                            </button>

                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              saveVoucher(item)
                            }
                            disabled={saved}
                            className={`
                              rounded-lg
                              px-2.5
                              py-1
                              text-[11px]
                              font-semibold
                              transition

                              ${
                                saved
                                  ? "bg-[#6D8B5B] text-white"
                                  : "bg-[#D97745] text-white hover:bg-[#C96B3B]"
                              }
                            `}
                          >
                            {saved
                              ? "✓ Đã lưu"
                              : "Lưu ngay"}
                          </button>
                        )}

                      </div>

                    </div>

                  </motion.div>
                );
              })}
          </div>
        )}

        {/* SHOW MORE */}

        {hiddenVoucherCount > 0 && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="
                rounded-full
                border
                border-[#D9D3CA]
                bg-white
                px-4
                py-1.5
                text-xs
                font-medium
                text-neutral-700
                transition
                hover:bg-[#D97745]
                hover:text-white
              "
            >
              {showAll
                ? "Thu gọn"
                : `Xem thêm ${hiddenVoucherCount} ưu đãi`}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}