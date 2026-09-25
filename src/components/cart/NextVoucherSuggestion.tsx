import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  TicketPercent,
  Flame,
  Lightbulb,
  ArrowRight,
  Check,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { formatUSDFromVND } from "@/lib/format";

interface Props {
  subtotal: number;
}

interface Voucher {
  id: string;
  title: string;
  type: string;
  value: number;
  min_order: number;
  max_discount: number;
  active: boolean;

  start_at: string;
  end_at: string;
  quantity: number;
  used: number;
}

export default function NextVoucherSuggestion({
  subtotal,
}: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("active", true)
      .eq("is_personal", false)
      .lte("start_at", now)
      .gte("end_at", now)
      .order("min_order", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    const validVouchers = (data ?? []).filter((v: any) => {
      if (v.max_uses == null) return true;

      return v.used_count < v.max_uses;
    });

    setVouchers(validVouchers as Voucher[]);
  }

  const sorted = useMemo(() => {
    return [...vouchers].sort(
      (a, b) =>
        Number(a.min_order) -
        Number(b.min_order),
    );
  }, [vouchers]);

  if (sorted.length === 0) return null;

  const unlocked = sorted.filter(
    (voucher) =>
      subtotal >= Number(voucher.min_order),
  );

  const nextVoucher = sorted.find(
    (voucher) =>
      subtotal < Number(voucher.min_order),
  );

  /* =========================================================
     TẤT CẢ VOUCHER ĐÃ ĐỦ ĐIỀU KIỆN
  ========================================================= */

  if (!nextVoucher) {
    return (
      <section
        className="
          mt-6
          overflow-hidden
          rounded-2xl
          border
          border-[#D8E3D3]
          bg-white
        "
      >
        {/* HEADER */}

        <div className="border-b border-[#DDE4D8] bg-[#F5F8F2] px-5 py-5">
          <div className="flex items-start gap-4">

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#6F8B5E]
                text-white
              "
            >
              <TicketPercent
                className="h-5 w-5"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0">

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#6F8B5E]
                "
              >
                Ưu đãi của bạn
              </p>

              <h3 className="mt-1 text-[17px] font-semibold text-[#292C25]">
                Bạn đã đủ điều kiện nhận ưu đãi
              </h3>

              <p className="mt-1.5 text-[12px] leading-5 text-[#73776D]">
                Các ưu đãi đã được mở khóa cho đơn hàng này.
              </p>

            </div>
          </div>
        </div>

        {/* VOUCHER LIST */}

        <div className="space-y-2.5 p-5">

          {unlocked.map((voucher) => (
            <div
              key={voucher.id}
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-[#E3E8DE]
                bg-[#FBFCFA]
                px-3.5
                py-3
              "
            >

              <div className="flex min-w-0 items-center gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#EAF1E5]
                    text-[#6F8B5E]
                  "
                >
                  <TicketPercent
                    className="h-4 w-4"
                    strokeWidth={1.7}
                  />
                </div>

                <div className="min-w-0">

                  <div className="truncate text-[13px] font-semibold text-[#30342C]">
                    {voucher.title}
                  </div>

                  <div className="mt-1 text-[11px] text-[#777B72]">
                    {voucher.type === "percent"
                      ? `Giảm ${voucher.value}%${
                          Number(
                            voucher.max_discount,
                          ) > 0
                            ? ` · Tối đa ${formatUSDFromVND(
                                voucher.max_discount,
                              )}`
                            : ""
                        }`
                      : voucher.type === "shipping"
                      ? "Miễn phí vận chuyển"
                      : `Giảm ${formatUSDFromVND(
                          voucher.value,
                        )}`}
                  </div>

                </div>

              </div>

              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#6F8B5E]
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-white
                "
              >
                <Check
                  className="h-3 w-3"
                  strokeWidth={2}
                />
                Đã mở khóa
              </span>

            </div>
          ))}

          {/* =================================================
              IMPORTANT CHECKOUT NOTICE
          ================================================= */}

          <div
            className="
              mt-4
              border
              border-[#D8E2D2]
              bg-[#F4F8F1]
              p-4
            "
          >

            <div className="flex items-start gap-3">

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#6F8B5E]
                  text-white
                "
              >
                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              </div>

              <div>

                <p className="text-[12px] font-semibold text-[#34382F]">
                  Voucher chưa được áp dụng
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#6F736A]">
                  Bạn cần sang bước{" "}
                  <span className="font-semibold text-[#596A4D]">
                    Thanh toán
                  </span>{" "}
                  để chọn và áp dụng voucher cho đơn hàng.
                </p>

              </div>

            </div>

            {/* CHECKOUT STEPS */}

            <div className="mt-4 flex items-center">

              <div className="flex items-center gap-2">

                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8B5E]
                    text-[10px]
                    font-semibold
                    text-white
                  "
                >
                  1
                </span>

                <span className="text-[10px] font-medium text-[#59614F]">
                  Giỏ hàng
                </span>

              </div>

              <div className="mx-3 h-px flex-1 bg-[#CBD6C5]" />

              <div className="flex items-center gap-2">

                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#8EA37B]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#6F8B5E]
                  "
                >
                  2
                </span>

                <span className="text-[10px] font-medium text-[#59614F]">
                  Thanh toán
                </span>

              </div>

            </div>

          </div>

          {/* CHECKOUT BUTTON */}

          <Link
            to="/checkout"
            className="
              mt-3
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              bg-[#667653]
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white
              transition-colors
              hover:bg-[#566544]
            "
          >
            Đến bước thanh toán

            <ArrowRight
              className="h-4 w-4"
              strokeWidth={1.6}
            />
          </Link>

          <p className="pt-1 text-center text-[10px] text-[#969A91]">
            Voucher sẽ được áp dụng tại bước thanh toán
          </p>

        </div>
      </section>
    );
  }

  /* =========================================================
     TÍNH TOÁN VOUCHER TIẾP THEO
  ========================================================= */

  const remain =
    Number(nextVoucher.min_order) -
    subtotal;

  const progress = Math.min(
    100,
    (subtotal /
      Number(nextVoucher.min_order)) *
      100,
  );

  const savingText =
    nextVoucher.type === "percent"
      ? `Giảm ${nextVoucher.value}%${
          Number(nextVoucher.max_discount) > 0
            ? ` (tối đa ${formatUSDFromVND(
                nextVoucher.max_discount,
              )})`
            : ""
        }`
      : nextVoucher.type === "shipping"
      ? "Miễn phí vận chuyển"
      : `Giảm ${formatUSDFromVND(
          nextVoucher.value,
        )}`;

  /* =========================================================
     CHƯA ĐỦ ĐIỀU KIỆN
  ========================================================= */

  return (
    <section
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border
        border-[#DCE5D4]
        bg-white
        shadow-sm
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          border-b
          border-[#D9E3D2]
          bg-[#6F8B5E]
          px-5
          py-4
          text-white
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/15
            "
          >
            <TicketPercent
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          </div>

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Exclusive offers
            </p>

            <h3 className="mt-0.5 text-[15px] font-semibold">
              Sắp mở khóa ưu đãi tiếp theo
            </h3>

            <p className="mt-0.5 text-[11px] text-white/80">
              Mua thêm để mở khóa ưu đãi
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-5">

        {/* VOUCHER LIST */}

        <div className="space-y-2">

          {sorted.map((voucher) => {

            const reached =
              subtotal >=
              Number(voucher.min_order);

            return (
              <div
                key={voucher.id}
                className={`
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  border
                  px-3
                  py-3
                  transition-all
                  ${
                    reached
                      ? "border-[#C8D8BF] bg-[#F3F8F1]"
                      : "border-[#ECE7DF] bg-[#FCFBF9]"
                  }
                `}
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        reached
                          ? "bg-[#E5F0E0] text-[#6F8B5E]"
                          : "bg-[#F2EFE9] text-[#85887F]"
                      }
                    `}
                  >
                    <TicketPercent
                      className="h-4 w-4"
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="min-w-0">

                    <div className="truncate text-[13px] font-semibold text-neutral-800">
                      {voucher.title}
                    </div>

                    <div className="mt-1 text-[11px] text-neutral-500">
                      Đơn từ{" "}
                      {formatUSDFromVND(
                        voucher.min_order,
                      )}
                    </div>

                  </div>

                </div>

                {reached ? (
                  <span
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                      rounded-full
                      bg-[#6F8B5E]
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-white
                    "
                  >
                    <Check
                      className="h-3 w-3"
                      strokeWidth={2}
                    />
                    Đã mở khóa
                  </span>
                ) : (
                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-[#EEF5EB]
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-[#6F8B5E]
                    "
                  >
                    Còn thiếu{" "}
                    {formatUSDFromVND(
                      Number(
                        voucher.min_order,
                      ) - subtotal,
                    )}
                  </span>
                )}

              </div>
            );
          })}

        </div>

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <div className="mt-6">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-[11px] text-neutral-500">
              Tiến độ mở khóa
            </span>

            <span className="text-[11px] font-semibold text-[#6F8B5E]">
              {Math.round(progress)}%
            </span>

          </div>

          <div
            className="
              h-1.5
              overflow-hidden
              rounded-full
              bg-[#E7E4DD]
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-[#8EA37B]
                transition-all
                duration-700
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

        {/* ===================================================
            NEXT OFFER
        =================================================== */}

        <div
          className="
            mt-5
            border
            border-[#DDE6D5]
            bg-[#F7FAF5]
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <Flame
              className="h-3.5 w-3.5 text-[#6F8B5E]"
              strokeWidth={1.8}
            />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#6F8B5E]
              "
            >
              Ưu đãi tiếp theo
            </span>

          </div>

          <div
            className="
              mt-2
              text-[22px]
              font-bold
              leading-none
              text-[#6F8B5E]
            "
          >
            {formatUSDFromVND(remain)}
          </div>

          <p className="mt-2 text-[13px] leading-5 text-neutral-700">

            Còn thiếu{" "}

            <span className="font-semibold text-[#6F8B5E]">
              {formatUSDFromVND(remain)}
            </span>

            {" "}để mở khóa{" "}

            <span className="font-semibold text-neutral-800">
              {savingText}
            </span>

          </p>

          {/* INFO */}

          <div
            className="
              mt-4
              flex
              items-start
              gap-2
              border-t
              border-[#E2E8DE]
              pt-3
              text-[11px]
              leading-5
              text-neutral-500
            "
          >

            <Lightbulb
              className="
                mt-0.5
                h-3.5
                w-3.5
                shrink-0
                text-[#8EA37B]
              "
              strokeWidth={1.7}
            />

            <span>
              Khi đủ điều kiện, ưu đãi sẽ được mở khóa.
              Bạn có thể áp dụng voucher ở bước{" "}
              <span className="font-semibold text-[#667653]">
                Thanh toán
              </span>
              .
            </span>

          </div>

        </div>

        {/* ===================================================
            SHOP MORE
        =================================================== */}

        <Link
          to="/shop"
          className="
            mt-5
            flex
            h-11
            items-center
            justify-center
            gap-2
            bg-[#8EA37B]
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-white
            transition
            hover:bg-[#5D7650]
          "
        >
          Chọn thêm sản phẩm

          <ArrowRight
            className="h-4 w-4"
            strokeWidth={1.6}
          />
        </Link>

      </div>
    </section>
  );
}