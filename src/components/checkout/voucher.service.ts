import { supabase } from "@/integrations/supabase/client";

import type {
  MarketingVoucher,
  WelcomeVoucher,
  VoucherDisplay,
} from "./voucher.types";

import {
  mergeVoucher,
} from "./voucher.helper";

/* ============================================================
   Marketing Voucher
============================================================ */

export async function getMarketingVouchers(): Promise<MarketingVoucher[]> {
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
    console.error(
      "[Voucher] Marketing Voucher:",
      error
    );

    return [];
  }

  console.log("MARKETING DATA", data);
console.log("MARKETING ERROR", error);

  return (data ?? []) as MarketingVoucher[];
}

/* ============================================================
   Welcome Voucher
============================================================ */

export async function getWelcomeVouchers(
  phone: string
): Promise<WelcomeVoucher[]> {

  if (!phone.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_vouchers")
    .select("*")
    .eq("phone", phone)
    .eq("is_used", false)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[Voucher] Welcome Voucher:",
      error
    );

    return [];
  }

  return (data ?? []) as WelcomeVoucher[];

}

/* ============================================================
   Merge Voucher
============================================================ */

export async function loadCheckoutVouchers(
  phone?: string
): Promise<VoucherDisplay[]> {

  const marketing =
    await getMarketingVouchers();

  let welcome: WelcomeVoucher[] = [];

  if (phone?.trim()) {

    welcome =
      await getWelcomeVouchers(phone);

  }

  const merged = mergeVoucher(
    marketing,
    welcome
  );

  console.log("Marketing", marketing);
  console.log("Welcome", welcome);
  console.log("Merged", merged);

  return merged;

}

export async function getVoucherByCode(
  code: string
): Promise<MarketingVoucher | null> {
  if (!code.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code.trim())
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error(
      "[Voucher] Get Voucher:",
      error
    );

    return null;
  }

  return (data as MarketingVoucher) ?? null;
}

/* ============================================================
   Use Marketing Voucher
============================================================ */

export async function increaseVoucherUsed(
  voucherId: string
): Promise<boolean> {
  if (!voucherId) return false;

  const { data, error } = await supabase
    .from("vouchers")
    .select("used")
    .eq("id", voucherId)
    .single();

  if (error || !data) {
    console.error(
      "[Voucher] Read used:",
      error
    );

    return false;
  }

  const { error: updateError } =
    await supabase
      .from("vouchers")
      .update({
        used:
          Number(data.used ?? 0) + 1,
      })
      .eq("id", voucherId);

  if (updateError) {
    console.error(
      "[Voucher] Update used:",
      updateError
    );

    return false;
  }

  return true;
}

/* ============================================================
   Use Welcome Voucher
============================================================ */

export async function markWelcomeVoucherUsed(
  voucherId: string
): Promise<boolean> {
  if (!voucherId) return false;

    const { error } = await supabase
    .from("customer_vouchers")
    .update({
      is_used: true,
    })
    .eq("id", voucherId);

  if (error) {
    console.error(
      "[Voucher] Update Welcome Voucher:",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   Apply Voucher
============================================================ */

export async function applyCheckoutVoucher(params: {
  discountVoucher?: VoucherDisplay | null;
  shippingVoucher?: VoucherDisplay | null;
}) {
  const tasks: Promise<boolean>[] = [];

  if (params.discountVoucher) {
    if (params.discountVoucher.isWelcome) {
      tasks.push(
        markWelcomeVoucherUsed(
          params.discountVoucher.id
        )
      );
    } else {
      tasks.push(
        increaseVoucherUsed(
          params.discountVoucher.id
        )
      );
    }
  }

  if (
    params.shippingVoucher &&
    !params.shippingVoucher.isWelcome
  ) {
    tasks.push(
      increaseVoucherUsed(
        params.shippingVoucher.id
      )
    );
  }

  if (tasks.length === 0) {
    return true;
  }

  const result = await Promise.all(tasks);

  return result.every(Boolean);
}