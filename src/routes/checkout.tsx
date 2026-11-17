import {
  PayPalButtons,
  PayPalScriptProvider,
  FUNDING,
} from "@paypal/react-paypal-js";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  ChevronDown,
  Clock3,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { supabase } from "@/integrations/supabase/client";
import CheckoutVoucher from "@/components/checkout/CheckoutVoucher";
import type { VoucherSummary } from "@/components/checkout/voucher.types";

// Keep PayPal SDK configuration stable for the entire checkout page lifetime.
const PAYPAL_OPTIONS = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  locale: "en_US",
  // Only load the PayPal Buttons component.
  // The Debit/Credit Card option below is rendered as a PayPal funding button.
  components: "buttons",
  "disable-funding": "venmo",
};

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | INFIBETTER" },
      {
        name: "description",
        content: "Secure checkout at INFIBETTER.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://www.paypal.com" },
      { rel: "preconnect", href: "https://www.paypalobjects.com" },
      { rel: "dns-prefetch", href: "https://www.paypal.com" },
      { rel: "dns-prefetch", href: "https://www.paypalobjects.com" },
    ],
  }),
  component: CheckoutPage,
});

type ShippingMethod = "standard" | "express";

type CountryOption = {
  code: string;
  name: string;
  zone: string;
  express: number;
  standardTransit: [number, number];
  expressTransit: [number, number];
  dialCode: string;
};

type CheckoutOfferProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean | null;
  status: string | null;
};

