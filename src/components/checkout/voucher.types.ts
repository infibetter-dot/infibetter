/* ============================================================
   OLIVE LIVING
   Voucher Types
============================================================ */

export type VoucherType =
  | "fixed"
  | "percent"
  | "shipping";

export interface MarketingVoucher {

  id: string;

  code: string;

  title: string;

  description: string | null;

  type: VoucherType;

  value: number;

  min_order: number;

  max_discount: number;

  quantity: number;

  used: number;

  start_at: string;

  end_at: string;

  active: boolean;

  badge: string | null;

  badge_color: string | null;

  icon: string | null;

  created_at: string;

  apply_type: string | null;

  apply_id: string | null;

}

export interface WelcomeVoucher {

  id: string;

  full_name: string;

  phone: string;

  interest: string | null;

  voucher_code: string;

  discount: number;

  min_order: number;

  is_used: boolean;

  created_at: string;

}

export interface VoucherDisplay {

  id: string;

  code: string;

  title: string;

  description?: string;

  type: VoucherType;

  value: number;

  min_order: number;

  max_discount: number;

  isWelcome: boolean;

  isReached: boolean;

  isSelected: boolean;

  badge?: string;

  badgeColor?: string;

  icon?: string;

  applyType?: string | null;

  applyId?: string | null;

}

export interface VoucherSummary {

  discountVoucher: VoucherDisplay | null;

  shippingVoucher: VoucherDisplay | null;

  discountAmount: number;

  shippingDiscount: number;

  shipping: number;

  totalDiscount: number;

}

export interface CheckoutVoucherProps {

  subtotal: number;

  shippingFee: number;

  phone: string;

  cartItems: any[]; // tạm thời dùng any

  onChange: (
    summary: VoucherSummary
  ) => void;

}