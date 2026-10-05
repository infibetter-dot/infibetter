import { useEffect } from "react";

import {

  X,

  Minus,

  Plus,

  ShieldCheck,

  ShoppingBag,

} from "lucide-react";

import { useCart } from "@/lib/cart";

interface CartDrawerProps {

  open: boolean;

  onClose: () => void;

  onPayPal: () => void;

}



/* ============================================================

   PAYMENT LOGOS

============================================================ */





function formatUSD(value: number) {

  return new Intl.NumberFormat("en-US", {

    style: "currency",

    currency: "USD",

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  }).format(Number(value) || 0);

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

                          {formatUSD(

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

                  {formatUSD(subtotal)}

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

                  Final price

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

                {formatUSD(subtotal)}

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
                PAYPAL PAYMENT BRANDING
            =================================================== */}
            <div className="mt-3 flex flex-col items-center justify-center">
              <div className="mb-2 flex items-center justify-center">
                <span className="text-[10px] italic font-medium text-[#777777]">Powered by</span>
                <span className="ml-1 text-[14px] font-bold italic text-[#003087]">PayPal</span>
              </div>

              <div className="flex items-center justify-center gap-[6px]" aria-label="Accepted payment methods">
                <div className="flex h-[22px] w-[27px] items-center justify-center" aria-label="PayPal">
                  <svg viewBox="0 0 32 24" className="h-[18px] w-[24px]" aria-hidden="true">
                    <path fill="#003087" d="M10.1 4.2h8.1c4.1 0 6.2 2.2 5.5 5.5-.7 3.4-3.5 5.3-7.3 5.3h-2.5l-1 4.8H8.1l2-15.6Z" />
                    <path fill="#009CDE" d="M8.3 6.4h7.9c3.7 0 5.8 1.8 5.4 4.5-.5 2.8-3 4.6-6.6 4.6h-2.5l-.7 3.5H7.2L8.3 6.4Z" />
                  </svg>
                </div>

                <div className="flex h-[24px] min-w-[36px] items-center justify-center rounded-[5px] bg-[#1434CB]" aria-label="Visa">
                  <span className="text-[9px] font-black italic tracking-[-0.08em] text-white">VISA</span>
                </div>

                <div className="flex h-[24px] min-w-[36px] items-center justify-center rounded-[5px] bg-[#F3F3F3]" aria-label="Mastercard">
                  <div className="relative h-[15px] w-[25px]">
                    <span className="absolute left-0 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full bg-[#EB001B]" />
                    <span className="absolute right-0 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full bg-[#F79E1B]" />
                    <span className="absolute left-1/2 top-1/2 h-[15px] w-[7px] -translate-x-1/2 -translate-y-1/2 bg-[#FF5F00]" />
                  </div>
                </div>

                <span className="ml-[2px] text-[11px] font-medium text-[#777777]">+more</span>
              </div>
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

                  30-day returnss

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