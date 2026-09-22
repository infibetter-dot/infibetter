import { useEffect, useState } from "react";
import {
  Gift,
  Truck,
  Ticket,
  Percent,
  Copy,
  Check,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type Voucher = {
  id: string;
  code: string;
  title: string | null;
  description?: string | null;
  type: string;
  value: number | null;
  min_order: number | null;
  max_discount?: number | null;
  active: boolean;
  start_at?: string | null;
  end_at?: string | null;
};

function formatVND(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(Number(value ?? 0)) + "đ";
}

function getVoucherIcon(type: string) {
  switch (type) {
    case "freeship":
      return Truck;

    case "percent":
      return Percent;

    case "fixed":
      return Gift;

    default:
      return Ticket;
  }
}

function getVoucherStyle(type: string) {
  switch (type) {
    case "freeship":
      return {
        iconBg: "bg-[#E8F1E5]",
        iconColor: "text-[#58705D]",
        badge: "HOT",
      };

    case "percent":
      return {
        iconBg: "bg-[#F1EEE8]",
        iconColor: "text-[#5C6D60]",
        badge: "BEST",
      };

    case "fixed":
      return {
        iconBg: "bg-[#F4EDE5]",
        iconColor: "text-[#5C6D60]",
        badge: "NEW",
      };

    default:
      return {
        iconBg: "bg-[#F1EEE8]",
        iconColor: "text-[#5C6D60]",
        badge: "VOUCHER",
      };
  }
}

function getVoucherTitle(voucher: Voucher) {
  const value = Number(voucher.value ?? 0);

  switch (voucher.type) {
    case "freeship":
      return "Miễn phí vận chuyển";

    case "percent":
      return `Giảm ${value}%`;

    case "fixed":
      return `Giảm ${formatVND(value)}`;

    default:
      return voucher.title || "Ưu đãi đặc biệt";
  }
}

function getVoucherDescription(voucher: Voucher) {
  const minOrder = Number(voucher.min_order ?? 0);

  if (minOrder > 0) {
    return `Đơn từ ${formatVND(minOrder)}`;
  }

  return voucher.description || "Áp dụng cho đơn hàng";
}

function saveVoucher(voucher: Voucher) {
  try {
    const raw = localStorage.getItem("olive_saved_vouchers");

    const savedVouchers = raw ? JSON.parse(raw) : [];

    const existed = savedVouchers.some(
      (item: any) => item.code === voucher.code
    );

    if (existed) {
      return false;
    }

    savedVouchers.push({
      id: voucher.id,
      code: voucher.code,
      title: getVoucherTitle(voucher),
      value: Number(voucher.value ?? 0),
      type: voucher.type,
      minOrder: Number(voucher.min_order ?? 0),
      maxDiscount: Number(voucher.max_discount ?? 0),
    });

    localStorage.setItem(
      "olive_saved_vouchers",
      JSON.stringify(savedVouchers)
    );

    return true;
  } catch (error) {
    console.error("Save voucher error:", error);
    return false;
  }
}

export default function FlashSaleVoucher() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

 async function loadVouchers() {
  setLoading(true);

  try {
    
    const { data, error } = await supabase
  .from("vouchers")
  .select("*")
  .eq("active", true)
  .eq("is_personal", false)
  .order("created_at", {
    ascending: false,
  });

    if (error) {
      console.error("Load Flash Sale vouchers error:", error);
      setVouchers([]);
      return;
    }

    const now = new Date();

    const validVouchers = (data ?? []).filter((voucher: Voucher) => {
      const startAt = voucher.start_at
        ? new Date(voucher.start_at)
        : null;

      const endAt = voucher.end_at
        ? new Date(voucher.end_at)
        : null;

      // Chưa tới ngày bắt đầu → không hiện
      if (startAt && now < startAt) {
        return false;
      }

      // Đã quá ngày kết thúc → không hiện
      if (endAt && now > endAt) {
        return false;
      }

      return true;
    });

    setVouchers(validVouchers as Voucher[]);
  } catch (error) {
    console.error("Load vouchers error:", error);
    setVouchers([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadVouchers();
  }, []);

  async function handleSaveVoucher(voucher: Voucher) {
    const saved = saveVoucher(voucher);

    if (saved) {
      try {
        await navigator.clipboard.writeText(voucher.code);
      } catch {
        // Clipboard có thể bị browser chặn, không ảnh hưởng việc lưu voucher.
      }

      setCopiedCode(voucher.code);

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } else {
      // Voucher đã tồn tại trong localStorage
      try {
        await navigator.clipboard.writeText(voucher.code);
      } catch {
        // ignore
      }

      setCopiedCode(voucher.code);

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    }
  }

  if (loading) {
    return (
      <section className="mt-10">
        <div className="mb-6">
          <h2 className="font-display text-3xl">
            🎁 Voucher độc quyền
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Lưu ngay để sử dụng khi thanh toán
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[185px] animate-pulse rounded-[22px] border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (vouchers.length === 0) {
    return (
      <section className="mt-10">
        <div className="mb-6">
          <h2 className="font-display text-3xl">
            🎁 Voucher độc quyền
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Lưu ngay để sử dụng khi thanh toán
          </p>
        </div>

        <div className="rounded-[22px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <Ticket className="mx-auto h-8 w-8 text-neutral-400" />

          <p className="mt-3 text-sm text-neutral-500">
            Hiện chưa có voucher khả dụng.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="font-display text-3xl">
          🎁 Voucher độc quyền
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Lưu ngay để sử dụng khi thanh toán
        </p>
      </div>

      {/* VOUCHER LIST */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher.type);
          const style = getVoucherStyle(voucher.type);

          const isCopied = copiedCode === voucher.code;

          return (
            <div
              key={voucher.id}
              className="group relative overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* BADGE */}
              <div
                className={`absolute right-4 top-4 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${
                  voucher.type === "freeship"
                    ? "bg-[#58705D]"
                    : "bg-[#657568]"
                }`}
              >
                {style.badge}
              </div>

              {/* TOP */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.iconBg}`}
                >
                  <Icon
                    size={26}
                    strokeWidth={1.8}
                    className={style.iconColor}
                  />
                </div>

                <div className="min-w-0 pr-16">
                  {/* CODE */}
                  <p className="font-display text-lg leading-tight text-[#142019]">
                    {voucher.code}
                  </p>

                  {/* TITLE */}
                  <h3 className="mt-1 text-[15px] font-semibold text-[#142019]">
                    {getVoucherTitle(voucher)}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="mt-1 text-sm text-neutral-500">
                    {getVoucherDescription(voucher)}
                  </p>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="my-5 border-t border-dashed border-neutral-200" />

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={() => handleSaveVoucher(voucher)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                  isCopied
                    ? "bg-[#E7F0E5] text-[#58705D]"
                    : "bg-[#58705D] text-white hover:bg-[#4B6250]"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check size={16} />
                    Đã lưu mã
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Lưu mã
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}