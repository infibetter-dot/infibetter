import type {
  VoucherSummary,
  VoucherDisplay,
} from "../voucher.types";

import type {
  VoucherEngineInput,
} from "./types";

import {
  calculateVoucherDiscount,
  calculateShippingDiscount,
  calculateVoucherSaving,
} from "./calculator";

import {
  selectBestDiscountVoucher,
  selectBestShippingVoucher,
} from "./selector";

export function buildVoucherSummary(
  input: VoucherEngineInput
): VoucherSummary {

  const discountVoucher =
  input.selectedDiscount ??
  selectBestDiscountVoucher(
    input.vouchers,
    input.subtotal,
    input.cartItems
  );

  const shippingVoucher =
    input.selectedShipping ??
    selectBestShippingVoucher(
      input.vouchers,
      input.subtotal
    );

  const discountAmount =
    calculateVoucherDiscount(
      discountVoucher,
      input.subtotal
    );

  const shippingDiscount =
    calculateShippingDiscount(
      shippingVoucher,
      input.shippingFee,
      input.subtotal
    );

  const shipping =
    Math.max(
      0,
      input.shippingFee -
        shippingDiscount
    );

  return {

    discountVoucher,

    shippingVoucher,

    discountAmount,

    shippingDiscount,

    shipping,

    totalDiscount:
      calculateVoucherSaving(
        discountAmount,
        shippingDiscount
      ),

  };

}