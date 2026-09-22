import { useState } from "react";
import type { FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, ArrowLeft, ShieldCheck, Mail, Gift } from "lucide-react";

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

type MasterVoucher = {
  id: string;
  code: string;
  value: number | null;
  min_order: number | null;
  max_discount: number | null;
  quantity: number | null;
  used: number | null;
  active: boolean | null;
  start_at: string | null;
  end_at: string | null;
  manual_apply: boolean | null;
  auto_apply: boolean | null;
  usage_per_customer: number | null;
  is_personal: boolean | null;
};

export const Route = createFileRoute("/voucher-register")({
  component: VoucherRegisterPage,
});

/**
 * Chuẩn hóa số điện thoại Việt Nam
 *
 * +84901234567
 * 84901234567
 * 0901234567
 *
 * đều trở thành:
 * 0901234567
 */
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

/**
 * Kiểm tra số điện thoại Việt Nam
 */
function isValidVietnamPhone(phone: string) {
  return /^(03|05|07|08|09)[0-9]{8}$/.test(
    normalizePhone(phone),
  );
}

/**
 * Kiểm tra email
 */
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    email.trim(),
  );
}

/**
 * Tạo mã voucher cá nhân
 *
 * Ví dụ:
 * OLV-A7K92P
 */
function generateVoucherCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

  /**
   * Cập nhật input
   */
  function updateField(
    field: keyof FormData,
    value: string,
  ) {
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

  /**
   * Validate form
   */
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
      nextErrors.phone =
        "Vui lòng nhập số điện thoại.";
    } else if (!isValidVietnamPhone(phone)) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
    }

    if (!email) {
      nextErrors.email =
        "Vui lòng nhập email.";
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    setErrors(nextErrors);

    return {
      valid: Object.keys(nextErrors).length === 0,
      name,
      phone,
      email,
    };
  }

  /**
   * Submit đăng ký voucher
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    const result = validate();

    if (!result.valid) return;

    setSubmitting(true);
    setErrors({});

    try {
      /**
       * =========================================================
       * 1. LẤY VOUCHER MASTER
       * =========================================================
       */

      const {
        data: masterVoucher,
        error: voucherError,
      } = await supabase
        .from("vouchers")
        .select(
          `
            id,
            code,
            value,
            min_order,
            max_discount,
            quantity,
            used,
            active,
            start_at,
            end_at,
            manual_apply,
            auto_apply,
            usage_per_customer,
            is_personal
          `,
        )
        .eq("code", "OLV-T2V4NF")
        .maybeSingle<MasterVoucher>();

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

      /**
       * =========================================================
       * 2. KIỂM TRA VOUCHER MASTER
       * =========================================================
       */

      const now = Date.now();

      // Voucher inactive
      if (!masterVoucher.active) {
        setErrors({
          general:
            "Chương trình voucher hiện không hoạt động.",
        });

        return;
      }

      // Voucher chưa bắt đầu
      if (
        masterVoucher.start_at &&
        new Date(
          masterVoucher.start_at,
        ).getTime() > now
      ) {
        setErrors({
          general:
            "Chương trình voucher chưa bắt đầu.",
        });

        return;
      }

      // Voucher hết hạn
      if (
        masterVoucher.end_at &&
        new Date(
          masterVoucher.end_at,
        ).getTime() < now
      ) {
        setErrors({
          general:
            "Chương trình voucher đã kết thúc.",
        });

        return;
      }

      /**
       * Đảm bảo voucher master đúng cấu hình:
       *
       * 5%
       * Không minimum
       * Max 35.000đ
       */

      const voucherPercent = Number(
        masterVoucher.value ?? 0,
      );

      const voucherMinOrder = Number(
        masterVoucher.min_order ?? 0,
      );

      const voucherMaxDiscount = Number(
        masterVoucher.max_discount ?? 0,
      );

      if (voucherPercent <= 0) {
        setErrors({
          general:
            "Voucher chưa được cấu hình đúng mức giảm.",
        });

        return;
      }

      if (voucherMinOrder < 0) {
        setErrors({
          general:
            "Cấu hình minimum order của voucher không hợp lệ.",
        });

        return;
      }

      if (voucherMaxDiscount <= 0) {
        setErrors({
          general:
            "Cấu hình mức giảm tối đa của voucher không hợp lệ.",
        });

        return;
      }

      /**
       * =========================================================
       * 3. KIỂM TRA SĐT ĐÃ NHẬN VOUCHER CHƯA
       * =========================================================
       */

      const {
        data: existingCustomerVoucher,
        error: voucherCheckError,
      } = await supabase
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

      if (existingCustomerVoucher) {
        setErrors({
          general:
            "Số điện thoại này đã được đăng ký nhận voucher trước đó.",
        });

        return;
      }

      /**
       * =========================================================
       * 4. KIỂM TRA PHONE TRONG POTENTIAL CUSTOMERS
       * =========================================================
       */

      const {
        data: existingPhone,
        error: phoneError,
      } = await supabase
        .from("potential_customers")
        .select("id")
        .eq("phone", result.phone)
        .limit(1)
        .maybeSingle();

      if (phoneError) {
        console.error(
          "CHECK PHONE ERROR:",
          phoneError,
        );
      }

      /**
       * =========================================================
       * 5. KIỂM TRA EMAIL TRONG POTENTIAL CUSTOMERS
       * =========================================================
       */

      const {
        data: existingEmail,
        error: emailError,
      } = await supabase
        .from("potential_customers")
        .select("id")
        .eq("email", result.email)
        .limit(1)
        .maybeSingle();

      if (emailError) {
        console.error(
          "CHECK EMAIL ERROR:",
          emailError,
        );
      }

      /**
       * Nếu phone hoặc email đã từng đăng ký
       * thì không cấp thêm voucher.
       */
      if (
        existingPhone ||
        existingEmail
      ) {
        setErrors({
          general:
            "Email hoặc số điện thoại này đã được đăng ký nhận voucher trước đó.",
        });

        return;
      }

      /**
       * =========================================================
       * 6. KIỂM TRA SỐ LƯỢNG VOUCHER
       * =========================================================
       *
       * Lưu ý:
       * Logic này giữ theo cấu trúc DB hiện tại của bạn.
       */

      const {
        count: issuedCount,
        error: issuedCountError,
      } = await supabase
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
        (issuedCount ?? 0) >=
          Number(masterVoucher.quantity)
      ) {
        setErrors({
          general:
            "Voucher đăng ký đã được phát hết. Cảm ơn bạn đã quan tâm đến Olive Living.",
        });

        return;
      }

      /**
       * =========================================================
       * 7. TẠO MÃ VOUCHER CÁ NHÂN
       * =========================================================
       */

      let personalVoucherCode = "";
      let codeExists = true;

      for (
        let attempt = 0;
        attempt < 10;
        attempt++
      ) {
        const candidate =
          generateVoucherCode();

        const {
          data: existingCode,
          error: codeCheckError,
        } = await supabase
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

      if (
        codeExists ||
        !personalVoucherCode
      ) {
        setErrors({
          general:
            "Không thể tạo mã voucher lúc này. Vui lòng thử lại.",
        });

        return;
      }

      /**
       * =========================================================
       * 8. LƯU KHÁCH HÀNG TIỀM NĂNG
       * =========================================================
       */

      const {
        error: saveCustomerError,
      } = await supabase
        .from("potential_customers")
        .insert({
          name: result.name,
          phone: result.phone,
          email: result.email,

          // Giữ source hiện tại để không ảnh hưởng DB
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

      /**
       * =========================================================
       * 9. CẤP VOUCHER CÁ NHÂN
       * =========================================================
       *
       * QUAN TRỌNG:
       *
       * discount = 5
       *
       * Checkout sẽ hiểu:
       * 5 = 5%
       *
       * min_order = 0
       *
       * Không minimum order.
       */

      const {
        error: customerVoucherError,
      } = await supabase
        .from("customer_vouchers")
        .insert({
          full_name: result.name,
          phone: result.phone,
          voucher_code: personalVoucherCode,

          // 5%
          discount: voucherPercent,

          // Không minimum order
          min_order: voucherMinOrder,

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

      /**
       * =========================================================
       * 10. TÍNH NGÀY HẾT HẠN CÁ NHÂN
       * =========================================================
       *
       * Voucher cá nhân:
       * 7 ngày kể từ lúc đăng ký.
       */

      const expiresAt = new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      /**
       * =========================================================
       * 11. GỬI EMAIL
       * =========================================================
       *
       * Email lỗi không làm mất voucher.
       * Voucher vẫn được tạo thành công.
       */

      try {
        const {
          error: sendEmailError,
        } = await supabase.functions.invoke(
          "send-voucher-email",
          {
            body: {
              name: result.name,
              email: result.email,
              voucherCode:
                personalVoucherCode,
              expiresAt,
            },
          },
        );

        if (sendEmailError) {
          console.error(
            "SEND VOUCHER EMAIL ERROR:",
            sendEmailError,
          );
        }
      } catch (emailError) {
        console.error(
          "SEND VOUCHER EMAIL EXCEPTION:",
          emailError,
        );
      }

      /**
       * =========================================================
       * 12. LƯU TRẠNG THÁI ĐÃ ĐĂNG KÝ
       * =========================================================
       */

      localStorage.setItem(
        "olive_popup_registered_v1",
        "true",
      );

      localStorage.setItem(
        "olive_personal_voucher_code",
        personalVoucherCode,
      );

      /**
       * =========================================================
       * 13. HIỂN THỊ SUCCESS
       * =========================================================
       */

      setVoucherCode(
        personalVoucherCode,
      );

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
    <>
    <style>{`
      @keyframes oliveCardIn {
        0% {
          opacity: 0;
          transform: translateY(28px) scale(0.97);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes olivePromoIn {
        0% {
          opacity: 0;
          transform: translateX(28px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes oliveButtonIn {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(0.96);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes oliveImageIn {
        0% {
          opacity: 0;
          transform: scale(1.045);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes oliveShine {
        0% {
          transform: translateX(-160%) skewX(-18deg);
        }
        100% {
          transform: translateX(420%) skewX(-18deg);
        }
      }

      .olive-image-effect {
        animation: oliveImageIn 1200ms cubic-bezier(.22,1,.36,1) both;
      }

      .olive-card-effect-1 {
        animation: oliveCardIn 700ms cubic-bezier(.22,1,.36,1) 120ms both;
        transition:
          transform 300ms ease,
          box-shadow 300ms ease,
          border-color 300ms ease;
      }

      .olive-card-effect-2 {
        animation: oliveCardIn 700ms cubic-bezier(.22,1,.36,1) 260ms both;
        transition:
          transform 300ms ease,
          box-shadow 300ms ease,
          border-color 300ms ease;
      }

      .olive-promo-effect {
        animation: olivePromoIn 700ms cubic-bezier(.22,1,.36,1) 420ms both;
        transition:
          transform 300ms ease,
          box-shadow 300ms ease,
          border-color 300ms ease;
      }

      .olive-button-effect {
        animation: oliveButtonIn 650ms cubic-bezier(.22,1,.36,1) 560ms both;
      }

      .olive-card-effect-1:hover,
      .olive-card-effect-2:hover,
      .olive-promo-effect:hover {
        transform: translateY(-5px);
        box-shadow: 0 18px 42px rgba(65,52,38,.13);
      }

      .olive-button-effect::after {
        content: "";
        position: absolute;
        top: -40%;
        bottom: -40%;
        left: 0;
        width: 25%;
        background: rgba(255,255,255,.20);
        transform: translateX(-160%) skewX(-18deg);
      }

      .olive-button-effect:hover::after {
        animation: oliveShine 850ms ease-out 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .olive-image-effect,
        .olive-card-effect-1,
        .olive-card-effect-2,
        .olive-promo-effect,
        .olive-button-effect {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }

        .olive-button-effect::after {
          display: none;
        }
      }
    `}</style>
    <main className="min-h-screen bg-[#F7F3ED] text-[#252525]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#6F716C] transition hover:text-[#C77B55]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Quay lại Olive Living
        </Link>

        {!success ? (
          <section className="overflow-hidden rounded-[28px] border border-[#E8E0D6] bg-white shadow-[0_30px_90px_rgba(65,52,38,0.10)]">
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              {/* VISUAL */}
              <div className="bg-[#EDE4D8] p-3 sm:p-5 lg:p-7">
                <div className="overflow-hidden rounded-[22px] bg-[#F4EEE6]">
                  <img
                    src="/images/BF08.png"
                    alt="Olive Living New Member Voucher"
                    className="block h-auto w-full"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
                  <div className="olive-card-effect-1 group rounded-2xl border border-[#DDD3C7] bg-white/80 p-3 shadow-[0_8px_24px_rgba(65,52,38,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C77B55]/30 hover:bg-white hover:shadow-[0_14px_32px_rgba(65,52,38,0.10)] sm:p-4">
                    <Gift size={18} strokeWidth={1.6} className="text-[#C77B55] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3" />
                    <p className="mt-2 text-xs font-medium text-[#4B4B47] sm:text-sm">
                      New member offer
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-[#8A8A84] sm:text-xs">
                      5% OFF · tối đa 35.000đ
                    </p>
                  </div>

                  <div className="olive-card-effect-2 group rounded-2xl border border-[#DDD3C7] bg-white/80 p-3 shadow-[0_8px_24px_rgba(65,52,38,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C77B55]/30 hover:bg-white hover:shadow-[0_14px_32px_rgba(65,52,38,0.10)] sm:p-4">
                    <ShieldCheck size={18} strokeWidth={1.6} className="text-[#4D5745] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
                    <p className="mt-2 text-xs font-medium text-[#4B4B47] sm:text-sm">
                      Ưu đãi cá nhân
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-[#8A8A84] sm:text-xs">
                      Hiệu lực 7 ngày từ lúc đăng ký
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM */}
              <div className="flex flex-col justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9A9A94] sm:text-xs">
                    Olive Living
                  </p>

                  <h1 className="mt-3 font-serif text-3xl leading-[1.08] text-[#292929] sm:text-4xl lg:text-[42px]">
                    Nhận voucher
                    <span className="block text-[#C77B55]">5% OFF</span>
                  </h1>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#777873] sm:text-[15px]">
                    Đăng ký ngay để không bỏ lỡ những voucher độc quyền và ưu đãi đặc biệt lên đến 49% OFF từ Olive Living.
                  </p>

                  <div className="olive-promo-effect group mt-6 rounded-2xl border border-transparent bg-[#FAF7F2] p-4 shadow-[0_10px_30px_rgba(65,52,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C77B55]/15 hover:bg-[#FFFDF9] hover:shadow-[0_16px_36px_rgba(65,52,38,0.10)] sm:mt-7 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#C77B55] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                        <Gift size={16} strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3E403B]">
                          Ưu đãi dành cho thành viên mới
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#85857F]">
                          Không yêu cầu đơn tối thiểu · giảm tối đa 35.000đ
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-7 space-y-4 sm:mt-8">
                    <div>
                      <label htmlFor="voucher-name" className="mb-2 block text-xs font-medium text-[#555650]">
                        Họ và tên
                      </label>
                      <input
                        id="voucher-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        disabled={submitting}
                        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#333] outline-none transition placeholder:text-[#A7A7A1] ${errors.name ? "border-red-400 focus:border-red-400" : "border-[#DED8D0] focus:border-[#C77B55]"}`}
                      />
                      {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="voucher-phone" className="mb-2 block text-xs font-medium text-[#555650]">
                        Số điện thoại
                      </label>
                      <input
                        id="voucher-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        placeholder="Nhập số điện thoại"
                        autoComplete="tel"
                        inputMode="numeric"
                        disabled={submitting}
                        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#333] outline-none transition placeholder:text-[#A7A7A1] ${errors.phone ? "border-red-400 focus:border-red-400" : "border-[#DED8D0] focus:border-[#C77B55]"}`}
                      />
                      {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="voucher-email" className="mb-2 block text-xs font-medium text-[#555650]">
                        Email
                      </label>
                      <div className="relative">
                        <Mail size={17} strokeWidth={1.6} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A29C]" />
                        <input
                          id="voucher-email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          placeholder="Nhập email của bạn"
                          autoComplete="email"
                          disabled={submitting}
                          className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#333] outline-none transition placeholder:text-[#A7A7A1] ${errors.email ? "border-red-400 focus:border-red-400" : "border-[#DED8D0] focus:border-[#C77B55]"}`}
                        />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {errors.general && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                        {errors.general}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="olive-button-effect group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#4D5745] px-5 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3F4939] hover:shadow-[0_16px_34px_rgba(77,87,69,0.22)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[130%] skew-x-[-18deg] bg-white/20 group-hover:animate-[oliveShine_1.1s_ease-out_1]" />
                      <span className="relative z-10">
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          ĐANG XỬ LÝ...
                        </span>
                      ) : (
                        "NHẬN VOUCHER 5%"
                      )}
                      </span>
                    </button>
                  </form>

                  <p className="mt-5 text-center text-[11px] leading-5 text-[#9A9A94]">
                    Voucher có hiệu lực 7 ngày kể từ lúc đăng ký.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-2xl rounded-[28px] border border-[#E8E0D6] bg-white px-5 py-12 text-center shadow-[0_30px_90px_rgba(65,52,38,0.10)] sm:px-10 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F6EE]">
              <CheckCircle2 size={36} strokeWidth={1.7} className="text-[#4D5745]" />
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9A9A94]">
              Olive Living
            </p>
            <h1 className="mt-3 font-serif text-3xl text-[#292929] sm:text-4xl">
              Đăng ký thành công!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777873]">
              Voucher cá nhân của bạn đã được tạo thành công.
            </p>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#FAF7F2] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A9A94]">
                NEW MEMBER OFFER
              </p>
              <p className="mt-2 text-4xl font-semibold text-[#C77B55]">5% OFF</p>
              <p className="mt-2 text-xs leading-5 text-[#777873]">
                Tối đa 35.000đ · Không yêu cầu giá trị đơn tối thiểu
              </p>
            </div>

            <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-dashed border-[#C77B55]/50 bg-white px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#9A9A94]">
                Mã voucher của bạn
              </p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-[0.18em] text-[#4D5745]">
                {voucherCode}
              </p>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#999992]">
              <Mail size={14} strokeWidth={1.6} />
              Mã voucher đã được gửi đến email của bạn.
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#4D5745] px-7 text-xs font-semibold tracking-wide text-white transition hover:bg-[#3F4939]"
            >
              TIẾP TỤC MUA SẮM
            </Link>
          </section>
        )}

        {!success && (
          <div className="mx-auto mt-7 flex max-w-2xl flex-col items-center justify-center gap-2 text-center text-[11px] text-[#9A9A94] sm:flex-row sm:gap-5">
            <span>🔒 Thông tin được bảo mật</span>
            <span className="hidden sm:inline">•</span>
            <span>Voucher cá nhân · 7 ngày</span>
            <span className="hidden sm:inline">•</span>
            <span>Olive Living</span>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
