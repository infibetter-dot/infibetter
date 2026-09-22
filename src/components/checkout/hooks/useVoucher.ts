import { useCallback, useEffect, useState } from "react";

import type { VoucherDisplay } from "../voucher.types";

import {
  loadCheckoutVouchers,
} from "../voucher.service";

interface UseVoucherResult {
  vouchers: VoucherDisplay[];

  loading: boolean;

  error: string | null;

  refresh: () => Promise<void>;
}

export function useVoucher(
  phone: string
): UseVoucherResult {

  const [
    vouchers,
    setVouchers,
  ] = useState<VoucherDisplay[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const load = useCallback(
    async () => {

      setLoading(true);

      setError(null);

      try {

        const result =
  await loadCheckoutVouchers(
    phone
  );

console.log("PHONE:", phone);
console.log("RESULT:", result);

setVouchers(result);

      } catch (err) {

        console.error(err);

        setError(
          "Không thể tải Voucher."
        );

      } finally {

        setLoading(false);

      }

    },

    [phone]

  );

  

   useEffect(() => {

  load();

}, [phone, load]);

  const refresh = useCallback(
    async () => {

      await load();

    },
    [load]
  );

 

    return {

    vouchers,

    loading,

    error,

    refresh,

  };

}