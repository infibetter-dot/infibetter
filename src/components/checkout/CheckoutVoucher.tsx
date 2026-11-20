import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateVoucherDiscount } from "./voucher-engine/calculator";
import { TicketPercent } from "lucide-react";

import { Button } from "@/components/ui/button";

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

  const { vouchers } = useVoucher(phone);


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

  const customerVouchers = vouchers.filter(
    (voucher) => voucher.isWelcome === true,
  );

  useEffect(() => {
    if (!autoSelect || selectedCustomerVoucher || customerVouchers.length === 0) {
      return;
    }

    const eligible = customerVouchers
      .filter((voucher) => subtotal >= voucher.min_order)
      .sort(
        (a, b) =>
          calculateVoucherDiscount(b, subtotal) -
          calculateVoucherDiscount(a, subtotal),
      );

    if (eligible[0]) setSelectedCustomerVoucher(eligible[0]);
  }, [autoSelect, customerVouchers, selectedCustomerVoucher, subtotal]);

  const finalTotal = Math.max(
    0,
    subtotal +
      shippingFee -
      summary.discountAmount -
      summary.shippingDiscount -
      customerDiscount,
  );

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const applyVoucherCode = async () => {
    const code = voucherCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter a voucher code.");
      return;
    }

    if (checkingCode) return;

    setCheckingCode(true);

    try {
      

      const { data: customerData, error: customerError } = await supabase
        .from("customer_vouchers")
        .select("*")
        .eq("voucher_code", code)
        .eq("is_used", false)
        .maybeSingle();

      if (customerError) {
        console.error("CHECK CUSTOMER VOUCHER ERROR:", customerError);
      }

      let data: any = customerData ?? null;
      let isCustomerVoucher = Boolean(customerData);

      if (!data) {
        const { data: marketingData, error: marketingError } = await supabase
          .from("vouchers")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (marketingError) {
          console.error("CHECK VOUCHER ERROR:", marketingError);
          toast.error("Unable to check this voucher.");
          return;
        }

        data = marketingData;
        isCustomerVoucher = false;
      }

      if (!data) {
        toast.error("Voucher code not found.");
        return;
      }

      if (!isCustomerVoucher && data.active !== true) {
        toast.error("This voucher is not active.");
        return;
      }

      if (isCustomerVoucher && String(data.phone ?? "") !== phone.trim()) {
        toast.error("This voucher does not belong to this phone number.");
        return;
      }

      const now = new Date();

      if (data.start_at && now < new Date(data.start_at)) {
        toast.error("This voucher is not active yet.");
        return;
      }

      if (data.end_at && now > new Date(data.end_at)) {
        toast.error("This voucher has expired.");
        return;
      }

      if (
        data.quantity !== null &&
        Number(data.used ?? 0) >= Number(data.quantity)
      ) {
        toast.error("This voucher has reached its usage limit.");
        return;
      }

      if (data.manual_apply === false) {
        toast.error("This voucher cannot be entered manually.");
        return;
      }

      const minOrder = Number(data.min_order ?? 0);

      if (subtotal < minOrder) {
        toast.error(
          `Order subtotal must be at least ${formatMoney(minOrder)} to use this voucher.`, 
        );
        return;
      }

      // Ki?m tra voucher theo s?n ph?m n?u voucher c� gi?i h?n s?n ph?m.
      const applyType = String(
        data.apply_type ?? data.applyType ?? "all",
      ).toLowerCase();

      const applyId = data.apply_id ?? data.applyId ?? null;

      if (applyType === "product" && applyId != null) {
        const hasProduct = (cartItems ?? []).some(
          (item: any) => String(item.id) === String(applyId),
        );

        if (!hasProduct) {
          toast.error("This voucher only applies to selected products.");
          return;
        }
      }

      // Map type c?a DB v? type m� voucher-engine hi?n t?i dang s? d?ng.
      // DB m?i: discount_percent / discount_fixed / free_shipping
      // Engine: percent / fixed / shipping
      const dbType = String(
        isCustomerVoucher ? data.discount_type ?? "percent" : data.type ?? "",
      ).toLowerCase();

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
        toast.error("This voucher type is not supported.");
        return;
      }

      const mappedVoucher: VoucherDisplay = {
        ...data,
        id: String(data.id),
        code: String(isCustomerVoucher ? data.voucher_code : data.code),
        title: data.title ?? data.full_name ?? String(code),
        type: engineType,
        value: Number(
          isCustomerVoucher
            ? data.discount ?? data.value ?? 0
            : data.value ?? 0,
        ),
        min_order: minOrder,
        max_discount:
          data.max_discount != null
            ? Number(data.max_discount)
            : 0,
        isWelcome: isCustomerVoucher,
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
      // 2. Voucher gi?m theo don
      // 3. Personal voucher cu / c� nh�n
      if (engineType === "shipping") {
        if (
          selectedShipping &&
          selectedShipping.code !== mappedVoucher.code
        ) {
          toast.error("Only one shipping voucher can be applied.");
          return;
        }

        setSelectedShipping(mappedVoucher);
      } else {
        const isPersonalVoucher = isCustomerVoucher ||
          data.is_personal === true ||
          data.personal === true ||
          data.customer_voucher === true ||
          data.voucher_group === "customer" ||
          data.category === "customer";

        if (isPersonalVoucher) {
          if (
            selectedCustomerVoucher &&
            selectedCustomerVoucher.code !== mappedVoucher.code
          ) {
            toast.error("Only one personal voucher can be applied.");
            return;
          }

          setSelectedCustomerVoucher(mappedVoucher);
        } else {
          if (
            selectedDiscount &&
            selectedDiscount.code !== mappedVoucher.code
          ) {
            toast.error("Ch? du?c Apply 1 voucher gi?m theo don.");
            return;
          }

          setSelectedDiscount(mappedVoucher);
        }
      }

      // Kh�ng d? auto voucher ghi d� voucher v?a nh?p.
      setAutoSelect(false);
      setVoucherCode("");

      const appliedDiscount =
        engineType === "shipping"
          ? shippingFee
          : calculateVoucherDiscount(mappedVoucher, subtotal);

      toast.success(
        engineType === "shipping"
          ? `Voucher ${code} applied. Free shipping.`
          : `Voucher ${code} applied. You save ${formatMoney(appliedDiscount)}.`,
      );
    } catch (error) {
      console.error("APPLY VOUCHER ERROR:", error);
      toast.error("Something went wrong while applying the voucher.");
    } finally {
      setCheckingCode(false);
    }
  };

  return (
    <section className="w-full min-w-0 rounded-md border border-[#dedede] bg-white px-3 py-2.5">
      <div className="flex items-center gap-2">
        <TicketPercent
          className="h-4 w-4 shrink-0 text-[#666666]"
          strokeWidth={1.7}
        />
        <input
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void applyVoucherCode();
            }
          }}
          placeholder="Discount code or gift card"
          aria-label="Discount code or gift card"
          autoComplete="off"
          className="h-8 min-w-0 flex-1 border-0 bg-transparent px-1 text-[12px] text-[#222222] uppercase outline-none placeholder:normal-case placeholder:text-[#888888] focus:ring-0"
        />
        <Button
          type="button"
          variant="outline"
          disabled={checkingCode || !voucherCode.trim()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void applyVoucherCode();
          }}
          className="h-8 shrink-0 rounded-md border-[#e2e2e2] bg-[#f7f7f7] px-3 text-[11px] font-medium text-[#444444] shadow-none hover:bg-[#eeeeee] disabled:cursor-not-allowed"
        >
          {checkingCode ? "Applying..." : "Apply"}
        </Button>
      </div>
    </section>
  );
}
