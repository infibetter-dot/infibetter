
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "olive_blackfriday_popup_v1";
const REGISTERED_KEY = "olive_popup_registered_v1";

type FormData = {
  name: string;
  phone: string;
  email: string;
};

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

export default function FlashSalePopup() {
  const [show, setShow] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /*
     * Nếu khách đã đăng ký rồi thì không hiện
     * popup đăng ký nữa trên thiết bị này.
     */
    const alreadyRegistered =
      localStorage.getItem(REGISTERED_KEY);

    if (alreadyRegistered === "true") {
      return;
    }

    /*
     * Giữ nguyên logic popup cũ:
     * Nếu khách vừa đóng popup trong vòng 24 giờ
     * thì không hiện lại.
     */
    const lastClosed =
      localStorage.getItem(STORAGE_KEY);

    if (lastClosed) {
      const diff =
        Date.now() - Number(lastClosed);

      if (
        diff <
        24 * 60 * 60 * 1000
      ) {
        return;
      }
    }

    /*
     * Hiện popup sau 4 giây.
     */
    const timer = window.setTimeout(() => {
      setShow(true);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function closePopup() {
    localStorage.setItem(
      STORAGE_KEY,
      Date.now().toString(),
    );

    setShow(false);
  }

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
    }));
  }

  /*
   * Chuẩn hóa số điện thoại Việt Nam.
   *
   * 0901234567
   * 84901234567
   * +84901234567
   *
   * đều được đưa về:
   *
   * 0901234567
   */
  function normalizePhone(
    phone: string,
  ) {
    let value = phone
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\./g, "");

    if (value.startsWith("+84")) {
      value = "0" + value.slice(3);
    } else if (
      value.startsWith("84")
    ) {
      value = "0" + value.slice(2);
    }

    return value;
  }

  /*
   * Kiểm tra số điện thoại Việt Nam.
   *
   * Các đầu số hợp lệ:
   * 03
   * 05
   * 07
   * 08
   * 09
   *
   * Tổng cộng 10 số.
   */
  function isValidVietnamPhone(
    phone: string,
  ) {
    const normalized =
      normalizePhone(phone);

    return /^(03|05|07|08|09)[0-9]{8}$/.test(
      normalized,
    );
  }

  function isValidEmail(
    email: string,
  ) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      email.trim(),
    );
  }

  function validate() {
    const nextErrors: FormErrors = {};

    const name =
      form.name.trim();

    const phone =
      normalizePhone(form.phone);

    const email =
      form.email.trim();

    /*
     * NAME
     */
    if (!name) {
      nextErrors.name =
        "Vui lòng nhập họ và tên.";
    } else if (
      name.length < 2
    ) {
      nextErrors.name =
        "Họ tên chưa hợp lệ.";
    }

    /*
     * PHONE
     */
    if (!phone) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại.";
    } else if (
      !isValidVietnamPhone(phone)
    ) {
      nextErrors.phone =
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
    }

    /*
     * EMAIL
     */
    if (!email) {
      nextErrors.email =
        "Vui lòng nhập email.";
    } else if (
      !isValidEmail(email)
    ) {
      nextErrors.email =
        "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    setErrors(nextErrors);

    return {
      valid:
        Object.keys(nextErrors)
          .length === 0,
      name,
      phone,
      email:
        email.toLowerCase(),
    };
  }

  
    async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (submitting) {
    return;
  }

  const result = validate();

  if (!result.valid) {
    return;
  }

  setSubmitting(true);

  try {
    /*
     * ============================================
     * 1. LẤY CẤU HÌNH VOUCHER MẪU
     * ============================================
     *
     * Voucher mẫu:
     * OLV-T2V4NF
     */
    const { data: masterVoucher, error: voucherError } =
      await supabase
        .from("vouchers")
        .select(
          "id, code, value, min_order, max_discount, quantity, used, active, start_at, end_at, manual_apply, auto_apply, usage_per_customer, is_personal"
        )
        .eq("code", "OLV-T2V4NF")
        .maybeSingle();

    if (voucherError) {
      console.error(
        "LOAD MASTER VOUCHER ERROR:",
        voucherError,
      );

      setSubmitting(false);
      return;
    }

    if (!masterVoucher) {
      console.error(
        "MASTER VOUCHER NOT FOUND: OLV-T2V4NF",
      );

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 2. KIỂM TRA VOUCHER CÒN HOẠT ĐỘNG
     * ============================================
     */
    if (!masterVoucher.active) {
      console.error(
        "MASTER VOUCHER IS NOT ACTIVE",
      );

      setSubmitting(false);
      return;
    }

    const now = Date.now();

    if (
      masterVoucher.start_at &&
      new Date(masterVoucher.start_at).getTime() > now
    ) {
      console.error(
        "MASTER VOUCHER HAS NOT STARTED",
      );

      setSubmitting(false);
      return;
    }

    if (
      masterVoucher.end_at &&
      new Date(masterVoucher.end_at).getTime() < now
    ) {
      console.error(
        "MASTER VOUCHER HAS EXPIRED",
      );

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 3. KIỂM TRA KHÁCH ĐÃ CÓ VOUCHER CHƯA
     * ============================================
     *
     * Không tạo voucher thứ 2 cho cùng SĐT.
     */
    const {
      data: existingCustomerVoucher,
      error: existingVoucherError,
    } = await supabase
      .from("customer_vouchers")
      .select(
        "id, full_name, phone, voucher_code, discount, min_order, is_used"
      )
      .eq("phone", result.phone)
      .limit(1)
      .maybeSingle();

    if (existingVoucherError) {
      console.error(
        "CHECK EXISTING CUSTOMER VOUCHER ERROR:",
        existingVoucherError,
      );

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 4. KIỂM TRA KHÁCH TIỀM NĂNG ĐÃ CÓ CHƯA
     * ============================================
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

    /*
     * Nếu khách đã có voucher:
     * không tạo voucher mới.
     */
    if (existingCustomerVoucher) {
      localStorage.setItem(
        REGISTERED_KEY,
        "true",
      );

      setSuccess(true);
      setSubmitting(false);

      return;
    }

    /*
     * ============================================
     * 5. KIỂM TRA SỐ LƯỢNG VOUCHER ĐÃ CẤP
     * ============================================
     *
     * Voucher mẫu hiện tại quantity = 18.
     *
     * Vì mỗi khách nhận 1 voucher riêng,
     * quantity được dùng làm giới hạn số voucher
     * cá nhân được phát ra.
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

      setSubmitting(false);
      return;
    }

    if (
      masterVoucher.quantity &&
      (issuedCount ?? 0) >=
        Number(masterVoucher.quantity)
    ) {
      console.error(
        "PERSONAL VOUCHER LIMIT REACHED",
      );

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 6. TẠO MÃ VOUCHER RIÊNG
     * ============================================
     *
     * Ví dụ:
     * OLV-A7K2NF
     * OLV-T8M4QP
     */
    function generateVoucherCode() {
      const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

      let randomPart = "";

      for (let i = 0; i < 6; i++) {
        randomPart +=
          characters.charAt(
            Math.floor(
              Math.random() * characters.length,
            ),
          );
      }

      return `OLV-${randomPart}`;
    }

    let personalVoucherCode = "";
    let codeExists = true;

    /*
     * Tối đa 10 lần thử để tránh trùng mã.
     */
    for (let attempt = 0; attempt < 10; attempt++) {
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

        setSubmitting(false);
        return;
      }

      if (!existingCode) {
        personalVoucherCode = candidate;
        codeExists = false;
        break;
      }
    }

    if (codeExists || !personalVoucherCode) {
      console.error(
        "COULD NOT GENERATE UNIQUE VOUCHER CODE",
      );

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 7. LƯU KHÁCH TIỀM NĂNG
     * ============================================
     *
     * Nếu chưa có thì insert.
     */
    if (!existingPhone && !existingEmail) {
      const {
        error: saveCustomerError,
      } = await supabase
        .from("potential_customers")
        .insert({
          name: result.name,
          phone: result.phone,
          email: result.email,
          source: "homepage_popup",
        });

      if (saveCustomerError) {
        console.error(
          "SAVE POTENTIAL CUSTOMER ERROR:",
          saveCustomerError,
        );

        setSubmitting(false);
        return;
      }
    }

    /*
     * ============================================
     * 8. CẤP VOUCHER CÁ NHÂN
     * ============================================
     *
     * Voucher gốc:
     * 35%
     * Min order: 1.449.000
     * Max discount: 39.000
     *
     * customer_vouchers hiện tại dùng discount
     * dạng tiền cố định nên lưu 39.000.
     */
    const {
      error: customerVoucherError,
    } = await supabase
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

      setSubmitting(false);
      return;
    }

    /*
     * ============================================
     * 9. GỬI EMAIL VOUCHER
     * ============================================
     *
     * Gửi qua Supabase Edge Function.
     * Gmail App Password chỉ nằm ở server,
     * tuyệt đối không đưa vào frontend.
     *
     * Email lỗi KHÔNG làm mất voucher đã cấp.
     */
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    try {
      const { data: emailResult, error: emailError } =
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
      } else {
        console.log(
          "SEND VOUCHER EMAIL RESULT:",
          emailResult,
        );
      }
    } catch (emailError) {
      console.error(
        "SEND VOUCHER EMAIL EXCEPTION:",
        emailError,
      );
    }

    /*
     * ============================================
     * 10. ĐĂNG KÝ THÀNH CÔNG
     * ============================================
     */
    localStorage.setItem(
      REGISTERED_KEY,
      "true",
    );

    /*
     * Lưu tạm mã voucher ở browser để sau này
     * có thể dùng cho màn hình/email/confirmation.
     */
    localStorage.setItem(
      "olive_personal_voucher_code",
      personalVoucherCode,
    );

    setSuccess(true);
  } catch (error) {
    console.error(
      "POTENTIAL CUSTOMER / VOUCHER ERROR:",
      error,
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="
  fixed
  inset-0
  z-[9999]
  flex
  items-center
  justify-center
  bg-black/45
  px-3
  py-5
  backdrop-blur-[3px]
"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          onClick={closePopup}
        >
          <motion.div
  className="
    relative
max-h-[84vh]
w-[86vw]
max-w-[370px]
    overflow-y-auto
    overflow-x-hidden
    rounded-[20px]
    bg-white
    shadow-[0_25px_80px_rgba(0,0,0,0.3)]
    sm:w-[min(82vw,400px)]
  "
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 10,
            }}
            transition={{
              duration: 0.45,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={closePopup}
              aria-label="Đóng"
              className="
                absolute
                right-2.5
                top-2.5
                z-50
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-black/30
                text-white
                backdrop-blur-md
                transition-all
                hover:scale-105
                hover:bg-black/50
              "
            >
              <X
                size={18}
                strokeWidth={2.5}
              />
            </button>

            {/* =========================
                BLACK FRIDAY IMAGE
            ========================== */}

         <div className="overflow-hidden">
  <Link
    to="/flashsale"
    className="block"
  >
    <img
      src="/images/BF08.png"
      alt="Black Friday - Olive Living"
      className="
        block
        h-auto
        w-[105%]
        max-w-none
        -ml-[2.5%]
        cursor-pointer
      "
    />
  </Link>
</div>
            {/* =========================
                REGISTER FORM
            ========================== */}

            <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
              {!success ? (
                <>
                  <div className="mb-5 text-center">
                    <p
                      className="
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.28em]
                        text-emerald-700
                      "
                    >
                      OLIVE LIVING
                    </p>

                    <h2
                      className="
                        mt-2
                        font-serif
                        text-[22px]
                        leading-tight
                        text-gray-900
                      "
                    >
                      Nhận ưu đãi đặc biệt
                    </h2>

                    <p
                      className="
                        mx-auto
                        mt-2
                        max-w-[330px]
                        text-[12px]
                        leading-5
                        text-gray-500
                      "
                    >
                      Đăng ký để nhận voucher
                      và những ưu đãi đặc biệt
                      từ Olive Living.
                    </p>
                  </div>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="space-y-3"
                  >
                    {/* NAME */}

                    <div>
                      <label
                        className="
                          mb-1.5
                          block
                          text-[11px]
                          font-medium
                          text-gray-700
                        "
                      >
                        Họ và tên
                      </label>

                      <input
                        type="text"
                        value={
                          form.name
                        }
                        onChange={(e) =>
                          updateField(
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        disabled={
                          submitting
                        }
                        className={`
                          w-full
                          rounded-xl
                          border
                          bg-gray-50
                          px-4
                          py-3
                          text-sm
                          text-gray-900
                          outline-none
                          transition
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

                    {/* PHONE */}

                    <div>
                      <label
                        className="
                          mb-1.5
                          block
                          text-[11px]
                          font-medium
                          text-gray-700
                        "
                      >
                        Số điện thoại
                      </label>

                      <input
                        type="tel"
                        value={
                          form.phone
                        }
                        onChange={(e) =>
                          updateField(
                            "phone",
                            e.target.value,
                          )
                        }
                        placeholder="09xxxxxxxx"
                        autoComplete="tel"
                        inputMode="numeric"
                        disabled={
                          submitting
                        }
                        className={`
                          w-full
                          rounded-xl
                          border
                          bg-gray-50
                          px-4
                          py-3
                          text-sm
                          text-gray-900
                          outline-none
                          transition
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

                    {/* EMAIL*/}
                   
                    <div>
                      <label
                        className="
                          mb-1.5
                          block
                          text-[11px]
                          font-medium
                          text-gray-700
                        "
                      >
                        Email
                      </label>

                      <input
                        type="email"
                        value={
                          form.email
                        }
                        onChange={(e) =>
                          updateField(
                            "email",
                            e.target.value,
                          )
                        }
                        placeholder="example@email.com"
                        autoComplete="email"
                        disabled={
                          submitting
                        }
                        className={`
                          w-full
                          rounded-xl
                          border
                          bg-gray-50
                          px-4
                          py-3
                          text-sm
                          text-gray-900
                          outline-none
                          transition
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

                    {/* SUBMIT */}
                  
                  <div className="mt-2 flex items-center gap-2">
  <button
    type="submit"
    disabled={submitting}
    className="
      flex
      min-w-0
      flex-1
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-gray-900
      px-4
      py-3
      text-[10px]
      font-semibold
      tracking-wide
      text-white
      transition-all
      hover:bg-gray-800
      active:scale-[0.99]
      disabled:cursor-not-allowed
      disabled:opacity-60
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
      "ĐĂNG KÝ NHẬN ƯU ĐÃI"
    )}
  </button>

  <button
    type="button"
    onClick={closePopup}
    aria-label="Đóng"
    className="
      flex
      h-10
      w-10
      shrink-0
      items-center
      justify-center
      rounded-xl
      border
      border-gray-200
      bg-gray-100
      text-gray-500
      transition
      hover:bg-gray-200
      active:scale-95
    "
  >
    <X
      size={16}
      strokeWidth={2.5}
    />
  </button>
</div>
                   
                  </form>
                </>
              ) : (
                /* =========================
                   SUCCESS
                ========================== */

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    py-5
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-50
                    "
                  >
                    <CheckCircle2
                      size={30}
                      strokeWidth={1.8}
                      className="text-emerald-600"
                    />
                  </div>

                  <h2
                    className="
                      mt-4
                      font-serif
                      text-[25px]
                      text-gray-900
                    "
                  >
                    Đăng ký thành công!
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-[320px]
                      text-[12px]
                      leading-5
                      text-gray-500
                    "
                  >
                    Cảm ơn bạn đã đăng ký.
                    Olive Living sẽ gửi những
                    ưu đãi đặc biệt đến bạn.
                  </p>

                  <button
                    type="button"
                    onClick={
                      closePopup
                    }
                    className="
                      mt-5
                      rounded-full
                      bg-gray-900
                      px-6
                      py-3
                      text-[10px]
                      font-semibold
                      tracking-wide
                      text-white
                      transition
                      hover:bg-gray-800
                    "
                  >
                    TIẾP TỤC MUA SẮM
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}