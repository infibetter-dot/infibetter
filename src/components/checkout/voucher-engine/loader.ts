import type {
  VoucherDisplay,
} from "../voucher.types";

import {
  loadCheckoutVouchers,
} from "../voucher.service";

export async function loadVoucherEngine(

  phone: string

): Promise<VoucherDisplay[]> {

  return loadCheckoutVouchers(
    phone
  );

}