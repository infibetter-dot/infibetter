import { supabase } from "@/integrations/supabase/client";

export async function registerVoucher(data: {
  full_name: string;
  phone: string;
  interest: string;
}) {
  // Kiểm tra khách đã đăng ký chưa

 const { data: existed, error: existedError } = await supabase
  .from("customer_vouchers")
  .select("id")
  .eq("phone", data.phone);

if (existedError) {
  return {
    success: false,
    message: existedError.message,
  };
}

if (existed && existed.length > 0) {
  return {
    success: false,
    message: "Bạn đã nhận voucher rồi.",
  };
}

  const voucherPrefix =
  "OLIVE-" +
  Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

const { error } = await supabase
  .from("customer_vouchers")
  .insert([
    {
      full_name: data.full_name,
      phone: data.phone,
      interest: data.interest,
      voucher_code: `${voucherPrefix}-15`,
      discount: 15000,
      min_order: 399000,
      is_used: false,
    },
    {
      full_name: data.full_name,
      phone: data.phone,
      interest: data.interest,
      voucher_code: `${voucherPrefix}-25`,
      discount: 25000,
      min_order: 599000,
      is_used: false,
    },
    {
      full_name: data.full_name,
      phone: data.phone,
      interest: data.interest,
      voucher_code: `${voucherPrefix}-35`,
      discount: 35000,
      min_order: 999000,
      is_used: false,
    },
  ]);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    voucher: `${voucherPrefix}-15`,
  };
}