import { useEffect } from "react";
import {
  X,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatUSDFromVND } from "@/lib/format";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onPayPal: () => void;
}

/* ============================================================
   PAYMENT LOGOS
============================================================ */

function VisaLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Visa"
    >
      <rect width="42" height="26" rx="2.5" fill="#1434CB" />

      <text
        x="21"
        y="17"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill="white"
        fontStyle="italic"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Mastercard"
    >
      <rect
        x="0.5"
        y="0.5"
        width="41"
        height="25"
        rx="2.5"
        fill="#111111"
        stroke="#D7D7D7"
      />

      <circle
        cx="17"
        cy="13"
        r="7"
        fill="#EB001B"
      />

      <circle
        cx="25"
        cy="13"
        r="7"
        fill="#F79E1B"
        fillOpacity="0.95"
      />
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="American Express"
    >
      <rect width="42" height="26" rx="2.5" fill="#1677B8" />

      <text
        x="21"
        y="16.5"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill="white"
      >
        AMEX
      </text>
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Apple Pay"
    >
      <rect
        x="0.5"
        y="0.5"
        width="41"
        height="25"
        rx="2.5"
        fill="white"
        stroke="#BDBDBD"
      />

      {/* Apple */}
      <path
        d="
          M14.3 9.1
          C13.2 9.1 12.1 10.1 12.1 11.9
          C12.1 14.1 13.7 16.9 15.1 16.9
          C15.8 16.9 16.2 16.4 17.1 16.4
          C17.9 16.4 18.2 16.9 19 16.9
          C20.5 16.9 21.5 14.5 21.5 14.4
          C21.5 14.4 20.2 13.8 20.2 12.2
          C20.2 10.9 21.2 10.2 21.3 10.1
          C20.7 9.2 19.7 9.1 19.3 9.1
          C18.3 9 17.4 9.7 16.9 9.7
          C16.4 9.7 15.6 9.1 14.3 9.1
          Z
        "
        fill="#111111"
      />

      <path
        d="
          M17.1 8.1
          C17.6 7.5 18 6.7 17.9 6
          C17.1 6 16.3 6.4 15.8 7
          C15.3 7.5 14.9 8.3 15 9
          C15.8 9.1 16.6 8.7 17.1 8.1
          Z
        "
        fill="#111111"
      />

      <text
        x="31"
        y="16"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill="#111111"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Google Pay"
    >
      <rect
        x="0.5"
        y="0.5"
        width="41"
        height="25"
        rx="2.5"
        fill="white"
        stroke="#E0E0E0"
      />

      <text
        x="21"
        y="16.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill="#4285F4"
      >
        G Pay
      </text>
    </svg>
  );
}

function KlarnaLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Klarna"
    >
      <rect width="42" height="26" rx="2.5" fill="#FFB3C7" />

      <text
        x="21"
        y="16.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill="#111111"
      >
        Klarna.
      </text>
    </svg>
  );
}

function ShopPayLogo() {
  return (
    <svg
      viewBox="0 0 42 26"
      className="h-[22px] w-[36px]"
      aria-label="Shop Pay"
    >
      <rect width="42" height="26" rx="2.5" fill="#5A31F4" />

      <text
        x="21"
        y="16.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill="white"
      >
        shop
      </text>
    </svg>
  );
}

/* ============================================================
   CART DRAWER
============================================================ */

