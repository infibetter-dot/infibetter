import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateVoucherDiscount } from "./voucher-engine/calculator";
import { Check, ChevronDown, CircleDollarSign, Tag, TicketPercent, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

import VoucherCard from "./VoucherCard";
import { useVoucher } from "./hooks/useVoucher";

import {
  buildVoucherSummary,
  selectBestDiscountVoucher,
  selectBestShippingVoucher,
} from "./voucher-engine";

import type {
  CheckoutVoucherProps,
  VoucherDisplay,
} from "./voucher.types";

export default function CheckoutVoucher({
  subtotal,
  shippingFee,
  phone,
  cartItems,
  onChange,
}: CheckoutVoucherProps) {
  const [autoSelect, setAutoSelect] = useState(true);

  const [voucherCode, setVoucherCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const { vouchers, loading } = useVoucher(phone);

  const [open, setOpen] = useState(false);

  const [selectedDiscount, setSelectedDiscount] =
    useState<VoucherDisplay | null>(null);

  const [selectedShipping, setSelectedShipping] =
    useState<VoucherDisplay | null>(null);

  const [selectedCustomerVoucher, setSelectedCustomerVoucher] =
    useState<VoucherDisplay | null>(null);

  const bestDiscount = useMemo(
    () => selectBestDiscountVoucher(vouchers, subtotal),
    [vouchers, subtotal],
  );

  const bestShipping = useMemo(
    () => selectBestShippingVoucher(vouchers, subtotal),
    [vouchers, subtotal],
  );

  useEffect(() => {
    if (autoSelect && !selectedDiscount && bestDiscount) {
      setSelectedDiscount(bestDiscount);
    }
  }, [autoSelect, bestDiscount, selectedDiscount]);

  useEffect(() => {
    if (!selectedShipping && bestShipping) {
      setSelectedShipping(bestShipping);
    }
  }, [bestShipping, selectedShipping]);



  const baseSummary = useMemo(
    () =>
      buildVoucherSummary({
        vouchers,
        subtotal,
        shippingFee,
        selectedDiscount,
        selectedShipping,
      }),
    [
      vouchers,
      subtotal,
      shippingFee,
      selectedDiscount,
      selectedShipping,
    ],
  );

  const customerDiscount = useMemo(() => {
    if (!selectedCustomerVoucher) return 0;

    return Math.min(
      calculateVoucherDiscount(selectedCustomerVoucher, subtotal),
      Math.max(0, subtotal - baseSummary.discountAmount),
    );
  }, [selectedCustomerVoucher, subtotal, baseSummary.discountAmount]);

  const summary = useMemo(
    () => ({
      ...baseSummary,
      customerVoucher: selectedCustomerVoucher,
      customerDiscount,
      totalDiscount:
        Number(baseSummary.totalDiscount ?? 0) + customerDiscount,
    }),
    [baseSummary, selectedCustomerVoucher, customerDiscount],
  );

  useEffect(() => {
    onChange(summary);
  }, [summary, onChange]);

  const discountVouchers = vouchers.filter(
    (v) => v.type !== "shipping",
  );

  const shippingVouchers = vouchers.filter(
    (v) => v.type === "shipping",
  );

  const customerVouchers = vouchers.filter((v: any) => {
    return (
      v.is_personal === true ||
      v.personal === true ||
      v.customer_voucher === true ||
      v.voucher_group === "customer" ||
      v.category === "customer"
    );

  useEffect(() => {
    if (autoSelect && !selectedCustomerVoucher && customerVouchers.length > 0) {
      const eligible = customerVouchers
        .filter((voucher) => subtotal >= voucher.min_order)
        .sort(
          (a, b) =>
            calculateVoucherDiscount(b, subtotal) -
            calculateVoucherDiscount(a, subtotal),
        );

      if (eligible[0]) {
        setSelectedCustomerVoucher(eligible[0]);
      }
    }
  }, [autoSelect, customerVouchers, selectedCustomerVoucher, subtotal]);
  });

  const normalDiscountVouchers = discountVouchers.filter(
    (v: any) => !customerVouchers.some((customer) => customer.id === v.id),
  );

  const finalTotal =
    subtotal +
    shippingFee -
    summary.discountAmount -
    summary.shippingDiscount;

  const applyVoucherCode = async () => {
    const code = voucherCode.trim().toUpperCase();

    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (checkingCode) return;

    setCheckingCode(true);

    try {
      console.log("APPLY VOUCHER CLICKED:", code);

      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) {
        console.error("CHECK VOUCHER ERROR:", error);
        toast.error("Không thể kiểm tra mã giảm giá.");
        return;
      }

      if (!data) {
        toast.error("Mã giảm giá không tồn tại.");
        return;
      }

      if (data.active !== true) {
        toast.error("Mã giảm giá hiện không hoạt động.");
        return;
      }

      const now = new Date();

      if (data.start_at && now < new Date(data.start_at)) {
        toast.error("Mã giảm giá chưa bắt đầu.");
        return;
      }

      if (data.end_at && now > new Date(data.end_at)) {
        toast.error("Mã giảm giá đã hết hạn.");
        return;
      }

      if (
        data.quantity !== null &&
        Number(data.used ?? 0) >= Number(data.quantity)
      ) {
        toast.error("Mã giảm giá đã hết lượt sử dụng.");
        return;
      }

      if (data.manual_apply === false) {
        toast.error("Mã này không thể nhập thủ công.");
        return;
      }

      const minOrder = Number(data.min_order ?? 0);

      if (subtotal < minOrder) {
        toast.error(
          `Đơn hàng chưa đạt tối thiểu ${minOrder.toLocaleString("vi-VN")}đ để sử dụng mã này.`,
        );
        return;
      }

      // Kiểm tra voucher theo sản phẩm nếu voucher có giới hạn sản phẩm.
      const applyType = String(
        data.apply_type ?? data.applyType ?? "all",
      ).toLowerCase();

      const applyId = data.apply_id ?? data.applyId ?? null;

      if (applyType === "product" && applyId != null) {
        const hasProduct = (cartItems ?? []).some(
          (item: any) => String(item.id) === String(applyId),
        );

        if (!hasProduct) {
          toast.error("Voucher này chỉ áp dụng cho đúng sản phẩm.");
          return;
        }
      }

      // Map type của DB về type mà voucher-engine hiện tại đang sử dụng.
      // DB mới: discount_percent / discount_fixed / free_shipping
      // Engine: percent / fixed / shipping
      const dbType = String(data.type ?? "").toLowerCase();

      const engineType =
        dbType === "discount_percent" || dbType === "percent"
          ? "percent"
          : dbType === "discount_fixed" || dbType === "fixed"
            ? "fixed"
            : dbType === "free_shipping" ||
                dbType === "freeship" ||
                dbType === "shipping"
              ? "shipping"
              : null;

      if (!engineType) {
        console.error("UNSUPPORTED VOUCHER TYPE:", data.type);
        toast.error("Loại voucher không được hỗ trợ.");
        return;
      }

      const mappedVoucher: VoucherDisplay = {
        ...data,
        id: String(data.id),
        code: String(data.code),
        title: data.title ?? String(data.code),
        type: engineType,
        value: Number(data.value ?? 0),
        min_order: minOrder,
        max_discount:
          data.max_discount != null
            ? Number(data.max_discount)
            : null,
        quantity:
          data.quantity != null ? Number(data.quantity) : null,
        used: Number(data.used ?? 0),
        usage_per_customer:
          data.usage_per_customer != null
            ? Number(data.usage_per_customer)
            : null,
        active: true,
        manual_apply: data.manual_apply !== false,
        auto_apply: data.auto_apply === true,
        applyType,
        applyId,
      } as VoucherDisplay;

      // 3 voucher slots:
      // 1. Free Ship
      // 2. Voucher giảm theo đơn
      // 3. Voucher khách hàng cũ / cá nhân
      if (engineType === "shipping") {
        if (
          selectedShipping &&
          selectedShipping.code !== mappedVoucher.code
        ) {
          toast.error("Chỉ được áp dụng 1 mã Freeship.");
          return;
        }

        setSelectedShipping(mappedVoucher);
      } else {
        const isCustomerVoucher =
          data.is_personal === true ||
          data.personal === true ||
          data.customer_voucher === true ||
          data.voucher_group === "customer" ||
          data.category === "customer";

        if (isCustomerVoucher) {
          if (
            selectedCustomerVoucher &&
            selectedCustomerVoucher.code !== mappedVoucher.code
          ) {
            toast.error("Chỉ được áp dụng 1 voucher khách hàng.");
            return;
          }

          setSelectedCustomerVoucher(mappedVoucher);
        } else {
          if (
            selectedDiscount &&
            selectedDiscount.code !== mappedVoucher.code
          ) {
            toast.error("Chỉ được áp dụng 1 voucher giảm theo đơn.");
            return;
          }

          setSelectedDiscount(mappedVoucher);
        }
      }

      // Không để auto voucher ghi đè voucher vừa nhập.
      setAutoSelect(false);
      setVoucherCode("");

      const appliedDiscount =
        engineType === "shipping"
          ? shippingFee
          : calculateVoucherDiscount(mappedVoucher, subtotal);

      toast.success(
        engineType === "shipping"
          ? `Áp dụng mã ${code} thành công! Miễn phí vận chuyển.`
          : `Áp dụng mã ${code} thành công! Giảm ${appliedDiscount.toLocaleString("vi-VN")}đ.`,
      );
    } catch (error) {
      console.error("APPLY VOUCHER ERROR:", error);
      toast.error("Có lỗi xảy ra khi áp dụng voucher.");
    } finally {
      setCheckingCode(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-3 text-[#222222]">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2F3F0] text-[#555555]">
            <Tag className="h-3.5 w-3.5" strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h3 className="text-[12px] font-semibold leading-4 text-[#222222]">
              Voucher ưu đãi
            </h3>
            <p className="mt-0.5 text-[9px] leading-3.5 text-[#666666]">
              Có thể áp dụng tối đa 3 voucher khác nhóm
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((value) => !value)}
          className="h-8 shrink-0 gap-1.5 rounded-lg border-[#DCDDD7] bg-white px-2.5 text-[10px] font-medium text-[#333333] shadow-none hover:bg-[#F5F5F3] hover:text-[#111111]"
        >
          {open ? "Đóng" : "Chọn"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={1.8}
          />
        </Button>
      </div>

      {/* ================= VOUCHER LIST ================= */}
      {open && (
        <div className="space-y-4">
          <section>
            <h4 className="mb-2 text-[11px] font-semibold text-[#333333]">
              Voucher giảm giá
            </h4>

            <div className="space-y-2.5">
              {discountVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  bestVoucher={bestDiscount}
                  selected={selectedDiscount?.id === voucher.id}
                  disabled={subtotal < voucher.min_order}
                  saving={
                    summary.discountVoucher?.id === voucher.id
                      ? summary.discountAmount
                      : 0
                  }
                  remain={Math.max(
                    0,
                    voucher.min_order - subtotal,
                  )}
                  onSelect={(value) => {
                    if (value === null) {
                      setAutoSelect(false);
                      setSelectedDiscount(null);
                      return;
                    }

                    setAutoSelect(false);
                    setSelectedDiscount(value);
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-[11px] font-semibold text-[#333333]">
              Voucher Freeship
            </h4>

            <div className="space-y-2.5">
              {shippingVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  bestVoucher={bestShipping}
                  selected={selectedShipping?.id === voucher.id}
                  disabled={subtotal < voucher.min_order}
                  saving={
                    summary.shippingVoucher?.id === voucher.id
                      ? summary.shippingDiscount
                      : 0
                  }
                  remain={Math.max(
                    0,
                    voucher.min_order - subtotal,
                  )}
                  onSelect={(value) => {
                    if (value === null) {
                      setSelectedShipping(null);
                      return;
                    }

                    setSelectedShipping(value);
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-[11px] font-semibold text-[#333333]">
              Voucher khách hàng
            </h4>

            <div className="space-y-2.5">
              {customerVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  bestVoucher={selectedCustomerVoucher}
                  selected={selectedCustomerVoucher?.id === voucher.id}
                  disabled={subtotal < voucher.min_order}
                  saving={
                    selectedCustomerVoucher?.id === voucher.id
                      ? customerDiscount
                      : 0
                  }
                  remain={Math.max(
                    0,
                    voucher.min_order - subtotal,
                  )}
                  onSelect={(value) => {
                    if (value === null) {
                      setSelectedCustomerVoucher(null);
                      return;
                    }

                    setAutoSelect(false);
                    setSelectedCustomerVoucher(value);
                  }}
                />
              ))}
            </div>
          </section>

          {loading && (
            <div className="rounded-xl border border-dashed border-[#DADAD6] px-4 py-4 text-center text-[10px] text-[#666666]">
              Đang tải voucher...
            </div>
          )}

          {!loading && vouchers.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#DADAD6] px-4 py-4 text-center">
              <p className="text-[10px] text-[#666666]">
                Bạn chưa có voucher khả dụng.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= PROMO CODE ================= */}
      <section className="rounded-xl border border-[#E1E1DE] bg-white p-3">
        <div className="flex items-center gap-2">
          <TicketPercent
            className="h-4 w-4 shrink-0 text-[#555555]"
            strokeWidth={1.7}
          />

          <p className="text-[10.5px] font-medium text-[#333333]">
            Có mã giảm giá?
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          <input
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value.toUpperCase());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void applyVoucherCode();
              }
            }}
            placeholder="Nhập mã giảm giá..."
            autoComplete="off"
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#DCDDD7] bg-white px-3 text-[10px] text-[#222222] uppercase outline-none placeholder:text-[#999999] focus:border-[#999999]"
          />

          <Button
            type="button"
            disabled={checkingCode}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void applyVoucherCode();
            }}
            className="relative z-50 !h-9 shrink-0 pointer-events-auto rounded-lg !bg-[#111111] px-4 text-[10.5px] font-semibold !text-white shadow-none hover:!bg-[#222222] disabled:cursor-not-allowed disabled:!bg-[#D8D8D5] disabled:!text-[#777777]"
          >
            {checkingCode ? "Đang kiểm tra..." : "Áp dụng"}
          </Button>
        </div>
      </section>

      {/* ================= APPLIED DISCOUNTS ================= */}
      <section className="rounded-xl border border-[#E1E1DE] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CircleDollarSign
              className="h-3.5 w-3.5 shrink-0 text-[#5F6F5D]"
              strokeWidth={1.8}
            />

            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#333333]">
                Ưu đãi đang áp dụng
              </p>
              <p className="text-[9px] text-[#777777]">
                Voucher được áp dụng cho đơn hàng
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-7 shrink-0 rounded-md border-[#DCDDD7] bg-white px-2.5 text-[9px] font-medium text-[#444444] shadow-none hover:bg-[#F5F5F3]"
          >
            Thay đổi
          </Button>
        </div>

        <div className="mt-2.5 space-y-1.5">
          {summary.discountVoucher && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F2F5F1] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Check
                  className="h-3 w-3 shrink-0 text-[#4F604E]"
                  strokeWidth={2.2}
                />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#333333]">
                    {summary.discountVoucher.title}
                  </p>
                  <p className="truncate text-[8.5px] text-[#777777]">
                    {summary.discountVoucher.code}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-semibold text-[#4F604E]">
                -{summary.discountAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {summary.shippingVoucher && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F2F5F1] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Truck
                  className="h-3 w-3 shrink-0 text-[#4F604E]"
                  strokeWidth={1.8}
                />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#333333]">
                    Miễn phí vận chuyển
                  </p>
                  <p className="truncate text-[8.5px] text-[#777777]">
                    {summary.shippingVoucher.code}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-semibold text-[#4F604E]">
                -{summary.shippingDiscount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {summary.customerVoucher && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F2F5F1] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Check
                  className="h-3 w-3 shrink-0 text-[#4F604E]"
                  strokeWidth={2.2}
                />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#333333]">
                    {summary.customerVoucher.title}
                  </p>
                  <p className="truncate text-[8.5px] text-[#777777]">
                    {summary.customerVoucher.code}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-semibold text-[#4F604E]">
                -{summary.customerDiscount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {!summary.discountVoucher &&
            !summary.shippingVoucher &&
            !summary.customerVoucher && (
              <p className="py-2 text-center text-[9px] text-[#888888]">
                Chưa có voucher nào được áp dụng.
              </p>
            )}
        </div>
      </section>

      {/* ================= TOTAL ================= */}
      <section className="rounded-xl bg-[#F3F4F1] px-3.5 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#777777]">
              Tổng thanh toán
            </p>

            {summary.totalDiscount > 0 && (
              <p className="mt-1 text-[9px] font-medium text-[#5F6F5D]">
                Đã giảm {summary.totalDiscount.toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>

          <p className="shrink-0 text-[18px] font-bold tracking-[-0.02em] text-[#222222]">
            {finalTotal.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </section>
    </div>
  );
}
