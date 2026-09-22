import type { VoucherDisplay } from "../voucher.types";
import type { VoucherMatchContext } from "./types";

/* ============================================================
   Voucher Matcher
============================================================ */

export function matchVoucher(
  voucher: VoucherDisplay,
  context: VoucherMatchContext
): boolean {

  // Điều kiện tối thiểu
  if (context.subtotal < voucher.min_order) {
    return false;
  }

  // V1: tất cả voucher đều áp dụng
  // Sau này sẽ mở rộng:
  // - apply_type = category
  // - apply_type = product
  // - member
  // - birthday
  // - flash sale

  return true;

}