const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", zone: "United States", express: 4.99, standardTransit: [5, 9], expressTransit: [2, 4], dialCode: "+1" },
  { code: "CA", name: "Canada", zone: "Canada", express: 6.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+1" },
  { code: "GB", name: "United Kingdom", zone: "United Kingdom", express: 7.99, standardTransit: [6, 10], expressTransit: [3, 4], dialCode: "+44" },
  { code: "DE", name: "Germany", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+49" },
  { code: "FR", name: "France", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+33" },
  { code: "IT", name: "Italy", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+39" },
  { code: "ES", name: "Spain", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+34" },
  { code: "NL", name: "Netherlands", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+31" },
  { code: "BE", name: "Belgium", zone: "Europe", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+32" },
  { code: "SE", name: "Sweden", zone: "Europe", express: 8.99, standardTransit: [7, 11], expressTransit: [3, 5], dialCode: "+46" },
  { code: "NO", name: "Norway", zone: "Europe", express: 8.99, standardTransit: [7, 11], expressTransit: [3, 5], dialCode: "+47" },
  { code: "CH", name: "Switzerland", zone: "Europe", express: 8.99, standardTransit: [7, 11], expressTransit: [3, 5], dialCode: "+41" },
  { code: "AU", name: "Australia", zone: "Australia & New Zealand", express: 9.99, standardTransit: [7, 12], expressTransit: [3, 5], dialCode: "+61" },
  { code: "NZ", name: "New Zealand", zone: "Australia & New Zealand", express: 9.99, standardTransit: [7, 12], expressTransit: [3, 5], dialCode: "+64" },
  { code: "JP", name: "Japan", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+81" },
  { code: "KR", name: "South Korea", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+82" },
  { code: "SG", name: "Singapore", zone: "Asia Pacific", express: 8.99, standardTransit: [5, 8], expressTransit: [2, 4], dialCode: "+65" },
  { code: "HK", name: "Hong Kong", zone: "Asia Pacific", express: 8.99, standardTransit: [5, 8], expressTransit: [2, 4], dialCode: "+852" },
  { code: "TW", name: "Taiwan", zone: "Asia Pacific", express: 8.99, standardTransit: [5, 8], expressTransit: [2, 4], dialCode: "+886" },
  { code: "TH", name: "Thailand", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+66" },
  { code: "MY", name: "Malaysia", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+60" },
  { code: "PH", name: "Philippines", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+63" },
  { code: "ID", name: "Indonesia", zone: "Asia Pacific", express: 8.99, standardTransit: [6, 10], expressTransit: [3, 5], dialCode: "+62" },
  { code: "VN", name: "Vietnam", zone: "Asia Pacific", express: 8.99, standardTransit: [4, 7], expressTransit: [2, 4], dialCode: "+84" },
];

const REST_OF_WORLD: CountryOption = {
  code: "ROW",
  name: "Other",
  zone: "Rest of World",
  express: 12.99,
  standardTransit: [8, 15],
  expressTransit: [4, 7],
  dialCode: "+",
};

const PROCESSING_DAYS: [number, number] = [1, 2];
const OFFER_DISCOUNT = 0.15;

type Ga4EcommerceItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  price: number;
  quantity: number;
  item_variant?: string;
};

function pushGa4Event(
  eventName: string,
  ecommerce?: Record<string, unknown>,
  extraParams: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const win = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ ecommerce: null });
  win.dataLayer.push({
    event: eventName,
    ...extraParams,
    ...(ecommerce ? { ecommerce } : {}),
  });
}

function flagUrl(code: string) {
  return code === "ROW"
    ? "https://flagcdn.com/w40/un.png"
    : `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

function getCountry(code: string) {
  return COUNTRIES.find((item) => item.code === code) ?? REST_OF_WORLD;
}

function addBusinessDays(start: Date, days: number) {
  const result = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDeliveryRange(country: CountryOption, method: ShippingMethod) {
  const transit =
    method === "express" ? country.expressTransit : country.standardTransit;
  const minDate = addBusinessDays(
    new Date(),
    PROCESSING_DAYS[0] + transit[0],
  );
  const maxDate = addBusinessDays(
    new Date(),
    PROCESSING_DAYS[1] + transit[1],
  );
  return `${formatDate(minDate)} – ${formatDate(maxDate)}`;
}

function usd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function PaymentMethodIcons() {
  return (
    <div
      className="flex w-full items-center justify-center gap-2 pt-2"
      aria-label="Accepted payment methods"
    >
      <div
        className="flex h-6 w-8 items-center justify-center rounded-md bg-white"
        title="PayPal"
      >
        <svg viewBox="0 0 32 24" className="h-5 w-6" aria-hidden="true">
          <path
            fill="#003087"
            d="M10.1 4.2h8.1c4.1 0 6.2 2.2 5.5 5.5-.7 3.4-3.5 5.3-7.3 5.3h-2.5l-1 4.8H8.1l2-15.6Z"
          />
          <path
            fill="#009CDE"
            d="M8.3 6.4h7.9c3.7 0 5.8 1.8 5.4 4.5-.5 2.8-3 4.6-6.6 4.6h-2.5l-.7 3.5H7.2L8.3 6.4Z"
            opacity=".9"
          />
        </svg>
      </div>

      <div
        className="flex h-6 min-w-[34px] items-center justify-center rounded-md bg-[#1434CB] px-1.5"
        title="Visa"
      >
        <span className="text-[10px] font-black italic tracking-tight text-white">
          VISA
        </span>
      </div>

      <div
        className="flex h-6 min-w-[34px] items-center justify-center rounded-md bg-[#F3F3F3]"
        title="Mastercard"
      >
        <svg viewBox="0 0 36 24" className="h-5 w-7" aria-hidden="true">
          <circle cx="13" cy="12" r="7" fill="#EB001B" />
          <circle cx="23" cy="12" r="7" fill="#F79E1B" />
          <path
            fill="#FF5F00"
            d="M18 6.8a7 7 0 0 0 0 10.4 7 7 0 0 0 0-10.4Z"
          />
        </svg>
      </div>

      <span className="ml-0.5 text-[12px] font-medium text-[#6B7280]">
        +more
      </span>
    </div>
  );
}

function CheckoutPage() {
  const { items, clear, count, add, remove } = useCart();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("US");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [voucherSummary, setVoucherSummary] = useState<VoucherSummary>({
    discountVoucher: null,
    shippingVoucher: null,
    discountAmount: 0,
    shippingDiscount: 0,
    shipping: 0,
    totalDiscount: 0,
    customerVoucher: null,
    customerDiscount: 0,
  });
  const [arrivalOpen, setArrivalOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [offerProducts, setOfferProducts] = useState<CheckoutOfferProduct[]>([]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerDismissed, setOfferDismissed] = useState(false);

  const checkoutEventSent = useRef(false);
  const ga4BeginCheckoutSent = useRef(false);
  const ga4NameEnteredSent = useRef(false);
  const ga4OrderEventsSent = useRef<Set<string>>(new Set());

  function trackCheckoutNameEntered() {
    if (!fullName.trim() || ga4NameEnteredSent.current) return;

    ga4NameEnteredSent.current = true;
    // Do not send the customer's name or any other personal data to GA4.
    pushGa4Event("checkout_name_entered", undefined, {
      form_step: "contact",
    });
  }

  const country = getCountry(countryCode);
  const shippingFeeUsd =
    shippingMethod === "express" ? country.express : 0;
  // INFIBETTER product prices are stored in USD.
  // Calculate checkout totals directly from cart line prices.
  const subtotalUsd = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  const discountAmountUsd = Number(voucherSummary.discountAmount || 0);
  const shippingDiscountUsd = Number(voucherSummary.shippingDiscount || 0);
  const customerDiscountUsd = Number(voucherSummary.customerDiscount || 0);
  const totalUsd = Math.max(
    0,
    subtotalUsd + shippingFeeUsd - discountAmountUsd - shippingDiscountUsd - customerDiscountUsd,
  );

  // Meta Pixel: fire InitiateCheckout once per checkout-page visit.
  useEffect(() => {
    if (count <= 0) return;

    if (!checkoutEventSent.current) {
      checkoutEventSent.current = true;
      trackMetaEvent("InitiateCheckout", {
        content_type: "product",
        content_ids: items.map((item) => String(item.id)),
        num_items: count,
        value: Number(totalUsd.toFixed(2)),
        currency: "USD",
      });
    }

    if (!ga4BeginCheckoutSent.current) {
      ga4BeginCheckoutSent.current = true;
      pushGa4Event("begin_checkout", {
        currency: "USD",
        value: Number(totalUsd.toFixed(2)),
        items: items.map((item): Ga4EcommerceItem => ({
          item_id: String(item.id),
          item_name: item.name,
          item_brand: "INFIBETTER",
          price: Number(Number(item.price).toFixed(2)),
          quantity: Number(item.quantity),
          ...(
            item.colorName || item.plugType || item.deviceModelName
              ? {
                  item_variant: [
                    item.colorName,
                    item.plugType ? `Plug ${item.plugType}` : null,
                    item.deviceModelName,
                  ].filter(Boolean).join(" / "),
                }
              : {}
          ),
        })),
      });
    }
  }, [count, items, totalUsd]);

  const deliveryRange = useMemo(
    () => getDeliveryRange(country, shippingMethod),
    [country, shippingMethod],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      setOfferLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,slug,name,price,compare_at_price,image_url,stock,is_active,status",
        )
        .gt("stock", 0)
        .order("top_seller", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("CHECKOUT OFFER LOAD ERROR", error);
        if (!cancelled) {
          setOfferProducts([]);
          setOfferLoading(false);
        }
        return;
      }

      const cartIds = new Set(items.map((item) => item.id));

      const candidates = ((data ?? []) as CheckoutOfferProduct[])
        // Match the Admin Products visibility rule:
        // a product is visible only when is_active is true and status is not "hidden".
        .filter(
          (product) =>
            product.is_active === true && product.status !== "hidden",
        )
        .filter((product) => !cartIds.has(product.id))
        .filter((product) => Number(product.stock ?? 0) > 0)
        .slice(0, 8);

      if (!cancelled) {
        setOfferProducts(candidates);
        setOfferIndex(0);
        setOfferLoading(false);
      }
    }

    loadOffers();

    return () => {
      cancelled = true;
    };
  }, [items]);

  if (count === 0) {
    return (
      <main className="min-h-screen bg-white px-5 py-24 text-center text-[#111]">
        <ShoppingBag className="mx-auto h-10 w-10" />
        <h1 className="mt-5 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Add something to your cart before checking out.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-[#0066e6] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  function buildPaypalCheckoutPayload() {
    trackCheckoutNameEntered();

    const form = document.querySelector("form");
    if (!form) throw new Error("Checkout form not found.");

    const formData = new FormData(form);
    const getValue = (name: string) =>
      String(formData.get(name) ?? "").trim();

    const checkout = {
      full_name: getValue("full_name"),
      email: getValue("email") || email.trim(),
      phone: getValue("phone"),
      address: getValue("address"),
      city: getValue("city"),
      district: getValue("state"),
      ward: getValue("postal_code"),
      postal_code: getValue("postal_code"),
      notes: [
        `Country: ${country.name}`,
        `Zone: ${country.zone}`,
        `Shipping: ${shippingMethod}`,
        `Estimated delivery: ${deliveryRange}`,
      ].join(" | "),
      subtotal: Number(subtotalUsd.toFixed(2)),
      shipping_fee: Number(shippingFeeUsd.toFixed(2)),
      discount_amount: Number(discountAmountUsd.toFixed(2)),
      shipping_discount: Number(shippingDiscountUsd.toFixed(2)),
      customer_discount: Number(customerDiscountUsd.toFixed(2)),
      total: Number(totalUsd.toFixed(2)),
      items: items.map((item) => ({
        product_id: String(item.id),
        product_name: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(Number(item.price).toFixed(2)),
        product_image: item.image || null,
        product_color_id: item.productColorId ?? null,
        color_name: item.colorName ?? null,
        color_hex: item.colorHex ?? null,
        variant_id: item.variantId ?? null,
        device_model_id: item.deviceModelId ?? null,
        device_model_name: item.deviceModelName ?? null,
        plug_type: item.plugType ?? null,
      })),
    };

    if (!checkout.full_name || !checkout.email || !checkout.phone ||
        !checkout.address || !checkout.city) {
      throw new Error(
        "Please complete your name, email, phone and delivery address before paying.",
      );
    }

    if (!checkout.items.length || checkout.items.some(
      (item) => !item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1
    )) {
      throw new Error("Your cart contains an invalid item.");
    }

    // The server recalculates prices and total from the database.
    // Do not send client-calculated amounts as payment authority.
    return checkout;
  }

  async function createPayPalOrder(paymentType: "PayPal" | "Card") {
    const checkout = buildPaypalCheckoutPayload();
    const { data, error } = await supabase.functions.invoke(
      "paypal-create-order",
      { body: { checkout, currency: "USD" } },
    );

    if (error || !data?.success || !data?.orderId) {
      console.error("PAYPAL CREATE ORDER ERROR", { error, data });
      throw new Error(
        data?.error ?? "Unable to create the PayPal order.",
      );
    }

    const paypalOrderId = String(data.orderId);
    if (!ga4OrderEventsSent.current.has(paypalOrderId)) {
      ga4OrderEventsSent.current.add(paypalOrderId);

      const ga4Items = items.map((item): Ga4EcommerceItem => ({
        item_id: String(item.id),
        item_name: item.name,
        item_brand: "INFIBETTER",
        price: Number(Number(item.price).toFixed(2)),
        quantity: Number(item.quantity),
        ...(
          item.colorName || item.plugType || item.deviceModelName
            ? {
                item_variant: [
                  item.colorName,
                  item.plugType ? `Plug ${item.plugType}` : null,
                  item.deviceModelName,
                ].filter(Boolean).join(" / "),
              }
            : {}
        ),
      }));

      pushGa4Event("add_shipping_info", {
        currency: "USD",
        value: Number(totalUsd.toFixed(2)),
        shipping_tier: shippingMethod,
        items: ga4Items,
      });

      pushGa4Event("add_payment_info", {
        currency: "USD",
        value: Number(totalUsd.toFixed(2)),
        payment_type: paymentType,
        items: ga4Items,
      });

      // Custom event: customer has submitted checkout and a PayPal order was created.
      pushGa4Event("place_order", {
        currency: "USD",
        value: Number(totalUsd.toFixed(2)),
        payment_type: paymentType,
        items: ga4Items,
      });
    }

    return paypalOrderId;
  }

  async function handlePaypalApprove(orderID: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = document.querySelector("form");
      if (!form) throw new Error("Checkout form not found.");
      const formData = new FormData(form);
      const getValue = (name: string) => String(formData.get(name) ?? "").trim();
      const checkout = {
        full_name: getValue("full_name"),
        email: getValue("email"),
        phone: getValue("phone"),
        address: getValue("address"),
        city: `${getValue("city")}, ${country.name}`,
        district: getValue("state"),
        ward: getValue("postal_code"),
        notes: `Shipping: ${country.name} / ${country.zone} / ${shippingMethod} | Estimated delivery: ${deliveryRange} | PayPal Order ID: ${orderID}`,
        subtotal: Number(subtotalUsd.toFixed(2)),
        shipping_fee: Number(shippingFeeUsd.toFixed(2)),
        total: Number(totalUsd.toFixed(2)),
        items: items.map((item) => ({
          product_id: String(item.id),
          product_name: item.name,
          product_image: item.image || null,
          product_color_id: item.productColorId ?? null,
          color_name: item.colorName ?? null,
          color_hex: item.colorHex ?? null,
          variant_id: item.variantId ?? null,
          device_model_id: item.deviceModelId ?? null,
          device_model_name: item.deviceModelName ?? null,
          plug_type: item.plugType ?? null,
          unit_price: Number(item.price),
          quantity: Number(item.quantity),
        })),
      };

      if (!checkout.full_name) {
        throw new Error("Please enter your full name before paying.");
      }

      const { data, error } = await supabase.functions.invoke(
        "paypal-capture-order",
        { body: { orderId: orderID } },
      );
      if (error || !data?.success || !data?.dbOrderId) {
        console.error("PAYPAL CHECKOUT FAILED", { error, data });
        throw new Error(data?.error ?? "Unable to confirm payment and save your order.");
      }
      if (!["COMPLETED", "PENDING"].includes(data.captureStatus)) {
        throw new Error("PayPal capture has not been accepted.");
      }

      // Only count a completed, non-pending payment as a Purchase.
      // Deduplicate by the database order ID in this browser.
      if (
        data.captureStatus === "COMPLETED" &&
        data.paymentStatus !== "pending"
      ) {
        const purchaseEventKey = `infibetter_purchase_tracked_${data.dbOrderId}`;
        if (!localStorage.getItem(purchaseEventKey)) {
          trackMetaEvent(
            "Purchase",
            {
              content_type: "product",
              content_ids: items.map((item) => String(item.id)),
              contents: items.map((item) => ({
                id: String(item.id),
                quantity: Number(item.quantity),
              })),
              num_items: count,
              value: Number(totalUsd.toFixed(2)),
              currency: "USD",
            },
          );
          localStorage.setItem(purchaseEventKey, "1");
        }

        // GA4 Purchase: fire only after PayPal confirms capture and Supabase returns an order ID.
        const ga4PurchaseEventKey = `infibetter_ga4_purchase_tracked_${data.dbOrderId}`;
        if (!localStorage.getItem(ga4PurchaseEventKey)) {
          pushGa4Event("purchase", {
            transaction_id: String(data.dbOrderId),
            value: Number(totalUsd.toFixed(2)),
            currency: "USD",
            shipping: Number(shippingFeeUsd.toFixed(2)),
            items: items.map((item): Ga4EcommerceItem => ({
              item_id: String(item.id),
              item_name: item.name,
              item_brand: "INFIBETTER",
              price: Number(Number(item.price).toFixed(2)),
              quantity: Number(item.quantity),
              ...(
                item.colorName || item.plugType || item.deviceModelName
                  ? {
                      item_variant: [
                        item.colorName,
                        item.plugType ? `Plug ${item.plugType}` : null,
                        item.deviceModelName,
                      ].filter(Boolean).join(" / "),
                    }
                  : {}
              ),
            })),
          });
          localStorage.setItem(ga4PurchaseEventKey, "1");
        }
      }

      localStorage.setItem("infibetter_last_order", JSON.stringify({
        id: data.dbOrderId,
        created_at: new Date().toISOString(),
        full_name: checkout.full_name,
        phone: checkout.phone,
        email: checkout.email,
        address: checkout.address,
        city: checkout.city,
        payment_method: "paypal",
        payment_status: data.paymentStatus,
        subtotal: checkout.subtotal,
        shipping: checkout.shipping_fee,
        total: checkout.total,
        shipping_method: shippingMethod,
        estimated_delivery: deliveryRange,
        items: checkout.items,
      }));
      if (data.paymentStatus === "pending") {
        toast.info("Order received. PayPal payment is pending review.");
      } else {
        toast.success("Payment confirmed and order saved.");
      }
      clear();
      navigate({ to: "/order-success" });
    } catch (error) {
      console.error("PAYPAL PAYMENT ERROR", error);
      toast.error(error instanceof Error ? error.message : "PayPal checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.info(
      "Checkout details are optional. You can pay directly with PayPal or a debit / credit card.",
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Link
            to="/"
            className="text-[19px] font-bold tracking-[-0.04em]"
          >
            INFIBETTER
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#174EA6]">
            <ShieldCheck className="h-4 w-4 text-[#174EA6]" strokeWidth={2.2} />
            <span>Secure checkout</span>
          </div>
        </div>
      </header>

      <div className="border-b border-emerald-100/80 bg-white px-4 py-1.5">
        <div className="mx-auto flex max-w-[1180px] items-center justify-center">
          <div
            className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full border border-emerald-100 bg-[#F1FBF6] px-3.5 py-1.5 text-center"
            aria-label="Loved by customers, with over 1,000 customer reviews"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9F5E7] text-[#07864B]">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.3} />
            </span>
            <span className="text-[11px] font-semibold tracking-[-0.01em] text-[#087044] sm:text-xs">
              Loved by 1,000+ customers
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-5 lg:px-8">
        <PayPalScriptProvider options={PAYPAL_OPTIONS}>
          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8 xl:gap-10"
          >
          <div className="contents lg:block lg:space-y-6">
            <section className="rounded-2xl border border-[#e2e2e2] p-5 sm:p-6">
              <SectionTitle
                eyebrow="1"
                title="Contact"
              />

              <div className="mt-5 space-y-4">
                
          

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Full name
                  </span>
                  <input
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={trackCheckoutNameEntered}
                    placeholder="Your full name"
                    className="h-11 w-full rounded-xl border border-[#dcdcdc] bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#0066e6] focus:ring-4 focus:ring-[#0066e6]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-[#dcdcdc] bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#0066e6] focus:ring-4 focus:ring-[#0066e6]/10"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e2e2] p-5 sm:p-6">
              <SectionTitle
                eyebrow="2"
                title="Delivery"
              />

              <div className="mt-5 space-y-4">
                <CountryDropdown
                  name="country"
                  value={countryCode}
                  onChange={(value) => {
                    setCountryCode(value);
                    setShippingMethod("standard");
                  }}
                />

                <Field
                  name="address"
                  label="Street address"
                  placeholder="House number, street, apartment"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    name="city"
                    label="City"
                    placeholder="City"
                  />
                  <Field
                    name="state"
                    label="State / region"
                    placeholder="State"
                  />
                  <Field
                    name="postal_code"
                    label="Postal code"
                    placeholder="Postal code"
                  />
                </div>

                <PhoneField
                  country={country}
                  value={phone}
                  onChange={setPhone}
                />

              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e2e2] p-5 sm:p-6">
              <SectionTitle
                eyebrow="3"
                title="Shipping"
                description={`Shipping rates for ${country.name}`}
              />

              <div className="mt-5 overflow-hidden rounded-xl border border-[#dedede]">
                <ShippingOption
                  selected={shippingMethod === "standard"}
                  onClick={() => setShippingMethod("standard")}
                  title="Standard Shipping"
                  subtitle={`Tracked · ${getDeliveryRange(country, "standard")}`}
                  detail={`${country.standardTransit[0]}–${country.standardTransit[1]} business days after dispatch`}
                  price="FREE"
                  icon={<Truck className="h-5 w-5" />}
                />

              </div>
            </section>

            {/* CHECKOUT OFFER */}
            {!offerDismissed && (
              <CheckoutOffer
                products={offerProducts}
                index={offerIndex}
                loading={offerLoading}
                onPrevious={() =>
                  setOfferIndex((current) =>
                    current <= 0
                      ? Math.max(offerProducts.length - 1, 0)
                      : current - 1,
                  )
                }
                onNext={() =>
                  setOfferIndex((current) =>
                    offerProducts.length === 0
                      ? 0
                      : current >= offerProducts.length - 1
                        ? 0
                        : current + 1,
                  )
                }
                onNoThanks={() => setOfferDismissed(true)}
                onAdd={(product) => {
                  const discountedPrice = Number(
                    (Number(product.price) * (1 - OFFER_DISCOUNT)).toFixed(2),
                  );

                  const alreadyInCart = items.some(
                    (item) => item.id === product.id,
                  );

                  if (alreadyInCart) {
                    toast.info("This product is already in your order.");
                    return;
                  }

                  add(
                    {
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: discountedPrice,
                      image: product.image_url,
                    },
                    1,
                  );

                  toast.success(
                    `${product.name} added with 15% off.`,
                  );
                }}
              />
            )}

            {/* PAYMENT */}
            <section className="order-20 box-border w-full min-w-0 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white sm:rounded-[12px] lg:order-none">
              <div className="border-b border-[#e5e7eb] px-3 py-3 sm:px-5 sm:py-4">
                <h2 className="text-[16px] font-semibold leading-5 tracking-[-0.02em] sm:text-[18px] sm:leading-6">
                  Payment
                </h2>
                <p className="mt-1 text-[11px] font-normal leading-4 text-[#6B7280] sm:text-xs">
                  All transactions are secure and encrypted.
                </p>
              </div>

                <div className="box-border w-full min-w-0 p-3 sm:p-4">
                  {/* Official PayPal wallet button. Keep the PayPal-hosted UI untouched. */}
                  <div className="w-full min-w-0 overflow-hidden">
                    <PayPalButtons
                      fundingSource={FUNDING.PAYPAL}
                      disabled={submitting}
                      style={{
                        layout: "vertical",
                        shape: "rect",
                        label: "paypal",
                        height: 48,
                      }}
                      createOrder={async () => createPayPalOrder("PayPal")}
                      onApprove={async (data) => {
                        await handlePaypalApprove(data.orderID);
                      }}
                      onCancel={() => {
                        toast.info("PayPal checkout was cancelled.");
                      }}
                      onError={(error) => {
                        console.error("PAYPAL BUTTON ERROR", error);
                        toast.error(
                          "PayPal could not complete the payment.",
                        );
                      }}
                    />
                  </div>

                  {/* Debit / credit card through PayPal — official PayPal button */}
                  <div className="mt-3 w-full min-w-0 overflow-hidden">
                    <PayPalButtons
                      fundingSource={FUNDING.CARD}
                      disabled={submitting}
                      style={{
                        layout: "vertical",
                        shape: "rect",
                        label: "pay",
                        height: 48,
                      }}
                      createOrder={async () => createPayPalOrder("Card")}
                      onApprove={async (data) => {
                        await handlePaypalApprove(data.orderID);
                      }}
                      onCancel={() => {
                        toast.info("Card payment was cancelled.");
                      }}
                      onError={(error) => {
                        console.error(
                          "PAYPAL CARD BUTTON ERROR",
                          error,
                        );
                        toast.error(
                          "Card payment could not be completed.",
                        );
                      }}
                    />
                  </div>

                  {/* Accepted payment methods */}
                  <PaymentMethodIcons />

                </div>
            </section>

            <section className="hidden rounded-2xl border border-[#e2e2e2] lg:block">
              <button
                type="button"
                onClick={() => setArrivalOpen((value) => !value)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Clock3 className="h-4 w-4 text-neutral-500" />
                  When will my order arrive?
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-500 transition ${
                    arrivalOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {arrivalOpen && (
                <div className="border-t border-[#e8e8e8] px-5 py-5 text-sm leading-6 text-neutral-600">
                  <p>
                    Please allow{" "}
                    <strong className="text-[#111]">
                      1–2 business days for processing.
                    </strong>
                  </p>
                  <p className="mt-4">Estimated delivery after dispatch:</p>
                  <p className="mt-2">
                    <strong className="text-[#111]">Standard:</strong>{" "}
                    {country.standardTransit[0]}–
                    {country.standardTransit[1]} business days.
                  </p>
                  <p>
                    <strong className="text-[#111]">Express:</strong>{" "}
                    {country.expressTransit[0]}–
                    {country.expressTransit[1]} business days, where available.
                  </p>
                  <p className="mt-4">
                    Your current selection is{" "}
                    <strong className="text-[#111]">
                      {shippingMethod === "express"
                        ? "Express"
                        : "Standard"}
                    </strong>
                    , with an estimated arrival of{" "}
                    <strong className="text-[#111]">{deliveryRange}</strong>.
                  </p>
                  <p className="mt-4">
                    We'll send your tracking link to{" "}
                    <strong className="text-[#111]">
                      {email || "your email address"}
                    </strong>{" "}
                    once your order ships.
                  </p>
                </div>
              )}
            </section>

          </div>

          <aside className="contents lg:sticky lg:top-6 lg:block">
            <div className="order-10 rounded-2xl border border-[#e2e2e2] bg-white p-5 sm:p-6 lg:order-none">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">
                  Order summary
                </h2>
                <span className="text-xs text-neutral-500">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-5 space-y-4 border-b border-[#e8e8e8] pb-5">
                {items.map((item) => (
                  <div
                    key={[
                      item.id,
                      item.productColorId ?? "default-color",
                      item.variantId ?? "default-variant",
                      item.deviceModelId ?? "default-device",
                      item.plugType ?? "default-plug",
                    ].join("-")}
                    className="flex min-w-0 gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f5] sm:h-[72px] sm:w-[72px]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-medium leading-5 text-[#171717] sm:text-sm">
                          {item.name}
                        </p>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-neutral-500">
                          <span>Qty {item.quantity}</span>
                          {item.colorName ? (
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              {item.colorHex ? (
                                <span
                                  aria-hidden="true"
                                  className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                              ) : null}
                              <span className="truncate">{item.colorName}</span>
                            </span>
                          ) : null}
                        </div>
                        {item.deviceModelName ? (
                          <p className="mt-1 text-xs leading-4 text-neutral-500">
                            <span className="font-medium text-neutral-700">{item.deviceModelName}</span>
                          </p>
                        ) : null}
                        {item.plugType ? (
                          <p className="mt-1 text-xs leading-4 text-neutral-500">
                            Plug type:{" "}
                            <span className="font-medium text-neutral-700">
                              {item.plugType}
                            </span>
                          </p>
                        ) : null}
                        <p className="mt-1.5 text-sm font-semibold tabular-nums text-[#171717]">
                          {usd(Number(item.price) * Number(item.quantity))}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          remove(item.id, {
                            productColorId: item.productColorId,
                            variantId: item.variantId,
                            deviceModelId: item.deviceModelId,
                            plugType: item.plugType,
                          });
                          toast.success(`${item.name} removed from your order.`);
                        }}
                        aria-label={`Remove ${item.name} from order`}
                        title="Remove item"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:h-9 sm:w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <CheckoutVoucher
                  subtotal={subtotalUsd}
                  shippingFee={shippingFeeUsd}
                  phone={phone}
                  cartItems={items}
                  onChange={setVoucherSummary}
                />
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{usd(subtotalUsd)}</span>
                </div>

                {discountAmountUsd > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Order discount</span>
                    <span>−{usd(discountAmountUsd)}</span>
                  </div>
                )}

                {shippingDiscountUsd > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Shipping discount</span>
                    <span>−{usd(shippingDiscountUsd)}</span>
                  </div>
                )}

                {customerDiscountUsd > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Personal voucher</span>
                    <span>−{usd(customerDiscountUsd)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span
                    className={
                      shippingFeeUsd === 0
                        ? "font-medium text-emerald-600"
                        : ""
                    }
                  >
                    {shippingFeeUsd === 0
                      ? "FREE"
                      : usd(shippingFeeUsd)}
                  </span>
                </div>

                <div className="border-t border-[#e8e8e8] pt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-xl font-semibold">
                      {usd(totalUsd)}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-[11px] text-neutral-500">
                    USD
                  </p>
                </div>
              </div>

            </div>

            <div className="order-30 mt-0 grid grid-cols-3 divide-x divide-[#dcdcdc] rounded-xl border border-[#dedede] bg-[#fafafa] py-4 lg:order-none lg:mt-5">
              <TrustStat
                icon={<Truck className="h-5 w-5" />}
                title="Tracked"
                text="Delivery updates"
              />
              <TrustStat
                icon={<RotateCcw className="h-5 w-5" />}
                title="30 days"
                text="Return window"
              />
              <TrustStat
                icon={<ShieldCheck className="h-5 w-5" />}
                title="1-year"
                text="Defect warranty"
              />
            </div>

            <div className="order-40 mt-0 rounded-xl bg-[#f7f7f7] p-4 text-xs leading-5 text-neutral-600 lg:order-none lg:mt-5">
                <div className="flex items-center gap-2 font-semibold text-[#111]">
                  <ShieldCheck className="h-4 w-4 text-[#0066e6]" />
                  Secure checkout
                </div>
                <p className="mt-1">
                  Your payment is processed securely by PayPal. Debit and credit card payments are handled by PayPal.
                </p>
            </div>

            <div className="order-50 mt-0 overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white lg:order-none lg:mt-4">
              <div className="border-b border-[#e8e8e8] px-5 py-4">
                <h3 className="text-sm font-semibold">
                  Help & delivery information
                </h3>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Everything you need to know before placing your order.
                </p>
              </div>

              <Faq
                open={faqOpen === "arrival"}
                onClick={() =>
                  setFaqOpen((value) =>
                    value === "arrival" ? null : "arrival",
                  )
                }
                question="When will my order arrive?"
              >
                <p>
                  Please allow <strong className="text-[#111]">1–2 business
                  days for processing</strong>.
                </p>
                <p className="mt-3">
                  Standard delivery is{" "}
                  <strong className="text-[#111]">
                    {country.standardTransit[0]}–
                    {country.standardTransit[1]} business days
                  </strong>{" "}
                  after dispatch.
                </p>
                <p className="mt-2">
                  Express delivery is{" "}
                  <strong className="text-[#111]">
                    {country.expressTransit[0]}–
                    {country.expressTransit[1]} business days
                  </strong>
                  , where available.
                </p>
                <p className="mt-3">
                  Estimated arrival for your current selection:{" "}
                  <strong className="text-[#111]">{deliveryRange}</strong>.
                </p>
              </Faq>

              <Faq
                open={faqOpen === "duties"}
                onClick={() =>
                  setFaqOpen((value) =>
                    value === "duties" ? null : "duties",
                  )
                }
                question="Are taxes and duties included?"
              >
                Your checkout total includes the shipping charge shown above.
                Applicable taxes and import duties may vary by destination and
                may be payable by the recipient unless INFIBETTER explicitly
                states otherwise.
              </Faq>

              <Faq
                open={faqOpen === "returns"}
                onClick={() =>
                  setFaqOpen((value) =>
                    value === "returns" ? null : "returns",
                  )
                }
                question="Can I return my order?"
              >
                You can request an eligible return within{" "}
                <strong className="text-[#111]">30 days of delivery</strong>{" "}
                under the INFIBETTER return policy. Approved returns do not
                incur a restocking fee. Your statutory consumer rights remain
                unaffected.
              </Faq>

              <Faq
                open={faqOpen === "faulty"}
                onClick={() =>
                  setFaqOpen((value) =>
                    value === "faulty" ? null : "faulty",
                  )
                }
                question="What if my product is faulty?"
              >
                Your INFIBETTER product includes a{" "}
                <strong className="text-[#111]">
                  12-month warranty for manufacturing defects
                </strong>
                , starting from delivery. Contact our team with your order
                number and clear photos or a short video. For a confirmed
                covered defect, we'll arrange a remedy at no additional cost.
                Your statutory consumer rights remain unaffected.
              </Faq>

              <Faq
                open={faqOpen === "device"}
                onClick={() =>
                  setFaqOpen((value) =>
                    value === "device" ? null : "device",
                  )
                }
                question="Will this fit my device?"
              >
                For phone cases and device-specific products, make sure the
                selected model in your order matches your device. If you are
                unsure, check the compatibility information on the product page
                or contact INFIBETTER before ordering.
              </Faq>
            </div>

            <div className="order-60 mt-0 border-t border-[#e8e8e8] pt-4 pb-1 lg:order-none lg:mt-5">
              <nav
                aria-label="Checkout legal information"
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] leading-5 sm:gap-x-4 sm:text-xs"
              >
                <Link
                  to="/refund-policy"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Refund policy
                </Link>
                <Link
                  to="/shipping"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Shipping
                </Link>
                <Link
                  to="/privacy-policy"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Privacy policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Terms of service
                </Link>
                <Link
                  to="/legal-notice"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Legal notice
                </Link>
                <Link
                  to="/cancellations"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Cancellations
                </Link>
                <Link
                  to="/contact"
                  className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
                >
                  Contact
                </Link>
              </nav>

              <p className="mx-auto mt-3 max-w-[330px] text-center text-[11px] leading-5 text-neutral-500 sm:text-xs">
                By placing your order, you agree to our terms and privacy policy.
              </p>
            </div>
          </aside>
          </form>
        </PayPalScriptProvider>
      </main>

    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#111] text-[11px] font-semibold text-white">
          {eyebrow}
        </span>
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      <p className="mt-1 pl-8 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        inputMode={type === "tel" ? "tel" : undefined}
        className="h-11 w-full rounded-xl border border-[#dcdcdc] bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#0066e6] focus:ring-4 focus:ring-[#0066e6]/10"
      />
    </label>
  );
}

function CountryDropdown({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = getCountry(value);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = COUNTRIES.filter((country) =>
    `${country.name} ${country.code} ${country.dialCode}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        Country / region
      </span>

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setSearch("");
        }}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-[#dcdcdc] bg-white px-3 text-left text-sm outline-none transition hover:border-[#bdbdbd] focus:border-[#0066e6] focus:ring-4 focus:ring-[#0066e6]/10"
      >
        <span className="flex min-w-0 items-center gap-2">
          <img
            src={flagUrl(selected.code)}
            alt=""
            className="h-[15px] w-[22px] shrink-0 rounded-[2px] object-cover"
          />
          <span className="truncate">{selected.name}</span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white shadow-xl">
          <div className="border-b border-[#ededed] p-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f7f7] px-3">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onChange(item.code);
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#f5f7fa] ${
                  item.code === value ? "bg-[#f0f6ff]" : ""
                }`}
              >
                <img
                  src={flagUrl(item.code)}
                  alt=""
                  className="h-[15px] w-[22px] shrink-0 rounded-[2px] object-cover"
                />
                <span className="min-w-0 flex-1 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-neutral-400">
                  {item.dialCode}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PhoneField({
  country,
  value,
  onChange,
}: {
  country: CountryOption;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        Phone number
      </span>

      <div className="flex h-11 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white transition focus-within:border-[#0066e6] focus-within:ring-4 focus-within:ring-[#0066e6]/10">
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`${country.dialCode} 555 000 0000`}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />

        <div className="flex w-[88px] shrink-0 items-center justify-center gap-2 border-l border-[#e5e5e5] bg-[#fafafa]">
          <img
            src={flagUrl(country.code)}
            alt=""
            className="h-[15px] w-[22px] rounded-[2px] object-cover"
          />
          <span className="text-xs font-medium text-neutral-700">
            {country.dialCode}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-neutral-400">
        We'll only use your phone number for delivery updates.
      </p>
    </label>
  );
}

function ShippingOption({
  selected,
  onClick,
  title,
  subtitle,
  detail,
  price,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  detail: string;
  price: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-[#e5e5e5] px-4 py-4 text-left last:border-b-0 ${
        selected
          ? "bg-[#0066e6]/[0.04]"
          : "bg-white hover:bg-[#fafafa]"
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          selected ? "border-[#0066e6]" : "border-[#cfcfcf]"
        }`}
      >
        {selected ? (
          <span className="h-2.5 w-2.5 rounded-full bg-[#0066e6]" />
        ) : null}
      </span>

      <span className="text-[#0066e6]">{icon}</span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-600">
          {subtitle}
        </span>
        <span className="mt-0.5 block text-[11px] text-neutral-400">
          {detail}
        </span>
      </span>

      <span
        className={`shrink-0 text-sm font-semibold ${
          price === "FREE" ? "text-emerald-600" : "text-[#111]"
        }`}
      >
        {price}
      </span>
    </button>
  );
}

function CheckoutOffer({
  products,
  index,
  loading,
  onPrevious,
  onNext,
  onNoThanks,
  onAdd,
}: {
  products: CheckoutOfferProduct[];
  index: number;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onNoThanks: () => void;
  onAdd: (product: CheckoutOfferProduct) => void;
}) {
  const product = products[index];

  return (
    <section className="overflow-hidden rounded-xl border border-[#e2e2e2] bg-[#fafafa]">
      <div className="px-4 pt-3">
        <h3 className="text-sm font-semibold tracking-[-0.02em]">
          Your checkout offer
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          Take an extra 15% off the sale price.
        </p>
      </div>

      {loading ? (
        <div className="mx-3 mt-2.5 animate-pulse rounded-lg bg-white p-2.5">
          <div className="flex gap-2.5">
            <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-neutral-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ) : product ? (
        <div className="mx-3 mt-2.5 rounded-lg bg-white p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#f3f3f3]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 text-xs font-semibold leading-4">
                {product.name}
              </h4>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[10px] tracking-[-1px] text-[#f5b800]">
                  ★★★★★
                </span>
                <span className="text-[10px] font-medium text-neutral-600">
                  4.9
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="text-[13px] font-bold text-[#d71920]">
                  {usd(Number(product.price) * (1 - OFFER_DISCOUNT))}
                </span>
                <span className="text-[10px] text-neutral-400 line-through">
                  {usd(Number(product.price))}
                </span>
                <span className="rounded-full bg-[#eeeeee] px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700">
                  Save 15%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAdd(product)}
              aria-label={`Add ${product.name} to order for ${usd(
                Number(product.price) * (1 - OFFER_DISCOUNT),
              )}`}
              className="flex min-h-9 shrink-0 items-center justify-center rounded-lg bg-[#0066E6] px-2.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#0057C7] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0066E6]/20 focus:ring-offset-1"
            >
              Add · {usd(Number(product.price) * (1 - OFFER_DISCOUNT))}
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-3 mt-2.5 rounded-lg bg-white px-3 py-4 text-xs text-neutral-500">
          No additional offer is available right now.
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={products.length < 2}
          aria-label="Previous offer"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-800 disabled:opacity-30"
        >
          <span className="text-lg">‹</span>
        </button>
        <button
          type="button"
          onClick={onNoThanks}
          className="min-h-8 text-[11px] font-medium text-[#0066e6] underline underline-offset-2"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={products.length < 2}
          aria-label="Next offer"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-800 disabled:opacity-30"
        >
          <span className="text-lg">›</span>
        </button>
      </div>
    </section>
  );
}

function TrustStat({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span className="text-[#0066e6]">{icon}</span>
      <span className="mt-1 text-xs font-semibold">{title}</span>
      <span className="mt-0.5 text-[10px] text-neutral-500">{text}</span>
    </div>
  );
}

function Faq({
  open,
  onClick,
  question,
  children,
}: {
  open: boolean;
  onClick: () => void;
  question: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#e8e8e8] last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold">{question}</span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="px-5 pb-5 text-sm leading-6 text-neutral-600">
          {children}
        </div>
      ) : null}
    </div>
  );
}
