import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Gift,
  Check,
  X,
} from "lucide-react";

export default function FloatingShipping() {
  const [open, setOpen] = useState(false);

  const [saved, setSaved] = useState(false);

  const [selected, setSelected] = useState({
    shipping: true,
    voucher: true,
    welcome: true,
  });

  useEffect(() => {
    const savedOffer = localStorage.getItem(
      "olive_offer_saved"
    );

    if (savedOffer === "true") {
      setSaved(true);
    }
  }, []);

  function saveOffer() {
    localStorage.setItem(
      "olive_offer_saved",
      "true"
    );

    setSaved(true);
  }

  return (
    <>
      {/* BUTTON */}

      <div
  className={`
    fixed
    right-4

    bottom-[70px]
    lg:bottom-6

    z-[9998]

    transition-all
    duration-300
  `}
>

        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{
            scale: 1.08,
            rotate: 4,
          }}
          whileTap={{
            scale: .94,
          }}
          animate={{
            scale: [1, 1.04, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
          }}
          className="
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          overflow-hidden
          rounded-full

          border
          border-[#e9e4dc]

         bg-white

          shadow-lg
        "
        >

          <motion.span
            className="
            absolute
            inset-0
            rounded-full
            bg-[#E8C9A6]
          "
            animate={{
              scale: [1, 1.8],
              opacity: [.3, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
            }}
          />

          <Truck
            size={20}
            className="relative text-[#C77B55]"
          />

        </motion.button>

      </div>

            <AnimatePresence>

        {open && (

          <>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998] bg-black"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: .92,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: .95,
              }}
              transition={{
                duration: .28,
              }}
              className="
fixed

left-3
right-3
bottom-2
top-10

sm:top-auto
sm:left-auto
sm:right-6
sm:bottom-24
sm:w-[380px]

z-[9999]
max-h-[82vh]
overflow-y-auto

rounded-2xl

bg-white

border

shadow-2xl
"
            >
            

              <button
                onClick={() => setOpen(false)}
                className="
                  absolute
                  right-4
bottom-[180px]

                  flex
                  h-9
                  w-9
                  items-center
                  justify-center

                  rounded-full

                  bg-neutral-100

                  transition

                  hover:bg-neutral-200
                "
              >

                <X size={18} />

              </button>

                          <div className="bg-gradient-to-r from-[#F8EFE6] to-[#FFF8F1] px-4 py-3 sm:px-7 sm:py-6">

                <div className="flex items-center gap-4">

                  <div className="
                    flex
                    h-12
                    w-12
                    sm:h-10
                    sm:w-10
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#C77B55]
                    text-white
                  ">

                    <Gift
  size={20}
  className="sm:h-6 sm:w-6"
/>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-[.3em] text-[#C77B55]">

                      OLIVE LIVING

                    </p>

                    <h3 className="mt-1 text-lg
sm:text-lg
sm:text-lg sm:text-xl font-bold">

                      Ưu đãi dành riêng cho bạn

                    </h3>

                  </div>

                </div>

                <p className="mt-2 text-xs sm:text-sm leading-5">

                  Chọn những ưu đãi bạn muốn nhận.
                  Hệ thống sẽ tự động áp dụng ưu đãi tốt nhất
                  khi thanh toán.

                </p>

              </div>

                            <div className="space-y-4 p-6">

                                {!saved ? (
                                    <>

                {/* Shipping */}

                <div className="rounded-xl
border
p-3
sm:rounded-2xl
sm:p-4">

                  <div className="flex items-start gap-3">

                    <input
                      type="checkbox"
                      checked={selected.shipping}
                      onChange={() =>
                        setSelected({
                          ...selected,
                          shipping: !selected.shipping,
                        })
                      }
                      className="mt-1 h-5 w-5"
                    />

                    <div>

                      <div className="font-semibold">

                        🚚 Freeship toàn quốc

                      </div>

                      <div className="mt-1 text-sm text-neutral-500">

                        Đơn từ 399.000đ

                      </div>

                    </div>

                  </div>

                </div>

                {/* Voucher */}

                <div className="rounded-xl
border
p-3
sm:rounded-2xl
sm:p-4">

                  <div className="flex items-start gap-3">

                    <input
                      type="checkbox"
                      checked={selected.voucher}
                      onChange={() =>
                        setSelected({
                          ...selected,
                          voucher: !selected.voucher,
                        })
                      }
                      className="mt-1 h-5 w-5"
                    />

                    <div>

                      <div className="font-semibold">

                        🎁 Voucher giảm 5%

                      </div>

                      <div className="mt-1 text-sm text-neutral-500">

                        Đơn từ 699.000đ

                      </div>

                    </div>

                  </div>

                </div>

                {/* Welcome */}

                <div className="rounded-xl
border
p-3
sm:rounded-2xl
sm:p-4">

                  <div className="flex items-start gap-3">

                    <input
                      type="checkbox"
                      checked={selected.welcome}
                      onChange={() =>
                        setSelected({
                          ...selected,
                          welcome: !selected.welcome,
                        })
                      }
                      className="mt-1 h-4
w-4
sm:h-5
sm:w-5"
                    />

                    <div>

                      <div className="font-semibold">

                        💎 Welcome Voucher

                      </div>

                      <div className="mt-1 text-sm text-neutral-500">

                        Giảm 25.000đ

                      </div>

                    </div>

                  </div>

                </div>

                              <div className="rounded-2xl bg-[#F8F8F8] p-4">

                <div className="flex items-center gap-2 text-sm">

                  <Check
                    size={16}
                    className="text-[#6F8B5E]"
                  />

                  Không cần nhập mã

                </div>

                <div className="mt-2 flex items-center gap-2 text-sm">

                  <Check
                    size={16}
                    className="text-[#6F8B5E]"
                  />

                  Tự động áp dụng ưu đãi tốt nhất

                </div>

                <div className="mt-2 flex items-center gap-2 text-sm">

                  <Check
                    size={16}
                    className="text-[#6F8B5E]"
                  />

                  Có thể kết hợp Freeship

                </div>

              </div>

              <div className="mt-5 rounded-xl bg-[#FFF6EB] p-4 text-center">

                <div className="text-sm">

                  🔥 Hơn

                  <span className="font-bold">
                    {" "}328{" "}
                  </span>

                  khách đã nhận ưu đãi hôm nay

                </div>

              </div>

              <button
                onClick={saveOffer}
                className="
                  mt-4
                  w-full
                  rounded-2xl

                  bg-[#A8BE8D]

                  py-3
sm:py-3

                  text-base

                  font-semibold

                  text-white

                  transition

                  hover:bg-[#97B17A]
                "
              >

                🎁 Nhận ưu đãi ngay

              </button>

              </>

                          ) : (

              <div className="px-5 py-4 text-center">

                <div
                  className="
                    mx-auto

                    flex

                    h-10
w-10
sm:h-20
sm:w-20

                    items-center
                    justify-center

                    rounded-full

                    bg-[#EEF7EA]
                  "
                >

                  <Check
                    size={22}
                    className="text-[#6F8B5E]"
                  />

                </div>

                <h2 className="mt-3 text-lg sm:text-2xl font-bold">

                  Ưu đãi đã được lưu

                </h2>

                <p className="mt-1 text-[13px] leading-5">

                  Hệ thống sẽ tự động áp dụng
                  ưu đãi tốt nhất khi bạn thanh toán.

                </p>

                <div className="mt-4 rounded-xl bg-[#F8F8F8] p-3 text-left">

                  {selected.shipping && (

                    <div className="mb-1 text-sm">

                      ✅ Freeship toàn quốc

                    </div>

                  )}

                  {selected.voucher && (

                    <div className="mb-1 text-sm">

                      ✅ Voucher giảm 5%

                    </div>

                  )}

                  {selected.welcome && (

                    <div>

                      ✅ Welcome Voucher

                    </div>

                  )}

                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="
                    mt-5

                    w-full

                    rounded-2xl

                    bg-[#A8BE8D]

                    py-2.5

                    text-sm

                    font-semibold

                    text-white
                  "
                >

                  Tiếp tục mua sắm

                </button>

              </div>

            )}

            </div>
                        </motion.div>

          </>

        )}

      </AnimatePresence>

    </>

  );

}