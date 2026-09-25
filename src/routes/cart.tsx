import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatUSDFromVND } from "@/lib/format";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import NextVoucherSuggestion from "@/components/cart/NextVoucherSuggestion";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Giỏ hàng — OLIVE LIVING" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, remove, subtotal, count } = useCart();

  const shipping = subtotal === 0 ? 0 : 25_000;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F8F7F3]">
        <div className="container-x flex min-h-[70vh] items-center justify-center py-24">
          <div className="w-full max-w-md text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D9DED2] bg-[#EEF1E9]">
              <ShoppingBag className="h-6 w-6 text-[#657653]" strokeWidth={1.5} />
            </div>

            <p className="mt-7 font-display text-4xl tracking-tight text-[#252820]">
              Giỏ hàng trống
            </p>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#73776D]">
              Hãy khám phá những món đồ được tuyển chọn cho một không gian
              sống tinh tế và hiện đại.
            </p>

            <Link
              to="/shop"
              className="
                mt-8
                inline-flex
                h-12
                items-center
                justify-center
                gap-3
                bg-[#667653]
                px-8
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white
                transition-all
                duration-200
                hover:bg-[#566544]
              "
            >
              Khám phá cửa hàng
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <div className="container-x py-10 sm:py-14 lg:py-16">

        {/* ================= HEADER ================= */}

        <div className="mb-10 border-b border-[#DCDDD7] pb-7 sm:mb-12">

          <div className="flex items-end justify-between gap-6">

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7A806F]">
                Shopping bag
              </p>

              <h1 className="font-display text-[38px] leading-none tracking-tight text-[#252820] sm:text-[46px]">
                Giỏ hàng
              </h1>
            </div>

            <p className="pb-1 text-xs text-[#777B72]">
              {count} {count === 1 ? "sản phẩm" : "sản phẩm"}
            </p>

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-16">

          {/* ================= PRODUCTS ================= */}

          <div>

            <div className="border-t border-[#DCDDD7]">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="
                    group
                    border-b
                    border-[#DCDDD7]
                    py-6
                    sm:py-7
                  "
                >

                  <div className="flex gap-5 sm:gap-7">

                    {/* PRODUCT IMAGE */}

                    <Link
                      to="/products/$slug"
                      params={{ slug: item.slug }}
                      className="
                        block
                        h-[112px]
                        w-[112px]
                        shrink-0
                        overflow-hidden
                        bg-[#EEECE5]
                        sm:h-[145px]
                        sm:w-[145px]
                      "
                    >

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.025]
                          "
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9A9D94]">
                          <ShoppingBag className="h-6 w-6" strokeWidth={1.3} />
                        </div>
                      )}

                    </Link>

                    {/* PRODUCT INFO */}

                    <div className="flex min-w-0 flex-1 flex-col">

                      <div className="flex items-start justify-between gap-4">

                        <Link
                          to="/products/$slug"
                          params={{ slug: item.slug }}
                          className="
                            max-w-[520px]
                            text-[14px]
                            font-medium
                            leading-6
                            text-[#292C25]
                            transition-colors
                            hover:text-[#667653]
                            sm:text-[15px]
                          "
                        >
                          {item.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Xóa ${item.name}`}
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            text-[#92958D]
                            transition-colors
                            hover:text-[#5D6555]
                          "
                        >
                          <X
                            className="h-[17px] w-[17px]"
                            strokeWidth={1.4}
                          />
                        </button>

                      </div>

                      {/* COLOR */}

                      {item.colorName && (
                        <div className="mt-2.5 flex items-center gap-2">

                          <span
                            className="
                              h-3.5
                              w-3.5
                              rounded-full
                              border
                              border-[#C9CBC4]
                            "
                            style={{
                              backgroundColor:
                                item.colorHex || "#ddd",
                            }}
                          />

                          <span className="text-[12px] text-[#777B72]">
                            {item.colorName}
                          </span>

                        </div>
                      )}

                      {/* PRICE */}

                      <p className="mt-2 text-[13px] text-[#6F736A]">
                        {formatUSDFromVND(item.price)}
                      </p>

                      {/* BOTTOM */}

                      <div className="mt-auto flex items-end justify-between gap-4 pt-5">

                        {/* QUANTITY */}

                        <div
                          className="
                            inline-flex
                            h-9
                            items-center
                            border
                            border-[#D5D7D0]
                            bg-transparent
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            aria-label="Giảm số lượng"
                            className="
                              flex
                              h-full
                              w-9
                              items-center
                              justify-center
                              text-[#656A60]
                              transition-colors
                              hover:bg-[#ECEFE7]
                              hover:text-[#4F5E45]
                            "
                          >
                            <Minus
                              className="h-3 w-3"
                              strokeWidth={1.5}
                            />
                          </button>

                          <span
                            className="
                              flex
                              h-full
                              w-9
                              items-center
                              justify-center
                              border-x
                              border-[#D5D7D0]
                              text-[12px]
                              font-medium
                              text-[#30332D]
                            "
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            aria-label="Tăng số lượng"
                            className="
                              flex
                              h-full
                              w-9
                              items-center
                              justify-center
                              text-[#656A60]
                              transition-colors
                              hover:bg-[#ECEFE7]
                              hover:text-[#4F5E45]
                            "
                          >
                            <Plus
                              className="h-3 w-3"
                              strokeWidth={1.5}
                            />
                          </button>

                        </div>

                        {/* ITEM TOTAL */}

                        <span className="text-[14px] font-medium tracking-tight text-[#282B25]">
                          {formatUSDFromVND(
                            item.price * item.quantity
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* ================= VOUCHERS ================= */}

            <div className="mt-8">

              <NextVoucherSuggestion
                subtotal={subtotal}
              />

            </div>

            {/* CONTINUE SHOPPING */}

            <Link
              to="/shop"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#69765C]
                transition-colors
                hover:text-[#4F5D45]
              "
            >
              <span>←</span>
              Tiếp tục mua sắm
            </Link>

          </div>

          {/* ================= ORDER SUMMARY ================= */}

          <aside className="h-fit lg:sticky lg:top-8">

            <div className="border border-[#D8DAD3] bg-[#F1F0EA] p-6 sm:p-7">

              {/* TITLE */}

              <div className="border-b border-[#D7D9D1] pb-5">

                <p className="font-display text-[25px] tracking-tight text-[#292C25]">
                  Tóm tắt đơn hàng
                </p>

                <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-[#83877E]">
                  Order summary
                </p>

              </div>

              {/* PRICE DETAILS */}

              <dl className="space-y-4 py-6 text-[13px]">

                <div className="flex items-center justify-between">
                  <dt className="text-[#777B72]">
                    Tạm tính
                  </dt>

                  <dd className="font-medium text-[#34372F]">
                    {formatUSDFromVND(subtotal)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[#777B72]">
                    Phí vận chuyển
                  </dt>

                  <dd className="font-medium text-[#34372F]">
                    {shipping === 0
                      ? "Miễn phí"
                      : formatUSDFromVND(shipping)}
                  </dd>
                </div>

              </dl>

              {/* TOTAL */}

              <div className="border-t border-[#D1D4CC] pt-5">

                <div className="flex items-end justify-between gap-5">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D8277]">
                      Tổng cộng
                    </p>

                    <p className="mt-1 text-[11px] text-[#92958D]">
                      Đã bao gồm phí vận chuyển
                    </p>
                  </div>

                  <span className="font-display text-[26px] tracking-tight text-[#252820]">
                    {formatUSDFromVND(total)}
                  </span>

                </div>

              </div>

              {/* CHECKOUT */}

              <Link
                to="/checkout"
                className="
                  mt-7
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  bg-[#667653]
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#566544]
                "
              >
                Thanh toán
                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.5}
                />
              </Link>

              {/* TRUST */}

              <div className="mt-5 border-t border-[#D7D9D1] pt-5">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCE3D5] text-[#607050]">
                    <span className="text-[10px]">✓</span>
                  </div>

                  <p className="text-[11px] leading-5 text-[#777B72]">
                    Thanh toán an toàn · Đóng gói cẩn thận ·
                    Giao hàng tận nơi
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}