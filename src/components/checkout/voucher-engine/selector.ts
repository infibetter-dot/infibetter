import type { VoucherDisplay } from "../voucher.types";
import { calculateVoucherDiscount } from "./calculator";

/* ============================================================
   PUBLIC DISCOUNT
   - Chỉ chọn voucher giảm giá công khai
   - Không tự động chọn voucher cá nhân
============================================================ */

export function selectBestDiscountVoucher(
  vouchers: VoucherDisplay[],
  subtotal: number,
  cartItems: any[]
): VoucherDisplay | null {
  let best: VoucherDisplay | null = null;
  let bestSaving = 0;

  for (const voucher of vouchers) {
    // Bỏ voucher freeship
    if (voucher.type === "shipping") {
      continue;
    }

    // Voucher cá nhân KHÔNG được auto apply
    if (voucher.isWelcome === true) {
      continue;
    }

    // Voucher theo sản phẩm
    if (voucher.applyType === "product") {
      const hasProduct = cartItems.some(
        (item: any) =>
          String(item.id) === String(voucher.applyId)
      );

      if (!hasProduct) {
        continue;
      }
    }

    const saving = calculateVoucherDiscount(
      voucher,
      subtotal
    );

    if (saving > bestSaving) {
      bestSaving = saving;
      best = voucher;
    }
  }

  return best;
}

/* ============================================================
   SHIPPING
============================================================ */

export function selectBestShippingVoucher(
  vouchers: VoucherDisplay[],
  subtotal: number
): VoucherDisplay | null {
  return (
    vouchers.find(
      (voucher) =>
        voucher.type === "shipping" &&
        subtotal >= voucher.min_order
    ) ?? null
  );
}