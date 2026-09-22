import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ArrowLeft, Gift } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type FormData = {
  name: string;
  phone: string;
  email: string;
};

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
  general?: string;
};

export const Route = createFileRoute("/voucher-register/backup")({
  component: VoucherRegisterPage,
});

function normalizePhone(phone: string) {
  let value = phone
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "");

  if (value.startsWith("+84")) {
    value = "0" + value.slice(3);
  } else if (value.startsWith("84")) {
    value = "0" + value.slice(2);
  }

  return value;
}

function isValidVietnamPhone(phone: string) {
  return /^(03|05|07|08|09)[0-9]{8}$/.test(
    normalizePhone(phone),
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    email.trim(),
  );
}

function generateVoucherCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";

  for (let i = 0; i < 6; i++) {
    randomPart += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return `OLV-${randomPart}`;
}

function VoucherRegisterPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    const name = form.name.trim();
    const phone = normalizePhone(form.phone);
    const email = form.email.trim().toLowerCase();

    if (!name) {
      nextErrors.name = "Vui lòng nhập họ và tên.";
    } else if (name.length < 2) {
      nextErrors.name = "Họ tên chưa hợp lệ.";
    }

    if (!phone) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!isValidVietnamPhone(phone)) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
    }

    if (!email) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    setErrors(nextErrors);

    return {
      valid: Object.keys(nextErrors).length === 0,
      name,
      phone,
      email,
    };
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    const result = validate();

    if (!result.valid) return;

    setSubmitting(true);
    setErrors({});

    try {
      // 1. Lấy voucher mẫu
      const { data: masterVoucher, error: voucherError } =
        await supabase
          .from("vouchers")
          .select(
            "id, code, value, min_order, max_discount, quantity, used, active, start_at, end_at, manual_apply, auto_apply, usage_per_customer, is_personal",
          )
          .eq("code", "OLV-T2V4NF")
          .maybeSingle();

      if (voucherError || !masterVoucher) {
        console.error(
          "LOAD MASTER VOUCHER ERROR:",
          voucherError,
        );

        setErrors({
          general:
            "Không thể tải chương trình voucher. Vui lòng thử lại sau.",
        });
        return;
      }

      // 2. Kiểm tra voucher mẫu
      const now = Date.now();

      if (!masterVoucher.active) {
        setErrors({
          general:
            "Chương trình voucher hiện không hoạt động.",
        });
        return;
      }

      if (
        masterVoucher.start_at &&
        new Date(masterVoucher.start_at).getTime() > now
      ) {
        setErrors({
          general:
            "Chương trình voucher chưa bắt đầu.",
        });
        return;
      }

      if (
        masterVoucher.end_at &&
        new Date(masterVoucher.end_at).getTime() < now
      ) {
        setErrors({
          general:
            "Chương trình voucher đã kết thúc.",
        });
        return;
      }

      // 3. Không cho đăng ký lại bằng SĐT đã nhận voucher
      const { data: existingCustomerVoucher, error: voucherCheckError } =
        await supabase
          .from("customer_vouchers")
          .select("id")
          .eq("phone", result.phone)
          .limit(1)
          .maybeSingle();

      if (voucherCheckError) {
        console.error(
          "CHECK EXISTING CUSTOMER VOUCHER ERROR:",
          voucherCheckError,
        );

        setErrors({
          general:
            "Không thể kiểm tra thông tin đăng ký. Vui lòng thử lại.",
        });
        return;
      }

      // 4. Kiểm tra phone/email trong potential_customers
      const { data: existingPhone, error: phoneError } =
        await supabase
          .from("potential_customers")
          .select("id")
          .eq("phone", result.phone)
          .limit(1)
          .maybeSingle();

      if (phoneError) {
        console.error("CHECK PHONE ERROR:", phoneError);
      }

      const { data: existingEmail, error: emailError } =
        await supabase
          .from("potential_customers")
          .select("id")
          .eq("email", result.email)
          .limit(1)
          .maybeSingle();

      if (emailError) {
        console.error("CHECK EMAIL ERROR:", emailError);
      }

      if (
        existingCustomerVoucher ||
        existingPhone ||
        existingEmail
      ) {
        setErrors({
          general:
            "Email hoặc số điện thoại này đã được đăng ký nhận voucher trước đó. Vui lòng sử dụng thông tin khác.",
        });
        return;
      }

      // 5. Kiểm tra giới hạn voucher cá nhân
      const { count: issuedCount, error: issuedCountError } =
        await supabase
          .from("customer_vouchers")
          .select("id", {
            count: "exact",
            head: true,
          });

      if (issuedCountError) {
        console.error(
          "CHECK VOUCHER QUANTITY ERROR:",
          issuedCountError,
        );

        setErrors({
          general:
            "Không thể kiểm tra số lượng voucher còn lại. Vui lòng thử lại.",
        });
        return;
      }

      if (
        masterVoucher.quantity &&
        (issuedCount ?? 0) >= Number(masterVoucher.quantity)
      ) {
        setErrors({
          general:
            "Voucher đăng ký đã được phát hết. Cảm ơn bạn đã quan tâm đến Olive Living.",
        });
        return;
      }

      // 6. Tạo mã cá nhân
      let personalVoucherCode = "";
      let codeExists = true;

      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateVoucherCode();

        const { data: existingCode, error: codeCheckError } =
          await supabase
            .from("customer_vouchers")
            .select("id")
            .eq("voucher_code", candidate)
            .limit(1)
            .maybeSingle();

        if (codeCheckError) {
          console.error(
            "CHECK VOUCHER CODE ERROR:",
            codeCheckError,
          );

          setErrors({
            general:
              "Không thể tạo mã voucher. Vui lòng thử lại.",
          });
          return;
        }

        if (!existingCode) {
          personalVoucherCode = candidate;
          codeExists = false;
          break;
        }
      }

      if (codeExists || !personalVoucherCode) {
        setErrors({
          general:
            "Không thể tạo mã voucher lúc này. Vui lòng thử lại.",
        });
        return;
      }

      // 7. Lưu khách tiềm năng
      const { error: saveCustomerError } = await supabase
        .from("potential_customers")
        .insert({
          name: result.name,
          phone: result.phone,
          email: result.email,
          source: "voucher_page",
        });

      if (saveCustomerError) {
        console.error(
          "SAVE POTENTIAL CUSTOMER ERROR:",
          saveCustomerError,
        );

        setErrors({
          general:
            "Không thể lưu thông tin đăng ký. Vui lòng thử lại.",
        });
        return;
      }

      // 8. Cấp voucher cá nhân
      const { error: customerVoucherError } = await supabase
        .from("customer_vouchers")
        .insert({
          full_name: result.name,
          phone: result.phone,
          voucher_code: personalVoucherCode,
          discount: Number(
            masterVoucher.max_discount ?? 39000,
          ),
          min_order: Number(
            masterVoucher.min_order ?? 1449000,
          ),
          is_used: false,
        });

      if (customerVoucherError) {
        console.error(
          "CREATE CUSTOMER VOUCHER ERROR:",
          customerVoucherError,
        );

        setErrors({
          general:
            "Không thể cấp voucher. Vui lòng thử lại.",
        });
        return;
      }

      // 9. Gửi email
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      try {
        const { error: emailError } =
          await supabase.functions.invoke(
            "send-voucher-email",
            {
              body: {
                name: result.name,
                email: result.email,
                voucherCode: personalVoucherCode,
                expiresAt,
              },
            },
          );

        if (emailError) {
          console.error(
            "SEND VOUCHER EMAIL ERROR:",
            emailError,
          );
        }
      } catch (emailError) {
        console.error(
          "SEND VOUCHER EMAIL EXCEPTION:",
          emailError,
        );
      }

      // 10. Thành công
      localStorage.setItem(
        "olive_popup_registered_v1",
        "true",
      );

      localStorage.setItem(
        "olive_personal_voucher_code",
        personalVoucherCode,
      );

      setVoucherCode(personalVoucherCode);
      setSuccess(true);
    } catch (error) {
      console.error(
        "POTENTIAL CUSTOMER / VOUCHER ERROR:",
        error,
      );

      setErrors({
        general:
          "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <Link
          to="/"
          className="
            mb-5
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-neutral-500
            transition
            hover:text-neutral-900
          "
        >
          <ArrowLeft size={14} />
          Quay lại Olive Living
        </Link>

        <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          {!success ? (
            <>
              <div className="bg-[#F8F2E8] px-5 pb-4 pt-5 text-center sm:px-8 sm:pt-7">
                <div className="mx-auto mb-4 max-w-[420px] overflow-hidden rounded-2xl bg-[#FFFDF7]">
                  <img
                    src="/images/BF08.png"
                    alt="Voucher Olive Living"
                    className="block h-auto w-full object-contain"
                  />
                </div>

                <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-emerald-700">
                  OLIVE LIVING
                </p>

                <h1 className="mt-2 font-serif text-[28px] leading-tight text-gray-900 sm:text-[32px]">
                  Nhận ưu đãi đặc biệt
                </h1>

                <p className="mx-auto mt-2 max-w-[430px] text-sm leading-6 text-gray-500">
                  Đăng ký để nhận voucher và những ưu đãi đặc biệt từ
                  Olive Living.
                </p>
              </div>

              <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Họ và tên
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        updateField("name", e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      autoComplete="name"
                      disabled={submitting}
                      className={`
                        w-full rounded-xl border bg-gray-50
                        px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:bg-white
                        ${
                          errors.name
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-emerald-500"
                        }
                      `}
                    />

                    {errors.name && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Số điện thoại
                    </label>

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value)
                      }
                      placeholder="09xxxxxxxx"
                      autoComplete="tel"
                      inputMode="numeric"
                      disabled={submitting}
                      className={`
                        w-full rounded-xl border bg-gray-50
                        px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:bg-white
                        ${
                          errors.phone
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-emerald-500"
                        }
                      `}
                    />

                    <p className="mt-1 text-[9px] text-gray-400">
                      Ví dụ: 0901234567
                    </p>

                    {errors.phone && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField("email", e.target.value)
                      }
                      placeholder="example@email.com"
                      autoComplete="email"
                      disabled={submitting}
                      className={`
                        w-full rounded-xl border bg-gray-50
                        px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:bg-white
                        ${
                          errors.email
                            ? "border-red-300 focus:border-red-400"
                            : "border-gray-200 focus:border-emerald-500"
                        }
                      `}
                    />

                    <p className="mt-1 text-[10px] text-gray-400">
                      Quý khách vui lòng nhập email chính xác để nhận mã voucher.
                    </p>

                    {errors.email && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {errors.general && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
                      {errors.general}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      flex w-full items-center justify-center gap-2
                      rounded-xl bg-gray-900 px-5 py-3.5
                      text-[11px] font-semibold tracking-wide text-white
                      transition-all hover:bg-gray-800
                      active:scale-[0.99]
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        ĐANG ĐĂNG KÝ...
                      </>
                    ) : (
                      <>
                        <Gift size={15} />
                        ĐĂNG KÝ NHẬN ƯU ĐÃI
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="px-5 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2
                  size={34}
                  strokeWidth={1.8}
                  className="text-emerald-600"
                />
              </div>

              <h1 className="mt-5 font-serif text-[28px] text-gray-900">
                Đăng ký thành công!
              </h1>

              <p className="mx-auto mt-2 max-w-[400px] text-sm leading-6 text-gray-500">
                Voucher của bạn đã được tạo. Mã voucher cũng đã được gửi
                đến email bạn đăng ký.
              </p>

              <div className="mx-auto mt-6 max-w-[340px] rounded-2xl bg-[#FAF8F5] px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                  MÃ VOUCHER CỦA BẠN
                </p>

                <p className="mt-2 font-mono text-xl font-bold tracking-wider text-emerald-700">
                  {voucherCode}
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Giảm tối đa 39.000đ cho đơn từ 1.449.000đ.
                  Voucher có hiệu lực 7 ngày kể từ lúc đăng ký.
                </p>
              </div>

              <Link
                to="/"
                className="
                  mt-6 inline-flex items-center justify-center
                  rounded-full bg-gray-900 px-6 py-3
                  text-[10px] font-semibold tracking-wide text-white
                  transition hover:bg-gray-800
                "
              >
                TIẾP TỤC MUA SẮM
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
