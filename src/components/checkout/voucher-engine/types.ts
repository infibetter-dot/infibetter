import type {
  VoucherDisplay,
  VoucherSummary,
} from "../voucher.types";

export interface VoucherEngineInput {



  subtotal: number;

  shippingFee: number;

  vouchers: VoucherDisplay[];

  selectedDiscount?: VoucherDisplay | null;

  selectedShipping?: VoucherDisplay | null;

  cartItems: any[];

}

export interface VoucherEngineResult
  extends VoucherSummary {}

export interface VoucherRuleResult {

  available: boolean;

  reason?: string;

}

export interface VoucherMatchContext {

  subtotal: number;

  products?: string[];

  categories?: string[];

  memberLevel?: string;

  birthday?: boolean;

}