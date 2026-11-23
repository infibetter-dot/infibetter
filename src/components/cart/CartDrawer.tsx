
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import {
  X,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useCart } from "@/lib/cart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onPayPal: () => void;
}

/* ============================================================
   HELPERS
============================================================ */

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

interface RecommendedProduct {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image_url: string | null;
  stock: number | null;
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
    add,
    remove,
    setQuantity,
  } = useCart();

  const productListRef = useRef<HTMLDivElement>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const cartProductIds = useMemo(
    () => items.map((item) => item.id).filter(Boolean),
    [items],
  );
  const cartProductKey = cartProductIds.slice().sort().join("|");

  /* ==========================================================
     RELATED PRODUCT RECOMMENDATIONS
     Match products by the categories represented in the cart.
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      if (!open || cartProductIds.length === 0) {
        setRecommendedProducts([]);
        return;
      }

      setRecommendationsLoading(true);

      try {
        const { data: cartProducts, error: cartProductsError } = await supabase
          .from("products")
          .select("id, category_id")
          .in("id", cartProductIds);

        if (cartProductsError) throw cartProductsError;

        const categoryIds = Array.from(
          new Set((cartProducts ?? []).map((product) => product.category_id).filter(Boolean)),
        );

        if (categoryIds.length === 0) {
          if (!cancelled) setRecommendedProducts([]);
          return;
        }

        const { data: relatedProducts, error: relatedError } = await supabase
          .from("products")
          .select("id, slug, name, price, image_url, stock, category_id")
          .in("category_id", categoryIds)
          .limit(20);

        if (relatedError) throw relatedError;

        const cartIds = new Set(cartProductIds.map(String));
        const uniqueProducts = (relatedProducts ?? [])
          .filter((product) =>
            product.id &&
            !cartIds.has(String(product.id)) &&
            product.image_url &&
            (product.stock === null || Number(product.stock) > 0) &&
            Number(product.price) > 0
          )
          .filter((product, index, all) =>
            all.findIndex((candidate) => candidate.id === product.id) === index
          )
          .slice(0, 8)
          .map((product) => ({
            id: String(product.id),
            slug: String(product.slug ?? ""),
            name: String(product.name ?? ""),
            price: product.price ?? 0,
            image_url: product.image_url,
            stock: product.stock,
          }));

        if (!cancelled) setRecommendedProducts(uniqueProducts);
      } catch (error) {
        console.error("Cart recommendations could not be loaded:", error);
        if (!cancelled) setRecommendedProducts([]);
      } finally {
        if (!cancelled) setRecommendationsLoading(false);
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [open, cartProductKey]);

  /* ==========================================================
     LOCK BODY SCROLL
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* ==========================================================
     ESC CLOSE
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Reset the scroll position whenever the drawer opens so cart items are visible first.
    requestAnimationFrame(() => {
      productListRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* OVERLAY */}
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

      {/* DRAWER */}
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
        {/* HEADER */}
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
              Your Cart
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

        {/* PRODUCT LIST */}
        <div
          ref={productListRef}
          className="
            min-h-0
            overflow-y-auto
            overscroll-contain
            bg-white
            px-4
            py-3
            sm:px-6
            sm:py-5
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
              {items.map((item) => {
                const configuration = {
                  productColorId: item.productColorId,
                  variantId: item.variantId,
                  deviceModelId: item.deviceModelId,
                  plugType: item.plugType,
                };

                const itemKey = [
                  item.id,
                  item.productColorId ?? "default-color",
                  item.variantId ?? "default-variant",
                  item.deviceModelId ?? "default-model",
                  item.plugType ?? "default-plug",
                ].join("-");

                return (
                  <div
                    key={itemKey}
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

                            {/* COLOR */}
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

                                <span>{item.colorName}</span>
                              </div>
                            )}

                            {/* PLUG TYPE */}
                            {item.plugType && (
                              <p className="mt-1.5 text-[11px] text-[#777777]">
                                Plug type:{" "}
                                <span className="font-semibold text-[#333333]">
                                  {item.plugType}
                                </span>
                              </p>
                            )}

                            {/* DEVICE MODEL */}
                            {item.deviceModelName && (
                              <p className="mt-1 text-[11px] text-[#777777]">
                                Model:{" "}
                                <span className="font-medium text-[#333333]">
                                  {item.deviceModelName}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* REMOVE */}
                          <button
                            type="button"
                            onClick={() =>
                              remove(item.id, configuration)
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
                                  configuration,
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
                                  configuration,
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
                          <p className="whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em] text-[#111111]">
                            {formatUSD(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* YOU MAY ALSO LIKE */}
          {items.length > 0 && (recommendationsLoading || recommendedProducts.length > 0) && (
            <section className="mt-7 rounded-2xl border border-[#E5E7EB] bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.025)] sm:p-4">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#777777]" strokeWidth={1.8} />
                    <h3 className="text-[13px] font-semibold tracking-[-0.015em] text-[#171717]">
                      You May Also Like
                    </h3>
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-[#858585]">
                    Accessories picked for your cart
                  </p>
                </div>
              </div>

              {recommendationsLoading && recommendedProducts.length === 0 ? (
                <div className="space-y-2">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="flex h-[82px] animate-pulse items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-2.5"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-[#F5F5F5]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-[#F0F0F0]" />
                        <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendedProducts.map((product) => (
                    <article
                      key={product.id}
                      className="flex min-h-[82px] w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-2.5 transition-colors hover:border-[#CFCFCF]"
                    >
                      <Link
                        to="/products/$slug"
                        params={{ slug: product.slug }}
                        className="flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white"
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          src={product.image_url ?? ""}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-1"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to="/products/$slug"
                          params={{ slug: product.slug }}
                          className="line-clamp-2 text-[11px] font-medium leading-[1.45] text-[#252525] hover:text-black sm:text-[12px]"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1.5 text-[12px] font-semibold text-[#171717]">
                          {formatUSD(Number(product.price))}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          add(
                            {
                              id: product.id,
                              slug: product.slug,
                              name: product.name,
                              price: Number(product.price),
                              image: product.image_url,
                            },
                            1,
                          );
                        }}
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#171717] px-3 text-[10px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.97] sm:px-3.5 sm:text-[11px]"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus className="h-3 w-3" strokeWidth={2.2} />
                        Add
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* SUMMARY / FOOTER */}
        {items.length > 0 && (
          <div
            className="
              shrink-0
              border-t
              border-[#E5E5E5]
              bg-white
              px-4
              pb-[calc(8px+env(safe-area-inset-bottom))]
              pt-2.5
              sm:px-6
              sm:pb-[calc(20px+env(safe-area-inset-bottom))]
              sm:pt-4
            "
          >
            {/* SUBTOTAL */}
            <div className="space-y-1.5 sm:space-y-2.5">
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

                <span className="text-right font-medium text-[#00A86B]">
                  Free
                </span>
              </div>
            </div>

            {/* DIVIDER */}
            <div
              className="
                my-2
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
                    text-[18px]
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
                  text-[19px]
                  font-semibold
                  tracking-[-0.035em]
                  text-[#111111]
                "
              >
                {formatUSD(subtotal)}
              </p>
            </div>

            {/* SECURE CHECKOUT */}
            <button
              type="button"
              onClick={onPayPal}
              className="
                mt-2.5
                flex
                h-[44px]
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

              <span>Secure checkout</span>
            </button>

            {/* PAYPAL PAYMENT BRANDING */}
            <div className="mt-1 flex flex-col items-center justify-center">
              <div className="mb-0 flex items-center justify-center">
                <span className="text-[10px] italic font-medium text-[#777777]">
                  Powered by
                </span>

                <span className="ml-1 text-[14px] font-bold italic text-[#003087]">
                  PayPal
                </span>
              </div>

              <div
                className="-mt-1.5 flex w-full items-center justify-center gap-1.5"
                aria-label="Accepted payment methods"
              >
                <img
                  src="/payment-methods/all%20card.png"
                  alt="Accepted payment methods"
                  className="-my-1 block h-auto w-[280px] max-w-[calc(100%-48px)] object-contain"
                  loading="lazy"
                />
                <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#6B7280]">
                  +more
                </span>
              </div>
            </div>

            {/* WARRANTY */}
            <div
              className="
                mt-1
                flex
                min-h-[38px]
                items-center
                justify-center
                rounded-[10px]
                border
                border-[#E5E7EB]
                bg-white
                px-3
                py-2
              "
            >
              <span className="flex items-center gap-2 text-[11px] font-medium text-[#3F4854]">
                <span className="text-[13px] font-semibold text-[#00A86B]">✓</span>
                <span>1-year warranty</span>
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
