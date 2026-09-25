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
  Truck,
  X,
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
import { z } from "zod";

import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | INFIBETTER" },
      {
        name: "description",
        content: "Secure checkout at INFIBETTER.",
      },
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
const VND_TO_USD = 25500;
const OFFER_DISCOUNT = 0.15;

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30),
  address: z.string().trim().min(5, "Please enter your street address.").max(300),
  city: z.string().trim().min(2, "Please enter your city.").max(120),
  state: z.string().trim().min(2, "Please enter your state or region.").max(120),
  postal_code: z.string().trim().min(2, "Please enter your postal code.").max(20),
});

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

function CheckoutPage() {
  const { items, subtotal: subtotalVnd, clear, count, add } = useCart();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("US");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [arrivalOpen, setArrivalOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  const [offerProducts, setOfferProducts] = useState<CheckoutOfferProduct[]>([]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerDismissed, setOfferDismissed] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalDocumentKey | null>(null);

  const country = getCountry(countryCode);
  const shippingFeeUsd =
    shippingMethod === "express" ? country.express : 0;
  const subtotalUsd = subtotalVnd / VND_TO_USD;
  const totalUsd = subtotalUsd + shippingFeeUsd;

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
          "id,slug,name,price,compare_at_price,image_url,stock",
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

  useEffect(() => {
    if (!legalModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLegalModal(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [legalModal]);

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

  async function createOrderInSupabase(
    paymentStatus: "paid",
    paypalOrderId: string,
  ) {
    const form = document.querySelector("form");
    if (!form) throw new Error("Checkout form not found.");

    const parsed = schema.safeParse(
      Object.fromEntries(new FormData(form)),
    );

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Please check your details.",
      );
    }

    const shippingLabel = `${country.name} / ${country.zone} / ${
      shippingMethod === "express" ? "Express" : "Standard"
    }`;

    const payload = {
      status: "pending",
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
      city: `${parsed.data.city}, ${country.name}`,
      district: parsed.data.state,
      ward: parsed.data.postal_code,
      notes: [
        `Shipping: ${shippingLabel}`,
        `Estimated delivery: ${deliveryRange}`,
        `PayPal Order ID: ${paypalOrderId}`,
      ].join(" | "),
      payment_method: "paypal",
      payment_status: paymentStatus,
      subtotal: Math.round(subtotalVnd),
      shipping_fee: Math.round(shippingFeeUsd * VND_TO_USD),
      shipping_discount: 0,
      discount_amount: 0,
      total: Math.round(totalUsd * VND_TO_USD),
    };

    const { data: order, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("*")
      .single();

    if (error || !order) {
      throw new Error(error?.message ?? "Unable to create your order.");
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      product_color_id: item.productColorId,
      color_name: item.colorName,
      color_hex: item.colorHex,
      unit_price: item.price,
      quantity: item.quantity,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    if (itemsError) throw new Error(itemsError.message);

    localStorage.setItem(
      "olive_last_order",
      JSON.stringify({
        id: order.id,
        created_at: new Date().toISOString(),
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: parsed.data.address,
        city: parsed.data.city,
        country: country.name,
        state: parsed.data.state,
        postal_code: parsed.data.postal_code,
        payment_method: "paypal",
        payment_status: paymentStatus,
        subtotal: subtotalVnd,
        shipping: Math.round(shippingFeeUsd * VND_TO_USD),
        total: Math.round(totalUsd * VND_TO_USD),
        shipping_method: shippingMethod,
        estimated_delivery: deliveryRange,
        items: insertedItems ?? [],
      }),
    );

    clear();
    navigate({ to: "/order-success" });
  }

  async function handlePaypalApprove(orderID: string) {
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "paypal-capture-order",
        { body: { orderId: orderID } },
      );

      if (error) {
        throw new Error("Unable to confirm the PayPal payment.");
      }

      if (!data?.success || data?.status !== "COMPLETED") {
        throw new Error("PayPal payment was not completed.");
      }

      await createOrderInSupabase("paid", orderID);
    } catch (error) {
      console.error("PAYPAL PAYMENT ERROR", error);
      toast.error(
        error instanceof Error ? error.message : "PayPal payment failed.",
      );
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.info(
      "Please use the PayPal button above to complete your payment.",
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
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="border-b border-[#ededed] bg-[#fafafa]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-center px-5 py-2.5 text-xs font-medium text-neutral-600">
          Trusted by 230,000+ customers worldwide
        </div>
      </div>

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px]"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#e2e2e2] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066e6]">
                    Express checkout
                  </p>
                  <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                    Pay securely with PayPal
                  </h1>
                </div>
                <CreditCard className="h-5 w-5 text-neutral-400" />
              </div>

              <div className="mt-5">
                <PayPalScriptProvider
                  options={{
                    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
                    currency: "USD",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    fundingSource={FUNDING.PAYPAL}
                    disabled={submitting}
                    style={{
                      layout: "vertical",
                      shape: "rect",
                      label: "paypal",
                      height: 48,
                    }}
                    onInit={() => setPaypalReady(true)}
                    createOrder={async () => {
                      const form = document.querySelector("form");
                      if (!form) {
                        throw new Error("Checkout form not found.");
                      }

                      const parsed = schema.safeParse(
                        Object.fromEntries(new FormData(form)),
                      );

                      if (!parsed.success) {
                        toast.error(
                          parsed.error.issues[0]?.message ??
                            "Please complete your details.",
                        );
                        throw new Error("Please complete your details.");
                      }

                      const { data, error } =
                        await supabase.functions.invoke(
                          "paypal-create-order",
                          {
                            body: {
                              amount: totalUsd.toFixed(2),
                              currency: "USD",
                            },
                          },
                        );

                      if (
                        error ||
                        !data?.success ||
                        !data?.orderId
                      ) {
                        console.error(
                          "PAYPAL CREATE ORDER ERROR",
                          error,
                          data,
                        );
                        throw new Error(
                          "Unable to create the PayPal order.",
                        );
                      }

                      return data.orderId;
                    }}
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
                </PayPalScriptProvider>
              </div>

              {!paypalReady && (
                <p className="mt-2 text-center text-xs text-neutral-400">
                  Loading secure PayPal checkout…
                </p>
              )}

              <p className="mt-3 text-center text-[11px] leading-5 text-neutral-500">
                Secure payment powered by PayPal.
              </p>
            </section>

            <section className="rounded-2xl border border-[#e2e2e2] p-5 sm:p-6">
              <SectionTitle
                eyebrow="1"
                title="Contact"
                description="We'll send your order confirmation and tracking updates here."
              />

              <div className="mt-5 space-y-4">
                <Field
                  name="full_name"
                  label="Full name"
                  required
                  placeholder="Your full name"
                />

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Email *
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
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
                description="Where should we send your order?"
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
                  required
                  placeholder="House number, street, apartment"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    name="city"
                    label="City"
                    required
                    placeholder="City"
                  />
                  <Field
                    name="state"
                    label="State / region"
                    required
                    placeholder="State"
                  />
                  <Field
                    name="postal_code"
                    label="Postal code"
                    required
                    placeholder="Postal code"
                  />
                </div>

                <PhoneField
                  country={country}
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

                <ShippingOption
                  selected={shippingMethod === "express"}
                  onClick={() => setShippingMethod("express")}
                  title="Express Shipping"
                  subtitle={`Tracked · ${getDeliveryRange(country, "express")}`}
                  detail={`${country.expressTransit[0]}–${country.expressTransit[1]} business days after dispatch`}
                  price={usd(country.express)}
                  icon={<PackageCheck className="h-5 w-5" />}
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
                  const discountedPrice = Math.round(
                    Number(product.price) * (1 - OFFER_DISCOUNT),
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

            <section className="rounded-2xl border border-[#e2e2e2]">
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

            <div className="pt-1">
              <nav
                aria-label="Checkout legal information"
                className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs"
              >
                <LegalLink label="Refund policy" onClick={() => setLegalModal("refund")} />
                <LegalLink label="Shipping" onClick={() => setLegalModal("shipping")} />
                <LegalLink label="Privacy policy" onClick={() => setLegalModal("privacy")} />
                <LegalLink label="Terms of service" onClick={() => setLegalModal("terms")} />
                <LegalLink label="Legal notice" onClick={() => setLegalModal("legal")} />
                <LegalLink label="Cancellations" onClick={() => setLegalModal("cancellations")} />
                <LegalLink label="Contact" onClick={() => setLegalModal("contact")} />
              </nav>

              <p className="mt-4 px-1 text-center text-xs leading-5 text-neutral-500">
                By placing your order, you agree to our terms and privacy policy.
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#e2e2e2] bg-white p-5 sm:p-6">
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
                    key={`${item.id}-${item.productColorId ?? "default"}`}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f5]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Qty {item.quantity}
                        {item.colorName ? ` · ${item.colorName}` : ""}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {usd(
                          (item.price * item.quantity) /
                            VND_TO_USD,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{usd(subtotalUsd)}</span>
                </div>

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

              <div className="mt-5 grid grid-cols-3 divide-x divide-[#dcdcdc] rounded-xl border border-[#dedede] bg-[#fafafa] py-4">
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

              <div className="mt-5 rounded-xl bg-[#f7f7f7] p-4 text-xs leading-5 text-neutral-600">
                <div className="flex items-center gap-2 font-semibold text-[#111]">
                  <ShieldCheck className="h-4 w-4 text-[#0066e6]" />
                  Secure checkout
                </div>
                <p className="mt-1">
                  Your payment is processed securely by PayPal.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white">
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
          </aside>
        </form>
      </main>

      {legalModal ? (
        <LegalModal
          document={legalModal}
          onClose={() => setLegalModal(null)}
        />
      ) : null}
    </div>
  );
}


/* =========================================================
   LEGAL LINKS + MODALS
========================================================= */

type LegalDocumentKey =
  | "refund"
  | "shipping"
  | "privacy"
  | "terms"
  | "legal"
  | "cancellations"
  | "contact";

function LegalLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
    >
      {label}
    </button>
  );
}

function LegalModal({
  document,
  onClose,
}: {
  document: LegalDocumentKey;
  onClose: () => void;
}) {
  const titles: Record<LegalDocumentKey, string> = {
    refund: "Refund policy",
    shipping: "Shipping",
    privacy: "Privacy policy",
    terms: "Terms of service",
    legal: "Legal notice",
    cancellations: "Cancellations",
    contact: "Contact",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="flex max-h-[88vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e8e8e8] px-5 py-4 sm:px-6">
          <h2
            id="legal-modal-title"
            className="text-lg font-semibold tracking-[-0.02em]"
          >
            {titles[document]}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-8">
          <LegalDocumentContent document={document} />
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#e8e8e8] px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#111] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LegalDocumentContent({
  document,
}: {
  document: LegalDocumentKey;
}) {
  const headingClass =
    "mt-7 text-base font-semibold tracking-[-0.01em] first:mt-0";
  const paragraphClass = "mt-3 text-sm leading-6 text-neutral-600";
  const listClass =
    "mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-600";
  const numberedClass =
    "mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-neutral-600";
  const linkClass =
    "text-[#0066e6] underline underline-offset-2";
  const mailto = "mailto:infibetter@gmail.com";

  if (document === "refund") {
    return (
      <article>
        <p className={paragraphClass}>
          We want the return process to be clear before you send anything.
          Please read the conditions below and obtain approval before returning
          a product.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>30-day window:</strong> Request a standard return within 30 days of delivery.</li>
          <li><strong>No restocking fee:</strong> We charge 0% on approved returns.</li>
          <li><strong>Standard return condition:</strong> Unused, unopened, and complete in the original packaging.</li>
          <li><strong>Return postage:</strong> Customer-paid for standard non-defective returns, unless applicable law requires otherwise.</li>
        </ul>

        <a
          href={mailto + "?subject=Start%20a%20return"}
          className="mt-5 inline-flex rounded-xl bg-[#0066e6] px-4 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Start a return
        </a>

        <h3 className={headingClass}>30-day return window</h3>
        <p className={paragraphClass}>
          You may request a standard return within <strong>30 days of delivery</strong>.
          Submitting a request does not automatically approve the return. You
          must wait for confirmation, instructions, and the correct return
          address before sending anything.
        </p>

        <h3 className={headingClass}>Standard return eligibility</h3>
        <ul className={listClass}>
          <li>Unused and unopened</li>
          <li>Complete and in the same condition as delivered</li>
          <li>Returned in its original packaging</li>
          <li>Accompanied by all accessories, manuals, inserts, and included gifts</li>
        </ul>
        <p className={paragraphClass}>
          A promotional or discounted price alone does not make a product Final
          Sale unless it was clearly identified as Final Sale before purchase.
        </p>

        <h3 className={headingClass}>Items not eligible under the standard return policy</h3>
        <ul className={listClass}>
          <li>Opened, used, incomplete, or customer-damaged products</li>
          <li>Products clearly marked Final Sale before purchase</li>
          <li>Personalized or custom-made products</li>
          <li>Gift cards</li>
          <li>Non-physical services that have already been provided, including shipping protection</li>
          <li>Products damaged through misuse, accidents, unauthorized modification, or failure to follow supplied instructions</li>
        </ul>
        <p className={paragraphClass}>
          These restrictions do not remove mandatory rights that may apply to
          defective, incorrect, or non-conforming goods.
        </p>

        <h3 className={headingClass}>How to request a return</h3>
        <ol className={numberedClass}>
          <li>Email <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.</li>
          <li>Use the email address connected to your order.</li>
          <li>Identify the relevant order and product.</li>
          <li>Provide the requested return reason and information.</li>
          <li>Wait for approval and return instructions.</li>
        </ol>
        <p className={paragraphClass}>
          <strong>Do not send the product to the address shown on the original parcel.</strong>
          That address may belong to a carrier or fulfillment partner and may
          not be able to accept returns.
        </p>

        <h3 className={headingClass}>Return shipping and costs</h3>
        <p className={paragraphClass}>
          <strong>We do not charge a restocking fee (0%).</strong>
        </p>
        <ul className={listClass}>
          <li>The customer pays for tracked return shipping for standard non-defective returns.</li>
          <li>Original shipping charges and paid shipping upgrades are not refundable unless required by law.</li>
          <li>The sender is responsible for return-related duties, taxes, brokerage charges, and similar costs unless applicable law requires otherwise.</li>
        </ul>

        <h3 className={headingClass}>Damaged, defective, or incorrect items</h3>
        <p className={paragraphClass}>
          <strong>Do not submit a standard return for a product that arrived damaged, defective, or incorrect.</strong>
          Contact us as soon as possible and include your order number, a clear
          description, photographs or a short video, and packaging photographs
          where relevant.
        </p>
        <p className={paragraphClass}>
          Contact us at <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
          After reviewing the information, we will provide the appropriate next
          step.
        </p>

        <h3 className={headingClass}>Refund processing</h3>
        <p className={paragraphClass}>
          We will notify you after an approved return reaches the specified
          return location and has been inspected. If accepted, the refundable
          amount—less any applicable return costs—will be issued to the original
          payment method. <strong>No restocking fee will be deducted.</strong>
        </p>

        <h3 className={headingClass}>Exchanges</h3>
        <p className={paragraphClass}>
          The simplest exchange process is normally to return an eligible
          product and place a new order for the correct product. Do not send an
          exchange before receiving approval and return instructions.
        </p>

        <h3 className={headingClass}>Cancellations</h3>
        <p className={paragraphClass}>
          If your order has not been dispatched, contact us immediately. We will
          try to change or cancel it, but changes cannot be guaranteed after
          fulfillment has started.
        </p>

        <h3 className={headingClass}>Mandatory consumer rights</h3>
        <p className={paragraphClass}>
          Nothing in this policy excludes or restricts mandatory consumer
          rights, including remedies for defective, incorrect, damaged, or
          non-conforming goods. Consumers in the European Union generally have
          statutory withdrawal rights for eligible distance purchases, subject
          to applicable exceptions. The 30-day commercial request window is
          intended to provide additional time where applicable.
        </p>

        <h3 className={headingClass}>Return assistance</h3>
        <p className={paragraphClass}>
          For assistance, email <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
          Include your order number and tell us whether the product is unopened,
          damaged, defective, incorrect, or otherwise not as expected.
        </p>
      </article>
    );
  }

  if (document === "shipping") {
    return (
      <article>
        <p className={paragraphClass}>
          We ship INFIBETTER products to customers worldwide. Available
          shipping methods, final charges, and estimated delivery information
          are displayed at checkout.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Order processing:</strong> Generally 1–2 business days before dispatch.</li>
          <li><strong>Delivery estimates:</strong> Transit times begin after dispatch.</li>
          <li><strong>Shipping options and charges:</strong> Displayed at checkout before payment.</li>
          <li><strong>Tracking:</strong> Normally emailed after your order has been dispatched.</li>
        </ul>

        <h3 className={headingClass}>Order processing</h3>
        <p className={paragraphClass}>
          Orders are generally processed within <strong>1–2 business days</strong>
          before dispatch. Processing may take longer during product launches,
          promotional events, public holidays, unusually high demand, or when
          additional order verification is required.
        </p>

        <h3 className={headingClass}>Estimated delivery times</h3>
        <p className={paragraphClass}>
          The following estimates apply <strong>after dispatch</strong>:
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5e5e5]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[#f7f7f7]">
              <tr>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Estimated transit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              <tr><td className="px-4 py-3">United States, Canada, and Europe</td><td className="px-4 py-3">5–9 business days</td></tr>
              <tr><td className="px-4 py-3">United Kingdom</td><td className="px-4 py-3">5–8 business days</td></tr>
              <tr><td className="px-4 py-3">Australia and New Zealand</td><td className="px-4 py-3">5–9 business days</td></tr>
              <tr><td className="px-4 py-3">Other destinations</td><td className="px-4 py-3">5–12 business days</td></tr>
            </tbody>
          </table>
        </div>

        <p className={paragraphClass}>
          These estimates are guidance and are not guaranteed delivery dates.
          Products containing batteries may require specialized shipping and
          can take approximately <strong>4–10 business days after dispatch</strong>,
          depending on destination and carrier service.
        </p>

        <h3 className={headingClass}>Express shipping</h3>
        <p className={paragraphClass}>
          Express shipping may be displayed at checkout for supported products,
          destinations, and orders. When available, processing is usually 1–2
          business days before dispatch and transit is usually 2–4 business days
          after dispatch.
        </p>

        <h3 className={headingClass}>Shipping charges</h3>
        <p className={paragraphClass}>
          Available shipping methods and charges are shown at checkout before
          payment. Any free-shipping promotion applies only when the order meets
          the conditions displayed during checkout.
        </p>

        <h3 className={headingClass}>Tracking</h3>
        <p className={paragraphClass}>
          Tracking information is normally emailed after your order has been
          dispatched. Temporary gaps between carrier scans are normal while a
          parcel moves between facilities, carriers, or customs authorities.
        </p>

        <h3 className={headingClass}>Delivery estimates and delays</h3>
        <ul className={listClass}>
          <li>Customs processing</li>
          <li>Carrier congestion</li>
          <li>Severe weather</li>
          <li>Local disruptions and public holidays</li>
          <li>Remote delivery locations</li>
          <li>Incomplete or incorrect address information</li>
          <li>Security or customs inspections</li>
          <li>Peak shopping periods</li>
        </ul>

        <h3 className={headingClass}>Pre-orders</h3>
        <p className={paragraphClass}>
          A product identified as a <strong>Pre-order</strong> is not ready for
          immediate dispatch. The product page or checkout will display an
          estimated shipping timeframe where available. This is an estimate and
          may change because of production, transportation, customs, or
          supply-chain circumstances.
        </p>

        <h3 className={headingClass}>Products containing batteries</h3>
        <p className={paragraphClass}>
          Products containing lithium batteries may be unavailable in certain
          countries or regions and may require additional transit time. Express
          delivery may not be available for these products. Available options
          will be shown at checkout.
        </p>

        <h3 className={headingClass}>Address changes and cancellations</h3>
        <p className={paragraphClass}>
          Review your delivery details carefully before completing checkout. If
          an address needs to be changed, contact us immediately. We will try to
          assist before dispatch, but cannot guarantee changes after fulfillment
          has started.
        </p>

        <h3 className={headingClass}>Tracking shows delivered</h3>
        <ol className={numberedClass}>
          <li>Confirm that the delivery address is correct.</li>
          <li>Check safe locations around the property.</li>
          <li>Ask household members and nearby neighbors.</li>
          <li>Check for carrier notices or pickup instructions.</li>
          <li>Contact the carrier for delivery details or proof of delivery.</li>
        </ol>

        <h3 className={headingClass}>Lost or damaged shipments</h3>
        <p className={paragraphClass}>
          If a parcel appears lost, arrives visibly damaged, or contains a
          damaged product, contact INFIBETTER at{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  if (document === "privacy") {
    return (
      <article>
        <p className={paragraphClass}>Last updated: September 3, 2026</p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>How we use information:</strong> To process orders, provide support, improve the Services, and support marketing.</li>
          <li><strong>Your rights:</strong> Access, correction, deletion, and other choices may be available under applicable law.</li>
          <li><strong>Marketing emails:</strong> You can unsubscribe using the link in each promotional email.</li>
          <li><strong>Privacy requests:</strong> Email <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with the subject line <strong>Privacy Request</strong>.</li>
        </ul>

        <h3 className={headingClass}>Personal information we collect or process</h3>
        <p className={paragraphClass}>
          We may collect or process information that identifies or can reasonably
          be linked to you, depending on how you interact with the Services,
          where you live, and as permitted or required by applicable law.
        </p>
        <ul className={listClass}>
          <li><strong>Contact details</strong> including name, address, billing address, shipping address, phone number, and email address.</li>
          <li><strong>Financial information</strong> including payment and transaction details.</li>
          <li><strong>Account information</strong> including username, password, preferences, and settings.</li>
          <li><strong>Transaction information</strong> including items viewed, cart items, purchases, returns, exchanges, and cancellations.</li>
          <li><strong>Communications with us</strong> including customer support inquiries.</li>
          <li><strong>Device information</strong> including device, browser, network, IP address, and similar identifiers.</li>
          <li><strong>Usage information</strong> including interactions with and navigation of the Services.</li>
        </ul>

        <h3 className={headingClass}>Personal information sources</h3>
        <ul className={listClass}>
          <li>Directly from you when you use the Services or provide information.</li>
          <li>Automatically through the Services, including cookies and similar technologies.</li>
          <li>From service providers that enable technology and process information on our behalf.</li>
          <li>From partners or other third parties.</li>
        </ul>

        <h3 className={headingClass}>How we use your personal information</h3>
        <ul className={listClass}>
          <li><strong>Provide, tailor, and improve the Services:</strong> Process payments, fulfill orders, arrange shipping, facilitate returns and exchanges, manage accounts, and improve the shopping experience.</li>
          <li><strong>Marketing and advertising:</strong> Send promotional communications and show relevant advertising where permitted by law.</li>
          <li><strong>Security and fraud prevention:</strong> Secure payments and services and detect, investigate, or prevent fraudulent, illegal, unsafe, or malicious activity.</li>
          <li><strong>Communicating with you:</strong> Provide customer support and maintain our business relationship.</li>
          <li><strong>Legal reasons:</strong> Comply with applicable law and respond to valid legal process.</li>
        </ul>

        <h3 className={headingClass}>How we disclose personal information</h3>
        <ul className={listClass}>
          <li>With vendors and service providers that perform payment processing, analytics, customer support, cloud storage, fulfillment, or shipping.</li>
          <li>With business and marketing partners where permitted and subject to applicable privacy notices.</li>
          <li>When you direct, request, or consent to disclosure.</li>
          <li>With affiliates or within our corporate group.</li>
          <li>In connection with business transactions or legal obligations.</li>
        </ul>

        <h3 className={headingClass}>Third-party websites and links</h3>
        <p className={paragraphClass}>
          The Services may provide links to third-party websites or platforms.
          Review their privacy and security policies before providing
          information. We are not responsible for independent third-party
          websites except where applicable law provides otherwise.
        </p>

        <h3 className={headingClass}>Children's data</h3>
        <p className={paragraphClass}>
          The Services are not intended for children, and we do not knowingly
          collect personal information from children under the age of majority
          in the applicable jurisdiction.
        </p>

        <h3 className={headingClass}>Security and retention</h3>
        <p className={paragraphClass}>
          No security measure is perfect or impenetrable. Retention periods
          depend on factors such as account maintenance, service delivery,
          legal obligations, dispute resolution, and enforcement of agreements.
        </p>

        <h3 className={headingClass}>Your rights and choices</h3>
        <ul className={listClass}>
          <li>Request access to personal information we hold about you.</li>
          <li>Request deletion of eligible information.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request a portable copy in applicable circumstances.</li>
          <li>Object to or restrict certain processing where available.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Opt out of certain marketing or targeted advertising where applicable.</li>
        </ul>

        <h3 className={headingClass}>Marketing communications</h3>
        <p className={paragraphClass}>
          You may opt out of promotional emails using the unsubscribe option
          provided in those emails. We may still send non-promotional messages
          relating to your account or orders.
        </p>

        <h3 className={headingClass}>International transfers</h3>
        <p className={paragraphClass}>
          Your personal information may be transferred, stored, or processed
          outside the country where you live. Where required by law, we use
          recognized safeguards for applicable international transfers.
        </p>

        <h3 className={headingClass}>Contact</h3>
        <p className={paragraphClass}>
          For privacy questions or requests, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with
          the subject line <strong>Privacy Request</strong>.
        </p>
      </article>
    );
  }

  if (document === "terms") {
    return (
      <article>
        <p className={paragraphClass}>
          These Terms of Service govern your use of INFIBETTER and purchases
          made through the store. By accessing the website or placing an order,
          you agree to these Terms. Mandatory consumer rights remain unaffected.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Shipping and delivery:</strong> See our Shipping policy for processing, delivery, and tracking information.</li>
          <li><strong>Returns and refunds:</strong> See our Refund policy for eligibility, return costs, and refund processing.</li>
          <li><strong>No restocking fee:</strong> We charge 0% on approved standard returns.</li>
          <li><strong>Your consumer rights:</strong> Mandatory rights under applicable law remain unaffected.</li>
        </ul>

        <h3 className={headingClass}>1. Online store terms</h3>
        <p className={paragraphClass}>
          You must be legally capable of entering into a binding agreement to
          place an order. You may not use our products, website, or services for
          unlawful or unauthorized purposes.
        </p>

        <h3 className={headingClass}>2. Product information</h3>
        <p className={paragraphClass}>
          We aim to present product descriptions, specifications, compatibility
          information, colors, prices, and images accurately. Screen settings,
          lighting, manufacturing updates, and reasonable production variations
          may cause minor differences.
        </p>

        <h3 className={headingClass}>3. Prices and payment</h3>
        <p className={paragraphClass}>
          Prices are displayed in the currency shown at checkout. The checkout
          total reflects applicable discounts and the shipping charges shown
          before payment. Payment is processed through the method selected at
          checkout.
        </p>

        <h3 className={headingClass}>4. Orders and acceptance</h3>
        <p className={paragraphClass}>
          Your order is an offer to purchase the selected products. An order
          confirmation acknowledges receipt but does not necessarily mean that
          the order has been accepted. We may refuse or cancel an order for
          legitimate reasons such as suspected fraud, product unavailability,
          delivery restrictions, or obvious pricing errors. If we cancel a paid
          order, the affected amount will be refunded to the original payment
          method.
        </p>

        <h3 className={headingClass}>5. Pre-orders</h3>
        <p className={paragraphClass}>
          Products clearly marked <strong>Pre-order</strong> are not available
          for immediate dispatch. Any shipping or release date shown is an
          estimate unless expressly stated otherwise.
        </p>

        <h3 className={headingClass}>6. Shipping and delivery</h3>
        <p className={paragraphClass}>
          Processing times, estimated transit times, tracking, customs
          information, and delivery limitations are explained in the Shipping
          policy. Delivery estimates are not guarantees. You are responsible
          for entering a complete and accurate delivery address.
        </p>

        <h3 className={headingClass}>7. Returns and refunds</h3>
        <p className={paragraphClass}>
          Returns, eligibility requirements, return shipping costs, damaged or
          incorrect products, and refund processing are governed by the Refund
          policy. <strong>We do not charge a restocking fee (0%).</strong>
        </p>

        <h3 className={headingClass}>8. Promotions and discount codes</h3>
        <ul className={listClass}>
          <li>Discount codes may be subject to eligibility requirements and usage limits.</li>
          <li>Discounts cannot be applied retroactively unless stated otherwise.</li>
          <li>Promotional offers have no cash value.</li>
          <li>Fraudulent or abusive use of a promotion may be cancelled.</li>
        </ul>

        <h3 className={headingClass}>9. Intellectual property</h3>
        <p className={paragraphClass}>
          Website content including text, graphics, logos, images, videos,
          product names, designs, and software is owned by or licensed to
          INFIBETTER and protected by applicable intellectual-property laws.
        </p>

        <h3 className={headingClass}>10. Reviews and submitted content</h3>
        <p className={paragraphClass}>
          If you submit a review, photograph, comment, suggestion, or other
          content, you confirm that you have the right to submit it and that it
          does not violate another person's rights or applicable law.
        </p>

        <h3 className={headingClass}>11. Third-party services and links</h3>
        <p className={paragraphClass}>
          The website may contain third-party tools, payment services,
          integrations, applications, or links. Third-party services may be
          governed by their own terms and privacy policies.
        </p>

        <h3 className={headingClass}>12. Prohibited conduct</h3>
        <ul className={listClass}>
          <li>Use the website for unlawful or fraudulent activity.</li>
          <li>Infringe intellectual-property or privacy rights.</li>
          <li>Submit false or misleading information.</li>
          <li>Introduce malware or harmful code.</li>
          <li>Scrape or extract website data without permission.</li>
          <li>Circumvent security or access restrictions.</li>
          <li>Interfere with the website or another customer's use.</li>
          <li>Place orders for unauthorized commercial resale.</li>
        </ul>

        <h3 className={headingClass}>13. Disclaimer and liability</h3>
        <p className={paragraphClass}>
          We do not guarantee that the website will always be uninterrupted,
          error-free, or available. Nothing in these Terms excludes or limits
          liability or consumer rights that cannot legally be excluded or
          limited.
        </p>

        <h3 className={headingClass}>14. Changes to these Terms</h3>
        <p className={paragraphClass}>
          We may update these Terms when our services, business practices, or
          legal obligations change. The version applying to your purchase is
          generally the version made available when the order was placed, unless
          a change is required by law or accepted by you.
        </p>

        <h3 className={headingClass}>15. Contact</h3>
        <p className={paragraphClass}>
          Questions about these Terms may be sent to{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  if (document === "legal") {
    return (
      <article>
        <h3 className={headingClass}>Legal notice</h3>
        <p className={paragraphClass}>
          This website is operated by <strong>INFIBETTER</strong>.
        </p>

        <h3 className={headingClass}>Customer service</h3>
        <p className={paragraphClass}>
          For customer service, order assistance, product questions, delivery
          issues, returns, or complaints, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>

        <h3 className={headingClass}>Intellectual property</h3>
        <p className={paragraphClass}>
          Unless otherwise stated, website content including text, logos,
          graphics, photographs, videos, product names, layouts, and designs is
          owned by or licensed to INFIBETTER and protected by applicable
          intellectual-property laws.
        </p>

        <h3 className={headingClass}>Mandatory consumer rights</h3>
        <p className={paragraphClass}>
          Nothing in this Legal Notice excludes or restricts mandatory consumer
          rights available under applicable law.
        </p>
      </article>
    );
  }

  if (document === "cancellations") {
    return (
      <article>
        <p className={paragraphClass}>
          This policy applies to products clearly identified as{" "}
          <strong>Pre-order</strong> before purchase.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Before dispatch:</strong> You may request cancellation of your pre-order.</li>
          <li><strong>Cancellation refunds:</strong> Issued to the original payment method.</li>
          <li><strong>Shipping timeframes:</strong> Estimated unless expressly stated otherwise.</li>
          <li><strong>After delivery:</strong> Our Refund policy and mandatory consumer rights apply.</li>
        </ul>

        <h3 className={headingClass}>What a pre-order means</h3>
        <p className={paragraphClass}>
          A pre-order allows you to purchase a product before it is ready for
          immediate dispatch. The product page or checkout may provide an
          estimated release or shipping timeframe. Unless expressly stated
          otherwise, this timeframe is an estimate and may change because of
          production, transportation, customs, carrier, or supply-chain
          circumstances.
        </p>

        <h3 className={headingClass}>Canceling before dispatch</h3>
        <p className={paragraphClass}>
          You may request cancellation of a pre-order at any time before it has
          been dispatched. Contact{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with
          your <strong>order number</strong>. If the pre-order has not been
          dispatched, the canceled product will be refunded to the original
          payment method.
        </p>

        <h3 className={headingClass}>After dispatch</h3>
        <p className={paragraphClass}>
          A pre-order cannot be canceled after dispatch. After delivery, the
          order is subject to our Refund policy and mandatory consumer rights.
        </p>

        <h3 className={headingClass}>Changes to the estimated shipping date</h3>
        <p className={paragraphClass}>
          If we cannot ship within the timeframe stated at purchase, we will
          notify you and provide a revised estimate. Where required by
          applicable law, you may have cancellation or refund options.
        </p>

        <h3 className={headingClass}>Orders containing multiple products</h3>
        <p className={paragraphClass}>
          If an order contains both in-stock and pre-order products, they may be
          shipped together or separately depending on fulfillment availability.
        </p>

        <h3 className={headingClass}>Cancellation by INFIBETTER</h3>
        <p className={paragraphClass}>
          We may cancel a pre-order if the product cannot be supplied,
          production is discontinued, a material pricing or product-information
          error occurred, shipping restrictions prevent fulfillment, or fraud
          or unauthorized payment is reasonably suspected. If we cancel a paid
          pre-order, the affected amount will be refunded to the original
          payment method.
        </p>

        <h3 className={headingClass}>Contact</h3>
        <p className={paragraphClass}>
          For pre-order assistance, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  return (
    <article>
      <h3 className={headingClass}>Contact information</h3>
      <p className={paragraphClass}>
        <strong>Trading name:</strong> INFIBETTER
      </p>
      <p className={paragraphClass}>
        <strong>Email:</strong>{" "}
        <a className={linkClass} href={mailto}>infibetter@gmail.com</a>
      </p>

      <h3 className={headingClass}>Customer support</h3>
      <p className={paragraphClass}>
        For assistance with an order, delivery, return, or product, email{" "}
        <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        Include your <strong>order number</strong> when contacting us about an
        existing order.
      </p>

      <h3 className={headingClass}>Returns</h3>
      <p className={paragraphClass}>
        You must request and receive return approval, instructions, and the
        correct return address before shipping anything. Contact INFIBETTER
        before sending a return.
      </p>
    </article>
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
        Country / region *
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

function PhoneField({ country }: { country: CountryOption }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        Phone number *
      </span>

      <div className="flex h-11 overflow-hidden rounded-xl border border-[#dcdcdc] bg-white transition focus-within:border-[#0066e6] focus-within:ring-4 focus-within:ring-[#0066e6]/10">
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
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
    <section className="overflow-hidden rounded-2xl border border-[#e2e2e2] bg-[#fafafa]">
      <div className="px-5 pt-5">
        <h3 className="text-base font-semibold tracking-[-0.02em]">
          Your checkout offer
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600">
          Take an extra 15% off the sale price.
        </p>
      </div>

      {loading ? (
        <div className="mx-4 mt-4 animate-pulse rounded-xl bg-white p-4">
          <div className="flex gap-3">
            <div className="h-24 w-24 rounded-xl bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ) : product ? (
        <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white">
          <div className="flex gap-3 p-3">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3f3f3]">
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
              <h4 className="line-clamp-2 text-sm font-semibold">
                {product.name}
              </h4>

              <div className="mt-1 flex items-center gap-1">
                <span className="text-[12px] tracking-[-1px] text-[#f5b800]">
                  ★★★★★
                </span>
                <span className="text-[11px] font-semibold text-neutral-700">
                  4.9
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-bold text-[#d71920]">
                  {usd(
                    (Number(product.price) * (1 - OFFER_DISCOUNT)) /
                      25500,
                  )}
                </span>

                {Number(product.price) > 0 && (
                  <span className="text-xs text-neutral-400 line-through">
                    {usd(Number(product.price) / 25500)}
                  </span>
                )}

                <span className="rounded-full bg-[#eeeeee] px-2 py-0.5 text-[10px] font-semibold">
                  Save 15%
                </span>
              </div>

              {Number(product.compare_at_price) > Number(product.price) && (
                <p className="mt-1 text-[10px] text-neutral-400">
                  Regular price:{" "}
                  {usd(Number(product.compare_at_price) / 25500)}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => onAdd(product)}
                className="min-w-[118px] rounded-xl bg-[#0066e6] px-4 py-3 text-center text-xs font-semibold leading-4 text-white transition hover:bg-[#005bd1] active:scale-[0.98]"
              >
                Add to order
                <span className="mt-0.5 block text-[11px] font-bold">
                  —{" "}
                  {usd(
                    (Number(product.price) * (1 - OFFER_DISCOUNT)) /
                      25500,
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="mx-3 mb-3 flex h-10 items-center justify-between rounded-xl border border-[#dcdcdc] bg-white px-3">
            <span className="text-xs font-medium text-neutral-700">
              Extra 15% off this product
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Save{" "}
              {usd(
                (Number(product.price) * OFFER_DISCOUNT) / 25500,
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-4 rounded-xl bg-white px-4 py-5 text-sm text-neutral-500">
          No additional offer is available right now.
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
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
          className="text-xs font-medium text-[#0066e6] underline underline-offset-2"
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
