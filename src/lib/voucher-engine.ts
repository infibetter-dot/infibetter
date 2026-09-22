/* ===========================================================
   OLIVE LIVING
   Voucher Engine V2
=========================================================== */

export type VoucherType =
  | "percent"
  | "fixed"
  | "shipping"
  | "gift"
  | "buy_x_get_y";

export interface Voucher {

  id?: string;

  code: string;

  title: string;

  description?: string;

  type: VoucherType;

  value: number;

  min_order: number;

  max_discount: number | null;

  quantity: number;

  used: number;

  active: boolean;

  start_at: string;

  end_at: string;

  apply_type:
    | "all"
    | "product"
    | "category";

  apply_id?: string | null;

  manual_apply?: boolean;

  auto_apply?: boolean;

  usage_per_customer?: number;

  is_personal?: boolean;

}

export interface VoucherValidationResult {

  valid: boolean;

  message: string;

}

export interface VoucherDiscountResult {

  discount: number;

  shippingDiscount: number;

  finalDiscount: number;

}

/* ===========================================================
   Check Active
=========================================================== */

export function isVoucherActive(
  voucher: Voucher
) {

  if (!voucher.active) {

    return false;

  }

  const now = Date.now();

  const start = new Date(
    voucher.start_at
  ).getTime();

  const end = new Date(
    voucher.end_at
  ).getTime();

  return now >= start && now <= end;

}

/* ===========================================================
   Check Quantity
=========================================================== */

export function hasVoucherQuantity(
  voucher: Voucher
) {

  return voucher.used < voucher.quantity;

}

/* ===========================================================
   Check Min Order
=========================================================== */

export function hasMinOrder(
  voucher: Voucher,
  subtotal: number
) {

  return subtotal >= voucher.min_order;

}

/* ===========================================================
   Validate Voucher
=========================================================== */

export function validateVoucher(

  voucher: Voucher,

  subtotal: number,

) : VoucherValidationResult {

  if (!voucher.active) {

    return {

      valid:false,

      message:"Voucher đã bị khóa"

    };

  }

  if (!isVoucherActive(voucher)) {

    return {

      valid:false,

      message:"Voucher đã hết hạn"

    };

  }

  if (!hasVoucherQuantity(voucher)) {

    return {

      valid:false,

      message:"Voucher đã hết lượt"

    };

  }

  if (!hasMinOrder(voucher,subtotal)) {

    return {

      valid:false,

      message:`Đơn hàng tối thiểu ${voucher.min_order.toLocaleString("vi-VN")}đ`

    };

  }

  return {

    valid:true,

    message:"OK"

  };

}

/* ===========================================================
   Calculate Discount
=========================================================== */

export function calculateVoucherDiscount(

  voucher: Voucher,

  subtotal: number,

): VoucherDiscountResult {

  let discount = 0;

  let shippingDiscount = 0;

  switch (voucher.type) {

    case "percent":

      discount =
        subtotal *
        (voucher.value / 100);

      if (

        voucher.max_discount &&

        discount >
          voucher.max_discount

      ) {

        discount =
          voucher.max_discount;

      }

      break;

    case "fixed":

      discount = voucher.value;

      break;

    case "shipping":

      shippingDiscount =
        voucher.value;

      break;

    case "gift":

      discount = 0;

      break;

    case "buy_x_get_y":

      discount = 0;

      break;

    default:

      discount = 0;

  }

  discount = Math.min(
    discount,
    subtotal
  );

  return {

    discount,

    shippingDiscount,

    finalDiscount:
      discount +
      shippingDiscount,

  };

}

/* ===========================================================
   Apply Voucher
=========================================================== */

export function applyVoucher(

  voucher: Voucher,

  subtotal: number,

) {

  const validation =
    validateVoucher(
      voucher,
      subtotal
    );

  if (!validation.valid) {

    return {

      success: false,

      reason:
        validation.message,

      discount: 0,

      shippingDiscount: 0,

      finalDiscount: 0,

    };

  }

  const result =
    calculateVoucherDiscount(
      voucher,
      subtotal
    );

  return {

    success: true,

    reason: "",

    ...result,

  };

}

/* ===========================================================
   Find Voucher By Code
=========================================================== */

export function findVoucherByCode(

  vouchers: Voucher[],

  code: string,

) {

  return vouchers.find(

    (voucher) =>

      voucher.code
        .trim()
        .toUpperCase() ===

      code
        .trim()
        .toUpperCase()

  );

}

/* ===========================================================
   Public Voucher
=========================================================== */

export function getManualVouchers(

  vouchers: Voucher[]

) {

  return vouchers.filter(

    (voucher) =>

      voucher.manual_apply

  );

}

export function getAutoVouchers(

  vouchers: Voucher[]

) {

  return vouchers.filter(

    (voucher) =>

      voucher.auto_apply

  );

}

/* ===========================================================
   Merge Voucher Sources
=========================================================== */

export interface VoucherSource {

  marketing: Voucher[];

  welcome: Voucher[];

  personal: Voucher[];

}

export function mergeVoucherSources(

  source: VoucherSource

): Voucher[] {

  const map = new Map<string, Voucher>();

  [

    ...source.marketing,

    ...source.welcome,

    ...source.personal,

  ].forEach((voucher) => {

    map.set(voucher.code, voucher);

  });

  return Array.from(map.values());

}

/* ===========================================================
   Voucher Priority
=========================================================== */

export function sortVoucherPriority(

  vouchers: Voucher[]

) {

  return [...vouchers].sort((a, b) => {

    const score = (voucher: Voucher) => {

      let value = 0;

      if (voucher.auto_apply) value += 100;

      if (voucher.is_personal) value += 50;

      if (voucher.manual_apply) value += 10;

      return value;

    };

    return score(b) - score(a);

  });

}

/* ===========================================================
   Best Voucher
=========================================================== */

export function getBestVoucher(

  vouchers: Voucher[],

  subtotal: number,

) {

  let best: Voucher | null = null;

  let bestDiscount = 0;

  vouchers.forEach((voucher) => {

    const result = applyVoucher(

      voucher,

      subtotal

    );

    if (

      result.success &&

      result.finalDiscount >

        bestDiscount

    ) {

      best = voucher;

      bestDiscount =

        result.finalDiscount;

    }

  });

  return best;

}

/* ===========================================================
   Manual Voucher
=========================================================== */

export function validateVoucherCode(

  vouchers: Voucher[],

  code: string,

  subtotal: number,

) {

  const voucher = findVoucherByCode(

    vouchers,

    code

  );

  if (!voucher) {

    return {

      success: false,

      message: "Không tìm thấy mã giảm giá",

      voucher: null,

    };

  }

  const result = applyVoucher(

    voucher,

    subtotal

  );

  if (!result.success) {

    return {

      success: false,

      message: result.reason,

      voucher: null,

    };

  }

  return {

    success: true,

    message: "Áp dụng thành công",

    voucher,

    ...result,

  };

}

/* ===========================================================
   Generate Voucher Code
=========================================================== */

export function generateVoucherCode(

  prefix = "OLV"

) {

  const chars =

    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let random = "";

  for (let i = 0; i < 6; i++) {

    random += chars.charAt(

      Math.floor(

        Math.random() *

          chars.length

      )

    );

  }

  return `${prefix}-${random}`;

}