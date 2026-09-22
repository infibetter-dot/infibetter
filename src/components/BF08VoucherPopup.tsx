
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

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

/* =========================================================
   CONFIG
========================================================= */

const MASTER_VOUCHER_CODE = "OLV-T2V4NF";

const POPUP_REGISTERED_KEY =
  "olive_popup_registered_v1";

const POPUP_SHOWN_KEY =
  "olive_popup_shown_v1";

const PERSONAL_VOUCHER_KEY =
  "olive_personal_voucher_code";

const PERSONAL_VOUCHER_DAYS = 7;

/* =========================================================
   PHONE
========================================================= */

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

/* =========================================================
   EMAIL
========================================================= */

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    email.trim(),
  );
}

/* =========================================================
   VOUCHER CODE
========================================================= */

function generateVoucherCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let randomPart = "";

  for (let i = 0; i < 6; i++) {
    randomPart += characters.charAt(
      Math.floor(
        Math.random() * characters.length,
      ),
    );
  }

  return `OLV-${randomPart}`;
}

/* =========================================================
   EMAIL WITH TIMEOUT
========================================================= */

async function sendVoucherEmailWithTimeout({
  name,
  email,
  voucherCode,
  expiresAt,
}: {
  name: string;
  email: string;
  voucherCode: string;
  expiresAt: string;
}) {
  const emailPromise =
    supabase.functions.invoke(
      "send-voucher-email",
      {
        body: {
          name,
          email,
          voucherCode,
          expiresAt,
        },
      },
    );

  const timeoutPromise = new Promise<{
    data: null;
    error: Error;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        data: null,
        error: new Error(
          "SEND_VOUCHER_EMAIL_TIMEOUT",
        ),
      });
    }, 8000);
  });

  return Promise.race([
    emailPromise,
    timeoutPromise,
  ]);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function BF08VoucherPopup() {
  /*
   * Popup mặc định đóng.
   *
   * Popup sẽ tự hiện khi:
   * 1. Khách ở trang Home được 4 giây
   * HOẶC
   * 2. Khách scroll đến 50% chiều dài trang.
   *
   * Chỉ hiện 1 lần trên thiết bị.
   */
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [voucherCode, setVoucherCode] =
    useState("");

  /* =======================================================
     POPUP TRIGGER
  ======================================================= */

  useEffect(() => {
    /*
     * Đã đăng ký voucher hoặc popup đã từng xuất hiện
     * => không hiện lại.
     */
    const alreadyRegistered =
      localStorage.getItem(POPUP_REGISTERED_KEY);

    const alreadyShown =
      localStorage.getItem(POPUP_SHOWN_KEY);

    if (
      alreadyRegistered === "true" ||
      alreadyShown === "true"
    ) {
      return;
    }

    let triggered = false;
    let timer: number | undefined;

    const cleanup = () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };

    const showPopup = () => {
      if (triggered) return;

      triggered = true;

      /*
       * Đánh dấu ngay lúc popup xuất hiện.
       * Đóng popup rồi refresh cũng không hiện lại.
       */
      localStorage.setItem(
        POPUP_SHOWN_KEY,
        "true",
      );

      setOpen(true);

      cleanup();
    };

    const handleScroll = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop;

      const documentHeight =
        document.documentElement.scrollHeight;

      const windowHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight - windowHeight;

      if (scrollableHeight <= 0) return;

      /*
       * 50% của phần trang có thể scroll.
       */
      const scrollPercent =
        scrollTop / scrollableHeight;

      if (scrollPercent >= 0.5) {
        showPopup();
      }
    };

    /*
     * Hiện popup sau 4 giây
     * nếu khách chưa scroll đến 50%.
     */
    timer = window.setTimeout(() => {
      showPopup();
    }, 8000);

    /*
     * Hoặc hiện ngay khi scroll đến 50%.
     */
    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    return cleanup;
  }, []);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

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

  /* =======================================================
     VALIDATE
  ======================================================= */

  function validate() {
    const nextErrors: FormErrors = {};

    const name = form.name.trim();

    const phone = normalizePhone(
      form.phone,
    );

    const email = form.email
      .trim()
      .toLowerCase();

    /* NAME */

    if (!name) {
      nextErrors.name =
        "Vui lòng nhập họ và tên.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Họ tên chưa hợp lệ.";
    }

    /* PHONE */

    if (!phone) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại.";
    } else if (
      !isValidVietnamPhone(phone)
    ) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
    }

    /* EMAIL */

    if (!email) {
      nextErrors.email =
        "Vui lòng nhập email.";
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    setErrors(nextErrors);

    return {
      valid:
        Object.keys(nextErrors).length === 0,
      name,
      phone,
      email,
    };
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

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
      /* ===================================================
         1. LOAD MASTER VOUCHER
      =================================================== */

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
        .eq(
          "code",
          MASTER_VOUCHER_CODE,
        )
        .maybeSingle<MasterVoucher>();

      if (
        voucherError ||
        !masterVoucher
      ) {
        console.error(
          "LOAD MASTER VOUCHER ERROR:",
          voucherError,
        );

        setErrors({
          general:
            "Không thể tải chương trình ưu đãi. Vui lòng thử lại sau.",
        });

        return;
      }

      /* ===================================================
         2. CHECK MASTER VOUCHER
      =================================================== */

      const now = Date.now();

      /* INACTIVE */

      if (!masterVoucher.active) {
        setErrors({
          general:
            "Chương trình ưu đãi hiện không hoạt động.",
        });

        return;
      }

      /* NOT STARTED */

      if (
        masterVoucher.start_at &&
        new Date(
          masterVoucher.start_at,
        ).getTime() > now
      ) {
        setErrors({
          general:
            "Chương trình ưu đãi chưa bắt đầu.",
        });

        return;
      }

      /* EXPIRED */

      if (
        masterVoucher.end_at &&
        new Date(
          masterVoucher.end_at,
        ).getTime() < now
      ) {
        setErrors({
          general:
            "Chương trình ưu đãi đã kết thúc.",
        });

        return;
      }

      /* ===================================================
         3. VOUCHER CONFIG
      =================================================== */

      const voucherPercent =
        Number(
          masterVoucher.value ?? 0,
        );

      const voucherMinOrder =
        Number(
          masterVoucher.min_order ?? 0,
        );

      const voucherMaxDiscount =
        Number(
          masterVoucher.max_discount ??
            0,
        );

      if (voucherPercent <= 0) {
        setErrors({
          general:
            "Voucher chưa được cấu hình đúng mức giảm.",
        });

        return;
      }

      if (voucherMaxDiscount <= 0) {
        setErrors({
          general:
            "Voucher chưa được cấu hình mức giảm tối đa.",
        });

        return;
      }

      /* ===================================================
         4. CHECK PHONE IN CUSTOMER VOUCHERS
      =================================================== */

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
          "CHECK CUSTOMER VOUCHER ERROR:",
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

      /* ===================================================
         5. CHECK PHONE
      =================================================== */

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

      /* ===================================================
         6. CHECK EMAIL
      =================================================== */

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

      /* ===================================================
         7. CHECK QUANTITY
      =================================================== */

      const {
        count: issuedCount,
        error: issuedCountError,
      } = await supabase
        .from("customer_vouchers")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "master_voucher_code",
          MASTER_VOUCHER_CODE,
        );

      if (issuedCountError) {
        console.error(
          "CHECK VOUCHER QUANTITY ERROR:",
          issuedCountError,
        );

        setErrors({
          general:
            "Không thể kiểm tra số lượng voucher còn lại.",
        });

        return;
      }

      if (
        masterVoucher.quantity &&
        (issuedCount ?? 0) >=
          Number(
            masterVoucher.quantity,
          )
      ) {
        setErrors({
          general:
            "Voucher đăng ký đã được phát hết. Cảm ơn bạn đã quan tâm đến Olive Living.",
        });

        return;
      }

      /* ===================================================
         8. GENERATE PERSONAL CODE
      =================================================== */

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
          .eq(
            "voucher_code",
            candidate,
          )
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
          personalVoucherCode =
            candidate;

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

      /* ===================================================
         9. SAVE POTENTIAL CUSTOMER
      =================================================== */

      const {
        error: saveCustomerError,
      } = await supabase
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

      /* ===================================================
         10. CREATE PERSONAL VOUCHER
      =================================================== */

      const {
        error: customerVoucherError,
      } = await supabase
        .from("customer_vouchers")
        .insert({
          full_name: result.name,

          phone: result.phone,

          voucher_code:
            personalVoucherCode,

          /*
           * 5 = 5%
           *
           * Checkout sẽ xử lý:
           * 5% tối đa 35.000đ
           */
          discount: voucherPercent,

          /*
           * Voucher phần trăm:
           * 5 = giảm 5%
           */
          discount_type: "percent",

          /*
           * Giảm tối đa 35.000đ
           */
          max_discount: voucherMaxDiscount,

          /*
           * Gắn voucher cá nhân với voucher master
           */
          master_voucher_code:
            MASTER_VOUCHER_CODE,

          /*
           * Không minimum order
           */
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

      /* ===================================================
         11. PERSONAL EXPIRY
      =================================================== */

      const expiresAt =
        new Date(
          Date.now() +
            PERSONAL_VOUCHER_DAYS *
              24 *
              60 *
              60 *
              1000,
        ).toISOString();

      /* ===================================================
         12. SUCCESS NGAY LẬP TỨC
      ===================================================
      
      Không chờ email.

      Voucher đã được lưu thành công,
      nên khách có thể nhận mã ngay.
      */

      localStorage.setItem(
        POPUP_REGISTERED_KEY,
        "true",
      );

      localStorage.setItem(
        PERSONAL_VOUCHER_KEY,
        personalVoucherCode,
      );

      setVoucherCode(
        personalVoucherCode,
      );

      setSuccess(true);

      /* ===================================================
         13. SEND EMAIL BACKGROUND
      ===================================================
      
      Vẫn gửi email.

      Nhưng email không block UI.

      Nếu email:
      - nhanh → gửi bình thường
      - chậm → tối đa 8 giây
      - lỗi → chỉ log lỗi
      */

      void sendVoucherEmailWithTimeout({
        name: result.name,
        email: result.email,
        voucherCode:
          personalVoucherCode,
        expiresAt,
      })
        .then((emailResult) => {
          if (emailResult?.error) {
            console.error(
              "SEND VOUCHER EMAIL ERROR:",
              emailResult.error,
            );

            return;
          }

          console.log(
            "VOUCHER EMAIL SENT:",
            result.email,
          );
        })
        .catch((emailError) => {
          console.error(
            "SEND VOUCHER EMAIL EXCEPTION:",
            emailError,
          );
        });
    } catch (error) {
      console.error(
        "VOUCHER REGISTRATION ERROR:",
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

  /* =======================================================
     CLOSE
  ======================================================= */

  function handleClose() {
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[9998]
          bg-black/50
          backdrop-blur-[3px]
        "
      />

      {/* =====================================================
          POPUP
      ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          p-3
          sm:p-4
        "
      >
        <div
          className="
            relative
            w-[calc(100vw-24px)]
            max-w-[380px]
            sm:w-full
            sm:max-w-[900px]
          "
        >

          {/* =================================================
              CLOSE BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={handleClose}
            className="
              absolute
              right-[-8px]
              top-[-8px]
              z-30
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-gray-700
              shadow-lg
              transition
              hover:bg-gray-100
            "
            aria-label="Đóng"
          >
            <X
              size={20}
              strokeWidth={1.8}
            />
          </button>

          {/* =================================================
              VOUCHER CONTAINER
          ================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[20px]
              bg-white
              shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            "
          >

            {/* =================================================
                BF08 IMAGE
            ================================================== */}

            <img
              src="/images/BF08.png"
              alt="Olive Living New Member Voucher"
              className="
                block
                h-auto
                w-full
              "
            />

            {!success ? (

              /* =================================================
                 FORM
              ================================================== */

              <div
  className="
    absolute
    left-[55%]
    top-[49%]
    h-[45%]
    w-[41%]
    sm:top-[55%]
    sm:h-[40%]
  "
>

                <form
                  onSubmit={handleSubmit}
                  className="
                    flex
                    h-full
                    w-full
                    flex-col
                    justify-center
                    gap-[3%]
                  "
                >

                  {/* NAME */}

                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Họ và tên"
                    autoComplete="name"
                    disabled={submitting}
                    className={`
                      h-[20%]
                      w-full
                      rounded-[7px]
                      border
                      bg-white/95
                      px-[5%]
                      text-[clamp(9px,1.2vw,15px)]
                      text-[#333]
                      outline-none
                      placeholder:text-[#999]
                      transition
                      focus:bg-white
                      ${
                        errors.name
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#D9D3CB] focus:border-[#C77B55]"
                      }
                    `}
                  />

                  {/* PHONE */}

                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="Số điện thoại"
                    autoComplete="tel"
                    inputMode="numeric"
                    disabled={submitting}
                    className={`
                      h-[20%]
                      w-full
                      rounded-[7px]
                      border
                      bg-white/95
                      px-[5%]
                      text-[clamp(9px,1.2vw,15px)]
                      text-[#333]
                      outline-none
                      placeholder:text-[#999]
                      transition
                      focus:bg-white
                      ${
                        errors.phone
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#D9D3CB] focus:border-[#C77B55]"
                      }
                    `}
                  />

                  {/* EMAIL */}

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="Email"
                    autoComplete="email"
                    disabled={submitting}
                    className={`
                      h-[20%]
                      w-full
                      rounded-[7px]
                      border
                      bg-white/95
                      px-[5%]
                      text-[clamp(9px,1.2vw,15px)]
                      text-[#333]
                      outline-none
                      placeholder:text-[#999]
                      transition
                      focus:bg-white
                      ${
                        errors.email
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#D9D3CB] focus:border-[#C77B55]"
                      }
                    `}
                  />

                  {/* GENERAL ERROR */}

                  {errors.general && (
                    <div
                      className="
                        absolute
                        -bottom-[22%]
                        left-0
                        w-full
                        rounded-md
                        bg-white/95
                        px-2
                        py-1
                        text-center
                        text-[clamp(7px,0.8vw,11px)]
                        leading-tight
                        text-red-500
                        shadow-sm
                      "
                    >
                      {errors.general}
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      h-[20%]
                      w-full
                      rounded-[7px]
                      bg-[#C77B55]
                      text-[clamp(8px,1vw,14px)]
                      font-medium
                      tracking-wide
                      text-white
                      transition
                      hover:bg-[#B56B48]
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {submitting ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                        "
                      >
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />

                        ĐANG XỬ LÝ...
                      </span>
                    ) : (
                      "NHẬN ƯU ĐÃI"
                    )}
                  </button>

                </form>
              </div>

            ) : (

              /* =================================================
                 SUCCESS
              ================================================== */

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-white/95
                  px-6
                  text-center
                "
              >

                <div
                  className="
                    flex
                    max-w-[420px]
                    flex-col
                    items-center
                  "
                >

                  {/* SUCCESS ICON */}

                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F1F6EE]
                    "
                  >
                    <CheckCircle2
                      size={36}
                      strokeWidth={1.7}
                      className="text-[#4D5745]"
                    />
                  </div>

                  {/* TITLE */}

                  <h2
                    className="
                      mt-4
                      font-serif
                      text-[clamp(22px,3vw,32px)]
                      text-[#333]
                    "
                  >
                    Đăng ký thành công!
                  </h2>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-2
                      text-[clamp(11px,1.2vw,14px)]
                      leading-6
                      text-gray-500
                    "
                  >
                    Voucher của bạn đã được tạo
                    thành công.
                  </p>

                  {/* OFFER */}

                  <div
                    className="
                      mt-4
                      rounded-2xl
                      bg-[#FAF8F5]
                      px-8
                      py-4
                    "
                  >
                    <p
                      className="
                        text-[11px]
                        font-medium
                        uppercase
                        tracking-[0.2em]
                        text-gray-500
                      "
                    >
                      NEW MEMBER OFFER
                    </p>

                    <p
                      className="
                        mt-1
                        text-[clamp(24px,3vw,36px)]
                        font-semibold
                        text-[#C77B55]
                      "
                    >
                      5% OFF
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-500
                      "
                    >
                      Tối đa 35.000đ
                      <br />
                      Không yêu cầu giá trị đơn tối thiểu
                    </p>
                  </div>

                  {/* VOUCHER CODE */}

                  <div
                    className="
                      mt-4
                      w-full
                      rounded-xl
                      border
                      border-dashed
                      border-[#C77B55]/50
                      bg-white
                      px-5
                      py-3
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.2em]
                        text-gray-400
                      "
                    >
                      MÃ VOUCHER CỦA BẠN
                    </p>

                    <p
                      className="
                        mt-1
                        font-mono
                        text-[clamp(18px,2.2vw,26px)]
                        font-bold
                        tracking-widest
                        text-[#4D5745]
                      "
                    >
                      {voucherCode}
                    </p>
                  </div>

                  {/* EMAIL */}

                  <p
                    className="
                      mt-3
                      text-[11px]
                      leading-5
                      text-gray-400
                    "
                  >
                    Mã voucher đã được gửi đến
                    email của bạn.
                    <br />
                    Voucher có hiệu lực 7 ngày kể
                    từ lúc đăng ký.
                  </p>

                  {/* CONTINUE */}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      mt-5
                      rounded-full
                      bg-[#4D5745]
                      px-7
                      py-2.5
                      text-[10px]
                      font-semibold
                      tracking-wide
                      text-white
                      transition
                      hover:bg-[#3F4939]
                    "
                  >
                    TIẾP TỤC MUA SẮM
                  </button>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}