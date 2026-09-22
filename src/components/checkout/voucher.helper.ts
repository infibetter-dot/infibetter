import type {
  MarketingVoucher,
  WelcomeVoucher,
  VoucherDisplay,
  VoucherSummary,
} from "./voucher.types";

/* ============================================================
   Convert Welcome Voucher
============================================================ */

export function convertWelcomeVoucher(
  voucher: WelcomeVoucher
): VoucherDisplay {
  return {
    id: voucher.id,

    code: voucher.voucher_code,

    title: "Voucher chào mừng",

    description: "Voucher dành cho khách hàng mới",

    type: "fixed",

    value: voucher.discount,

    min_order: voucher.min_order,

    max_discount: 0,

    isWelcome: true,

    isReached: false,

    isSelected: false,

    badge: "WELCOME",

    badgeColor: "#22c55e",

    icon: undefined,

    applyType: null,

    applyId: null,
  };
}

/* ============================================================
   Convert Marketing Voucher
============================================================ */

export function convertMarketingVoucher(
  voucher: MarketingVoucher
): VoucherDisplay {
  return {
    id: voucher.id,
    code: voucher.code,
    title: voucher.title,
    description: voucher.description ?? "",

    type: voucher.type,

    value: Number(voucher.value),

    min_order: Number(voucher.min_order),

    max_discount: Number(voucher.max_discount),

    isWelcome: false,

    isReached: false,

    isSelected: false,

    badge: voucher.badge ?? undefined,

    badgeColor: voucher.badge_color ?? undefined,

    icon: voucher.icon ?? undefined,

    applyType: voucher.apply_type,

    applyId: voucher.apply_id,
  };
}
  


/* ============================================================
   Merge Voucher
============================================================ */

export function mergeVoucher(

  marketing: MarketingVoucher[],

  welcome: WelcomeVoucher[]

): VoucherDisplay[] {

  const result: VoucherDisplay[] = [];

  marketing.forEach((v) => {

    result.push(

      convertMarketingVoucher(v)

    );

  });

  welcome.forEach((v) => {

    if (!v.is_used) {

      result.push(

        convertWelcomeVoucher(v)

      );

    }

  });

  return result.sort(

    (a, b) =>

      a.min_order - b.min_order

  );

}

/* ============================================================
   Best Discount Voucher
============================================================ */

export function findBestDiscountVoucher(
  vouchers: VoucherDisplay[],
  subtotal: number
): VoucherDisplay | null {

  const available = vouchers.filter(
    (v) =>
      v.type !== "shipping" &&
      subtotal >= v.min_order
  );

  if (available.length === 0) return null;

  let best = available[0];
  let bestDiscount = 0;

  available.forEach((voucher) => {

    let discount = 0;

    if (voucher.type === "fixed") {

      discount = voucher.value;

    } else {

      discount =
        subtotal *
        voucher.value /
        100;

      if (
        voucher.max_discount > 0 &&
        discount > voucher.max_discount
      ) {

        discount =
          voucher.max_discount;

      }

    }

    if (discount > bestDiscount) {

      bestDiscount = discount;
      best = voucher;

    }

  });

  return best;

}

/* ============================================================
   Best Shipping Voucher
============================================================ */

export function findBestShippingVoucher(
  vouchers: VoucherDisplay[],
  subtotal: number
): VoucherDisplay | null {

  return (
    vouchers.find(
      (v) =>
        v.type === "shipping" &&
        subtotal >= v.min_order
    ) ?? null
  );

}

/* ============================================================
   Discount Amount
============================================================ */

export function calculateDiscount(

  voucher: VoucherDisplay | null,

  subtotal: number

  

): number {

  if (!voucher) return 0;

  if (subtotal < voucher.min_order)
    return 0;

  if (voucher.type === "fixed") {

    return voucher.value;

  }

  if (voucher.type === "percent") {

    let discount =
      subtotal *
      voucher.value /
      100;

    if (
      voucher.max_discount > 0 &&
      discount > voucher.max_discount
    ) {

      discount =
        voucher.max_discount;

    }

    return Math.round(discount);

  }

  return 0;

}

/* ============================================================
   Shipping Discount
============================================================ */

export function calculateShippingDiscount(

  voucher: VoucherDisplay | null,

  shippingFee: number,

  subtotal: number

): number {

  if (!voucher) return 0;

  if (voucher.type !== "shipping")
    return 0;

  if (subtotal < voucher.min_order)
    return 0;

  return Math.min(

    shippingFee,

    voucher.value

  );

}

/* ============================================================
   Build Voucher Summary
============================================================ */

export function buildVoucherSummary(

  vouchers: VoucherDisplay[],

  subtotal: number,

  shippingFee: number,

  selectedDiscountVoucher?: VoucherDisplay | null,

  selectedShippingVoucher?: VoucherDisplay | null,

): VoucherSummary {

  const discountVoucher =

    selectedDiscountVoucher ??

    findBestDiscountVoucher(

      vouchers,

      subtotal

    );

  const shippingVoucher =

    selectedShippingVoucher ??

    findBestShippingVoucher(

      vouchers,

      subtotal

    );

  const discountAmount =

    calculateDiscount(

      discountVoucher,

      subtotal

    );

  const shippingDiscount =

    calculateShippingDiscount(

      shippingVoucher,

      shippingFee,

      subtotal

    );

  const shipping =

    Math.max(

      0,

      shippingFee -

      shippingDiscount

    );



  return {

    discountVoucher,

    shippingVoucher,

    discountAmount,

    shippingDiscount,

    shipping,

    totalDiscount:

      discountAmount +

      shippingDiscount,

  };

}

/* ============================================================
   Voucher Status
============================================================ */

export function isVoucherReached(

  voucher: VoucherDisplay,

  subtotal: number

) {

  return subtotal >= voucher.min_order;

}

export function getVoucherRemain(

  voucher: VoucherDisplay,

  subtotal: number

) {

  if (

    subtotal >=

    voucher.min_order

  ) {

    return 0;

  }

  return (

    voucher.min_order -

    subtotal

  );

}

/* ============================================================
   Voucher Label
============================================================ */

export function getVoucherLabel(

  voucher: VoucherDisplay

) {

  if (

    voucher.type ===

    "shipping"

  ) {

    return "Miễn phí vận chuyển";

  }

  if (

    voucher.type ===

    "fixed"

  ) {

    return `Giảm ${voucher.value.toLocaleString()}đ`;

  }

  return `Giảm ${voucher.value}%`;

}

/* ============================================================
   Voucher Save
============================================================ */

export function getVoucherSaving(

  voucher: VoucherDisplay,

  subtotal: number,

  shippingFee: number

) {

  if (

    voucher.type ===

    "shipping"

  ) {

    return Math.min(

      shippingFee,

      voucher.value

    );

  }

  return calculateDiscount(

    voucher,

    subtotal

  );

}