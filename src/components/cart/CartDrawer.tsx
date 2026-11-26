
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";



import {
  X,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  PackageCheck,
  Gift,
  Check,
} from "lucide-react";

import { useCart } from "@/lib/cart";

/* ============================================================
   TYPES
============================================================ */

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onPayPal: () => void;
}

interface RecommendedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image_url: string | null;
  stock: number | null;
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

function getOriginalPrice(
  product: Record<string, unknown>,
  currentPrice: number,
): number | null {
  const fields = [
    "compare_at_price",
    "original_price",
    "old_price",
    "regular_price",
    "list_price",
  ];

  for (const field of fields) {
    const raw = product[field];

    if (raw === null || raw === undefined || raw === "") {
      continue;
    }

    const value = Number(raw);

    if (
      Number.isFinite(value) &&
      value > currentPrice
    ) {
      return value;
    }
  }

  return null;
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

  const productListRef = useRef<HTMLDivElement>(null);
  const recommendationSliderRef = useRef<HTMLDivElement>(null);

  const [recommendedProducts, setRecommendedProducts] =
    useState<RecommendedProduct[]>([]);

  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);

  // Optional complimentary order benefits (UI selection only).
  const [includeMysteryGift, setIncludeMysteryGift] =
    useState(false);
  const [includeDeliveryProtection, setIncludeDeliveryProtection] =
    useState(false);

  const cartProductIds = useMemo(
    () => items.map((item) => item.id).filter(Boolean),
    [items],
  );

  const cartProductKey = cartProductIds
    .slice()
    .sort()
    .join("|");

  /* ==========================================================
     LOAD RECOMMENDED PRODUCTS
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
        const { data: cartProducts, error: cartError } =
          await supabase
            .from("products")
            .select("id, category_id")
            .in("id", cartProductIds);

        if (cartError) throw cartError;

        const categoryIds = Array.from(
          new Set(
            (cartProducts ?? [])
              .map((product) => product.category_id)
              .filter(Boolean),
          ),
        );

        if (categoryIds.length === 0) {
          if (!cancelled) {
            setRecommendedProducts([]);
          }
          return;
        }

        const { data: relatedProducts, error: relatedError } =
          await supabase
            .from("products")
            .select("*")
            .in("category_id", categoryIds)
            .limit(20);

        if (relatedError) throw relatedError;

        const cartIds = new Set(
          cartProductIds.map(String),
        );

        const uniqueProducts = (relatedProducts ?? [])
          .filter(
            (product) =>
              product.id &&
              !cartIds.has(String(product.id)) &&
              product.image_url &&
              (product.stock === null ||
                Number(product.stock) > 0) &&
              Number(product.price) > 0,
          )
          .filter(
            (product, index, all) =>
              all.findIndex(
                (candidate) =>
                  candidate.id === product.id,
              ) === index,
          )
          .slice(0, 8)
          .map((product) => {
            const rawProduct =
              product as unknown as Record<string, unknown>;

            const price = Number(product.price);

            return {
              id: String(product.id),
              slug: String(product.slug ?? ""),
              name: String(product.name ?? ""),
              price,
              originalPrice: getOriginalPrice(
                rawProduct,
                price,
              ),
              image_url: product.image_url,
              stock: product.stock,
            };
          });

        if (!cancelled) {
          setRecommendedProducts(uniqueProducts);
        }
      } catch (error) {
        console.error(
          "Cart recommendations could not be loaded:",
          error,
        );

        if (!cancelled) {
          setRecommendedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setRecommendationsLoading(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [open, cartProductKey]);

  /* ==========================================================
     SLIDER NAVIGATION
  ========================================================== */

  const scrollRecommendations = (
    direction: "prev" | "next",
  ) => {
    const slider = recommendationSliderRef.current;

    if (!slider) return;

    slider.scrollBy({
      left:
        direction === "next"
          ? slider.clientWidth
          : -slider.clientWidth,
      behavior: "smooth",
    });
  };

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  /* ==========================================================
     RESET SCROLL
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      productListRef.current?.scrollTo({
        top: 0,
        behavior: "auto",
      });

      recommendationSliderRef.current?.scrollTo({
        left: 0,
        behavior: "auto",
      });
    });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] isolate">

      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="
          absolute inset-0
          cursor-default
          bg-black/25
        "
      />

      {/* ======================================================
          DRAWER
      ====================================================== */}

      <aside
        className="
          absolute
          inset-y-0
          right-0
          z-10
          grid
          h-[100dvh]
          w-full
          max-w-[430px]
          grid-rows-[68px_minmax(0,1fr)_auto]
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
        ================================================== */}

        <header
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#EAEAEA]
            bg-white
            px-5
            sm:px-6
          "
        >
          <div className="flex items-center gap-2.5">

            <h2
              className="
                text-[18px]
                font-semibold
                tracking-[-0.035em]
                text-[#171717]
              "
            >
              Your Cart
            </h2>

            <span
              className="
                flex h-[22px] min-w-[22px]
                items-center justify-center
                rounded-full
                bg-[#171717]
                px-1.5
                text-[11px]
                font-semibold
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
              flex h-9 w-9
              items-center justify-center
              rounded-full
              text-[#666666]
              transition
              hover:bg-[#F5F5F5]
              hover:text-black
            "
          >
            <X
              className="h-[19px] w-[19px]"
              strokeWidth={1.7}
            />
          </button>
        </header>

        {/* ==================================================
            MAIN SCROLL AREA
        ================================================== */}

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
            sm:py-4
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#D4D4D4 transparent",
          }}
        >

          {/* INNER CONTENT */}
          <div className="flex min-h-full flex-col">

            {/* ==============================================
                CART PRODUCTS
            ============================================== */}

            {items.length === 0 ? (

              <div
                className="
                  flex min-h-[240px]
                  flex-1 flex-col
                  items-center justify-center
                  text-center
                "
              >
                <div
                  className="
                    mb-4 flex h-16 w-16
                    items-center justify-center
                    rounded-full bg-[#F5F5F5]
                  "
                >
                  <ShoppingBag
                    className="h-7 w-7 text-[#777777]"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-[17px] font-semibold text-[#171717]">
                  Your cart is empty
                </h3>

                <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-[#777777]">
                  Add something you love and come back
                  here when you're ready.
                </p>
              </div>

            ) : (

              <div className="space-y-0">

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

                    <article
                      key={itemKey}
                      className="
                        flex gap-3.5
                        border-b border-[#EEEEEE]
                        py-2.5
                        first:pt-1
                        last:border-b-0
                      "
                    >

                      {/* PRODUCT IMAGE */}

                      <div
                        className="
                          h-[84px] w-[84px]
                          shrink-0
                          overflow-hidden
                          rounded-[9px]
                          bg-[#FAFAFA]
                        "
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="
                              h-full w-full
                              object-cover
                            "
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#999999]">
                            No image
                          </div>
                        )}
                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3
                              className="
                                line-clamp-2
                                text-[13px]
                                font-semibold
                                leading-[1.4]
                                tracking-[-0.015em]
                                text-[#171717]
                              "
                            >
                              {item.name}
                            </h3>

                            {/* COLOR */}

                            {item.colorName && (
                              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#777777]">

                                {item.colorHex && (
                                  <span
                                    className="
                                      h-3 w-3
                                      shrink-0
                                      rounded-full
                                      border border-black/10
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
                              <p className="mt-1 text-[11px] text-[#777777]">
                                Plug type:{" "}
                                <span className="font-medium text-[#333333]">
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
                              flex h-6 w-6
                              shrink-0
                              items-center justify-center
                              rounded-full
                              text-[#AAAAAA]
                              transition
                              hover:bg-[#F5F5F5]
                              hover:text-[#222222]
                            "
                          >
                            <X
                              className="h-3.5 w-3.5"
                              strokeWidth={1.8}
                            />
                          </button>

                        </div>

                        {/* QUANTITY + PRICE */}

                        <div
                          className="
                            mt-3
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >

                          {/* QUANTITY */}

                          <div
                            className="
                              flex h-[30px]
                              items-center
                              overflow-hidden
                              rounded-full
                              border border-[#DDDDDD]
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
                              aria-label="Decrease quantity"
                              className="
                                flex h-full w-[30px]
                                items-center justify-center
                                text-[#666666]
                                hover:bg-[#F5F5F5]
                              "
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span
                              className="
                                flex h-full min-w-[30px]
                                items-center justify-center
                                border-x border-[#DDDDDD]
                                text-[12px]
                                font-medium
                                text-[#171717]
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
                              aria-label="Increase quantity"
                              className="
                                flex h-full w-[30px]
                                items-center justify-center
                                text-[#666666]
                                hover:bg-[#F5F5F5]
                              "
                            >
                              <Plus className="h-3 w-3" />
                            </button>

                          </div>

                          {/* PRICE */}

                          <p
                            className="
                              whitespace-nowrap
                              text-[13px]
                              font-semibold
                              tracking-[-0.02em]
                              text-[#171717]
                            "
                          >
                            {formatUSD(
                              item.price * item.quantity,
                            )}
                          </p>

                        </div>

                      </div>

                    </article>

                  );
                })}

              </div>

            )}

            {/* ==============================================
                COMPLIMENTARY ORDER BENEFITS
            ============================================== */}

            {items.length > 0 && (
              <section
                className="
                  mt-3
                  overflow-hidden
                  rounded-[14px]
                  border border-[#E7E9E8]
                  bg-white
                "
                aria-label="Optional complimentary order benefits"
              >
                <div className="px-3.5 py-3.5">
                  {/* SECTION HEADING */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F6F4]">
                        <Gift
                          className="h-[17px] w-[17px] text-[#303A35]"
                          strokeWidth={1.7}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold tracking-[0.1em] text-[#252A27]">
                          COMPLIMENTARY EXTRAS
                        </span>
                        <span className="mt-1 block text-[10px] leading-[1.35] text-[#858B87]">
                          A little something extra with your order
                        </span>
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#E6EAE7] px-2 py-1 text-[8px] font-semibold tracking-[0.08em] text-[#68736C]">
                      OPTIONAL
                    </span>
                  </div>

                  {/* MYSTERY GIFT */}
                  <button
                    type="button"
                    onClick={() => setIncludeMysteryGift((value) => !value)}
                    aria-pressed={includeMysteryGift}
                    className={`mt-3 flex w-full items-center gap-3 rounded-[11px] border px-3 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008F65] focus-visible:ring-offset-2 ${
                      includeMysteryGift
                        ? "border-[#9BCDB7] bg-[#F6FAF8]"
                        : "border-[#ECEEEC] bg-white hover:border-[#D5DDD8]"
                    }`}
                  >
                    <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] ${includeMysteryGift ? "bg-[#E7F3EC]" : "bg-[#F5F6F5]"}`}>
                      <Gift
                        className="h-[19px] w-[19px] text-[#39443D]"
                        strokeWidth={1.65}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold leading-tight text-[#252A27]">
                        Mystery Gift
                      </span>
                      <span className="mt-1 block text-[9px] leading-[1.4] text-[#858B87]">
                        A surprise gift, selected for you
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-[12px] font-bold tracking-[-0.02em] text-[#00845D]">
                        FREE
                      </span>
                      <span className={`flex h-[19px] w-[19px] items-center justify-center rounded-full border transition-colors ${includeMysteryGift ? "border-[#00845D] bg-[#00845D] text-white" : "border-[#D4D9D6] bg-white text-transparent"}`}>
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    </span>
                  </button>

                  {/* DELIVERY PROTECTION */}
                  <button
                    type="button"
                    onClick={() => setIncludeDeliveryProtection((value) => !value)}
                    aria-pressed={includeDeliveryProtection}
                    className={`mt-2 flex w-full items-center gap-3 rounded-[11px] border px-3 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008F65] focus-visible:ring-offset-2 ${
                      includeDeliveryProtection
                        ? "border-[#9BCDB7] bg-[#F6FAF8]"
                        : "border-[#ECEEEC] bg-white hover:border-[#D5DDD8]"
                    }`}
                  >
                    <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] ${includeDeliveryProtection ? "bg-[#E7F3EC]" : "bg-[#F5F6F5]"}`}>
                      <ShieldCheck
                        className="h-[19px] w-[19px] text-[#39443D]"
                        strokeWidth={1.65}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold leading-tight text-[#252A27]">
                        Delivery Protection
                      </span>
                      <span className="mt-1 block text-[9px] leading-[1.4] text-[#858B87]">
                        Extra peace of mind for your delivery
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-[9px] text-[#A0A5A2] line-through">
                          $5.00
                        </span>
                        <span className="text-[12px] font-bold tracking-[-0.02em] text-[#00845D]">
                          FREE
                        </span>
                      </span>
                      <span className={`flex h-[19px] w-[19px] items-center justify-center rounded-full border transition-colors ${includeDeliveryProtection ? "border-[#00845D] bg-[#00845D] text-white" : "border-[#D4D9D6] bg-white text-transparent"}`}>
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    </span>
                  </button>

                  <p className="mt-3 text-center text-[9px] leading-[1.4] text-[#929894]">
                    Select either or both · No additional charge
                  </p>
                </div>
              </section>
            )}

            {/* ==============================================
                RECOMMENDATIONS
            ============================================== */}

            {items.length > 0 &&
              (recommendationsLoading ||
                recommendedProducts.length > 0) && (

                <section
                  className="
                    mt-auto
                    shrink-0
                    pt-5
                    w-full
                    bg-white
                  "
                >

                  {/* HEADER */}

                  <div
                    className="
                      mb-2.5
                      flex
                      items-center
                      justify-between
                      gap-3
                      border-b
                      border-[#EEEEEE]
                      pb-2.5
                    "
                  >

                    <h3
                      className="
                        text-[13px]
                        font-semibold
                        tracking-[-0.015em]
                        text-[#252525]
                      "
                    >
                      You may also like
                    </h3>

                    {/* NAVIGATION */}

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          scrollRecommendations("prev")
                        }
                        disabled={
                          recommendationsLoading ||
                          recommendedProducts.length <= 1
                        }
                        aria-label="Previous product"
                        className="
                          flex h-[32px] w-[32px]
                          items-center justify-center
                          rounded-full
                          border border-[#DDDDDD]
                          bg-white
                          text-[#777777]
                          transition
                          hover:border-[#888888]
                          hover:text-[#171717]
                          disabled:opacity-35
                        "
                      >
                        <ChevronLeft
                          className="h-4 w-4"
                          strokeWidth={1.7}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          scrollRecommendations("next")
                        }
                        disabled={
                          recommendationsLoading ||
                          recommendedProducts.length <= 1
                        }
                        aria-label="Next product"
                        className="
                          flex h-[32px] w-[32px]
                          items-center justify-center
                          rounded-full
                          border border-[#DDDDDD]
                          bg-white
                          text-[#555555]
                          transition
                          hover:border-[#888888]
                          hover:text-[#171717]
                          disabled:opacity-35
                        "
                      >
                        <ChevronRight
                          className="h-4 w-4"
                          strokeWidth={1.7}
                        />
                      </button>

                    </div>

                  </div>

                  {/* LOADING */}

                  {recommendationsLoading &&
                  recommendedProducts.length === 0 ? (

                    <div className="flex animate-pulse items-center gap-3 py-2">

                      <div className="h-[76px] w-[76px] shrink-0 rounded-lg bg-[#F3F3F3]" />

                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-4/5 rounded bg-[#EEEEEE]" />
                        <div className="h-3 w-2/3 rounded bg-[#EEEEEE]" />
                        <div className="h-3 w-1/3 rounded bg-[#EEEEEE]" />
                      </div>

                    </div>

                  ) : (

                    /* HORIZONTAL SLIDER */

                    <div
                      ref={recommendationSliderRef}
                      className="
                        flex
                        w-full
                        snap-x
                        snap-mandatory
                        overflow-x-auto
                        overscroll-x-contain
                        scroll-smooth
                      "
                      style={{
                        scrollbarWidth: "none",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >

                      {recommendedProducts.map((product) => (

                        <article
                          key={product.id}
                          className="
                            flex
                            w-full
                            min-w-full
                            shrink-0
                            snap-start
                            items-center
                            gap-3
                            py-1
                          "
                        >

                          {/* IMAGE */}

                          <Link
                            to="/products/$slug"
                            params={{ slug: product.slug }}
                            aria-label={`View ${product.name}`}
                            className="
                              flex h-[76px] w-[76px]
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              bg-white
                            "
                          >
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                loading="lazy"
                                className="
                                  h-full w-full
                                  object-contain
                                "
                              />
                            )}
                          </Link>

                          {/* PRODUCT INFO */}

                          <div className="min-w-0 flex-1">

                            <Link
                              to="/products/$slug"
                              params={{ slug: product.slug }}
                              className="
                                line-clamp-3
                                text-[12px]
                                font-medium
                                leading-[1.5]
                                text-[#333333]
                                transition
                                hover:text-black
                              "
                            >
                              {product.name}
                            </Link>

                            {/* PRICES */}

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">

                              <span className="text-[12px] font-semibold text-[#E31B23]">
                                {formatUSD(product.price)} USD
                              </span>

                              {product.originalPrice !== null && (
                                <span className="text-[11px] text-[#999999] line-through">
                                  {formatUSD(
                                    product.originalPrice,
                                  )} USD
                                </span>
                              )}

                            </div>

                          </div>

                        </article>

                      ))}

                    </div>

                  )}

                </section>

              )}

          </div>

        </div>

        {/* ==================================================
            FOOTER - FIXED BOTTOM
        ================================================== */}

        {items.length > 0 && (

          <footer
            className="
              relative
              z-20
              shrink-0
              border-t
              border-[#E7E7E7]
              bg-white
              px-4
              pt-2
              pb-[calc(6px+env(safe-area-inset-bottom))]
              sm:px-6
              sm:pt-2.5
              sm:pb-[calc(12px+env(safe-area-inset-bottom))]
            "
          >

            {/* SUBTOTAL */}

            <div className="space-y-1">

              <div className="flex items-center justify-between text-[12px]">

                <span className="text-[#777777]">
                  Subtotal
                </span>

                <span className="font-medium text-[#171717]">
                  {formatUSD(subtotal)}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex items-center justify-between text-[12px]">

                <span className="text-[#777777]">
                  Shipping
                </span>

                <span className="font-semibold text-[#00A86B]">
                  Free
                </span>

              </div>

            </div>

            {/* DIVIDER */}

            <div className="my-1.5 border-t border-[#E8E8E8]" />

            {/* TOTAL */}

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-baseline gap-2">

                <span
                  className="
                    text-[18px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[#171717]
                  "
                >
                  Total
                </span>

                <span className="text-[10px] font-medium text-[#E11D48]">
                  Final price
                </span>

              </div>

              <span
                className="
                  text-[19px]
                  font-semibold
                  tracking-[-0.035em]
                  text-[#171717]
                "
              >
                {formatUSD(subtotal)}
              </span>

            </div>

            {/* CHECKOUT BUTTON */}

            <button
              type="button"
              onClick={onPayPal}
              className="
                mt-2
                flex
                h-[42px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[9px]
                bg-[#0875E8]
                px-5
                text-[14px]
                font-semibold
                text-white
                transition
                hover:bg-[#0068D7]
                active:scale-[0.99]
              "
            >

              <ShieldCheck
                className="h-[16px] w-[16px]"
                strokeWidth={2}
              />

              <span>Secure checkout</span>

            </button>

            {/* PAYPAL + PAYMENT METHODS */}

            <div className="mt-1 flex flex-col items-center">

              {/* PAYPAL BRANDING */}
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] italic text-[#888888]">
                  Powered by
                </span>
                <span className="text-[14px] font-bold italic text-[#003087]">
                  PayPal
                </span>
              </div>

              {/* PAYMENT METHODS */}
              <div
                className="
                  mt-1
                  flex h-[36px] w-full
                  items-center justify-center
                  gap-2
                "
                aria-label="Accepted payment methods"
              >
                {/* Clip the built-in whitespace in the payment-logo image
                    so the actual card marks appear larger on mobile. */}
                <div className="flex h-[35px] w-[270px] max-w-[calc(100%-48px)] items-center justify-center overflow-hidden">
                  <img
                    src="/payment-methods/all%20card.png"
                    alt="Accepted payment methods"
                    loading="lazy"
                    className="
                      h-[34px]
                      w-[285px]
                      max-w-none
                      scale-[1.8]
                      object-contain
                    "
                  />
                </div>

                <span className="shrink-0 text-[11px] font-medium text-[#777777]">
                  +more
                </span>
              </div>

            </div>

            
{/* PREMIUM CUSTOMER ASSURANCE */}

            <section
              className="
                mt-1.5
                overflow-hidden
                rounded-[11px]
                border border-[#E6E7E9]
                bg-white
              "
            >
              <div className="px-3 py-2.5">

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold tracking-[0.12em] text-[#252525]">
                    CUSTOMER ASSURANCE
                  </h3>

                  <div className="flex items-center gap-1">
                    <ShieldCheck
                      className="h-[13px] w-[13px] text-[#008F65]"
                      strokeWidth={2}
                    />
                    <span className="text-[9px] font-semibold tracking-[0.04em] text-[#777777]">
                      INFIBETTER
                    </span>
                  </div>
                </div>

                {/* CUSTOMER BENEFITS */}
                <div className="grid grid-cols-3 divide-x divide-[#EAEAEA]">

                  {/* WARRANTY */}
                  <div className="flex flex-col items-center px-1.5">
                    <ShieldCheck
                      className="h-[18px] w-[18px] text-[#333333]"
                      strokeWidth={1.5}
                    />
                    <span className="mt-1.5 text-[11px] font-bold tracking-[-0.02em] text-[#252525]">
                      01 YEAR
                    </span>
                    <span className="mt-0.5 text-center text-[9px] font-medium leading-tight text-[#858585]">
                      Product Warranty
                    </span>
                  </div>

                  {/* REPLACEMENT */}
                  <div className="flex flex-col items-center px-1.5">
                    <RefreshCcw
                      className="h-[18px] w-[18px] text-[#333333]"
                      strokeWidth={1.5}
                    />
                    <span className="mt-1.5 text-[11px] font-bold tracking-[-0.02em] text-[#252525]">
                      30 DAYS
                    </span>
                    <span className="mt-0.5 text-center text-[9px] font-medium leading-tight text-[#858585]">
                      Replacement
                    </span>
                  </div>

                  {/* TRACKING */}
                  <div className="flex flex-col items-center px-1.5">
                    <PackageCheck
                      className="h-[18px] w-[18px] text-[#333333]"
                      strokeWidth={1.5}
                    />
                    <span className="mt-1.5 text-[11px] font-bold tracking-[-0.02em] text-[#252525]">
                      FREE
                    </span>
                    <span className="mt-0.5 text-center text-[9px] font-medium leading-tight text-[#858585]">
                      Order Tracking
                    </span>
                  </div>

                </div>

              </div>
            </section>

            </footer>

)}

</aside>
</div>
);
}