export default function CartDrawer({
  open,
  onClose,
  onPayPal,
}: CartDrawerProps) {
  const {
    items,
    count,
    subtotal,
    remove,
    setQuantity,
  } = useCart();

  /* ==========================================================
     LOCK BODY SCROLL
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* ==========================================================
     ESC CLOSE
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">

      {/* ====================================================
          OVERLAY

          IMPORTANT:
          No backdrop blur.
          Light black overlay only.
          This keeps the page/header visible behind drawer.
      ===================================================== */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="
          absolute
          inset-0
          cursor-default
          bg-black/15
        "
      />

      {/* ====================================================
          DRAWER
      ===================================================== */}
      <aside
        className="
          absolute
          right-0
          top-0
          grid
          h-[100dvh]
          w-full
          max-w-[430px]
          grid-rows-[auto_minmax(0,1fr)_auto]
          overflow-hidden
          bg-white
          shadow-[-12px_0_40px_rgba(0,0,0,0.12)]
          animate-in
          slide-in-from-right
          duration-300
        "
      >

        {/* ==================================================
            HEADER
        =================================================== */}
        <div
          className="
            flex
            h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-[#E5E5E5]
            bg-white
            px-5
            sm:px-6
          "
        >
          <div className="flex items-center gap-2.5">

            <h2
              className="
                text-[19px]
                font-semibold
                tracking-[-0.025em]
                text-[#111111]
              "
            >
              Cart
            </h2>

            <span
              className="
                flex
                h-[23px]
                min-w-[23px]
                items-center
                justify-center
                rounded-full
                bg-[#111111]
                px-1.5
                text-[11px]
                font-semibold
                leading-none
                text-white
              "
            >
              {count}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-[#555555]
              transition
              hover:bg-[#F5F5F5]
              hover:text-[#111111]
            "
          >
            <X
              className="h-[19px] w-[19px]"
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* ==================================================
            PRODUCT LIST
        =================================================== */}
        <div
          className="
            min-h-0
            overflow-y-auto
            overscroll-contain
            bg-white
            px-5
            py-5
            sm:px-6
          "
        >
          {items.length === 0 ? (

            /* EMPTY CART */
            <div
              className="
                flex
                min-h-full
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F5F5F5]
                "
              >
                <ShoppingBag
                  className="h-7 w-7 text-[#777777]"
                  strokeWidth={1.5}
                />
              </div>

              <h3
                className="
                  text-[17px]
                  font-semibold
                  tracking-[-0.02em]
                  text-[#111111]
                "
              >
                Your cart is empty
              </h3>

              <p
                className="
                  mt-2
                  max-w-[270px]
                  text-[13px]
                  leading-5
                  text-[#777777]
                "
              >
                Add something you love and come back
                here when you're ready.
              </p>
            </div>

          ) : (

            /* PRODUCTS */
            <div className="space-y-5">

              {items.map((item) => (

                <div
                  key={`${item.id}-${item.productColorId ?? "default"}`}
                  className="
                    border-b
                    border-[#EEEEEE]
                    pb-5
                    last:border-b-0
                  "
                >
                  <div className="flex gap-4">

                    {/* PRODUCT IMAGE */}
                    <div
                      className="
                        h-[88px]
                        w-[88px]
                        shrink-0
                        overflow-hidden
                        rounded-[10px]
                        bg-[#F7F7F7]
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
                          "
                        />

                      ) : (

                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-[11px]
                            text-[#999999]
                          "
                        >
                          No image
                        </div>

                      )}
                    </div>

                    {/* PRODUCT INFO */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3
                            className="
                              line-clamp-2
                              text-[14px]
                              font-semibold
                              leading-[1.35]
                              tracking-[-0.01em]
                              text-[#111111]
                            "
                          >
                            {item.name}
                          </h3>

                          {item.colorName && (
                            <div
                              className="
                                mt-1.5
                                flex
                                items-center
                                gap-2
                                text-[11px]
                                text-[#777777]
                              "
                            >
                              {item.colorHex && (
                                <span
                                  className="
                                    h-3
                                    w-3
                                    shrink-0
                                    rounded-full
                                    border
                                    border-black/10
                                  "
                                  style={{
                                    backgroundColor:
                                      item.colorHex,
                                  }}
                                />
                              )}

                              <span>
                                {item.colorName}
                              </span>
                            </div>
                          )}

                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            remove(item.id)
                          }
                          aria-label={`Remove ${item.name}`}
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-[#999999]
                            transition
                            hover:bg-[#F5F5F5]
                            hover:text-[#111111]
                          "
                        >
                          <X
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </button>

                      </div>

                      {/* QUANTITY + PRICE */}
                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        {/* QUANTITY */}
                        <div
                          className="
                            flex
                            h-8
                            items-center
                            overflow-hidden
                            rounded-full
                            border
                            border-[#D9D9D9]
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            className="
                              flex
                              h-full
                              w-8
                              items-center
                              justify-center
                              text-[#555555]
                              transition
                              hover:bg-[#F5F5F5]
                            "
                            aria-label="Decrease quantity"
                          >
                            <Minus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.8}
                            />
                          </button>

                          <span
                            className="
                              flex
                              h-full
                              min-w-8
                              items-center
                              justify-center
                              border-x
                              border-[#D9D9D9]
                              px-2
                              text-[12px]
                              font-medium
                              text-[#111111]
                            "
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            className="
                              flex
                              h-full
                              w-8
                              items-center
                              justify-center
                              text-[#555555]
                              transition
                              hover:bg-[#F5F5F5]
                            "
                            aria-label="Increase quantity"
                          >
                            <Plus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.8}
                            />
                          </button>

                        </div>

                        {/* PRICE */}
                        <p
                          className="
                            whitespace-nowrap
                            text-[14px]
                            font-semibold
                            tracking-[-0.01em]
                            text-[#111111]
                          "
                        >
                          {formatUSDFromVND(
                            item.price *
                              item.quantity,
                          )}
                        </p>

                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* ==================================================
            SUMMARY / FOOTER
        =================================================== */}
        {items.length > 0 && (

          <div
            className="
              shrink-0
              border-t
              border-[#E5E5E5]
              bg-white
              px-5
              pb-5
              pt-4
              sm:px-6
              sm:pb-6
            "
          >

            {/* SUBTOTAL */}
            <div className="space-y-2.5">

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-[12px]
                "
              >
                <span className="text-[#777777]">
                  Subtotal
                </span>

                <span className="font-medium text-[#111111]">
                  {formatUSDFromVND(subtotal)}
                </span>
              </div>

              {/* SHIPPING */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-[12px]
                "
              >
                <span className="text-[#777777]">
                  Shipping
                </span>

                <span className="text-right text-[#555555]">
                  Calculated at checkout
                </span>
              </div>

            </div>

            {/* DIVIDER */}
            <div
              className="
                my-3.5
                border-t
                border-[#E5E5E5]
              "
            />

            {/* TOTAL */}
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >

              <div className="flex items-baseline gap-2">

                <p
                  className="
                    text-[20px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[#111111]
                  "
                >
                  Total
                </p>

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-[#E11D48]
                  "
                >
                  Save 20% overall
                </span>

              </div>

              <p
                className="
                  text-[21px]
                  font-semibold
                  tracking-[-0.035em]
                  text-[#111111]
                "
              >
                {formatUSDFromVND(subtotal)}
              </p>

            </div>

            {/* ==================================================
                SECURE CHECKOUT
                ONE BUTTON ONLY
            =================================================== */}
            <button
              type="button"
              onClick={onPayPal}
              className="
                mt-4
                flex
                h-[48px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[#0071E3]
                px-5
                text-[15px]
                font-semibold
                text-white
                transition
                hover:bg-[#0077ED]
                active:scale-[0.99]
              "
            >
              <ShieldCheck
                className="h-[17px] w-[17px]"
                strokeWidth={2}
              />

              <span>
                Secure checkout
              </span>
            </button>

            {/* ==================================================
                PAYMENT LOGOS
            =================================================== */}
            <div
              className="
                mt-3
                flex
                items-center
                justify-center
                gap-[5px]
              "
            >
              <VisaLogo />
              <MastercardLogo />
              <AmexLogo />
              <ApplePayLogo />
              <GooglePayLogo />
              <KlarnaLogo />
              <ShopPayLogo />
            </div>

            {/* ==================================================
                TRUST BOX
            =================================================== */}
            <div
              className="
                mt-3
                overflow-hidden
                rounded-[10px]
                border
                border-[#E1E1E1]
                bg-[#F7F7F7]
              "
            >

              <div className="grid grid-cols-2">

                {/* RATING */}
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    border-r
                    border-[#DDDDDD]
                    px-3
                    py-2
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-0.5
                      text-[10px]
                      font-semibold
                      text-[#00A86B]
                    "
                  >
                    ★★★★★
                  </div>

                  <span
                    className="
                      mt-0.5
                      text-[10px]
                      font-medium
                      text-[#555555]
                    "
                  >
                    Rated Excellent
                  </span>

                </div>

                {/* CUSTOMERS */}
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-3
                    py-2
                  "
                >

                  <span
                    className="
                      text-[13px]
                      font-semibold
                      tracking-[-0.02em]
                      text-[#222222]
                    "
                  >
                    230,000+
                  </span>

                  <span
                    className="
                      mt-0.5
                      text-[10px]
                      font-medium
                      text-[#555555]
                    "
                  >
                    Happy customers
                  </span>

                </div>

              </div>

              {/* BENEFITS */}
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-x-3
                  gap-y-1
                  border-t
                  border-[#DDDDDD]
                  px-3
                  py-1.5
                  text-center
                "
              >

                <span
                  className="
                    text-[9px]
                    font-medium
                    text-[#555555]
                  "
                >
                  <span className="mr-1 text-[#00A86B]">
                    ✓
                  </span>
                  Free shipping
                </span>

                <span
                  className="
                    text-[9px]
                    font-medium
                    text-[#555555]
                  "
                >
                  <span className="mr-1 text-[#00A86B]">
                    ✓
                  </span>
                  30-day returns
                </span>

                <span
                  className="
                    text-[9px]
                    font-medium
                    text-[#555555]
                  "
                >
                  <span className="mr-1 text-[#00A86B]">
                    ✓
                  </span>
                  Secure payments
                </span>

              </div>
            </div>

          </div>
        )}

      </aside>
    </div>
  );
}