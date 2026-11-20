import {
  PayPalButtons,
  PayPalScriptProvider,
  FUNDING,
} from "@paypal/react-paypal-js";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  ChevronDown,
  Clock3,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
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
type CheckoutFlow = "express" | "standard";

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

function pushCheckoutBehaviorEvent(
  eventName: string,
  params: Record<string, unknown> = {},
) {
  pushGa4Event(eventName, undefined, {
    checkout_page: "/checkout",
    ...params,
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
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const hasShippingAddress =
    shippingAddress.trim().length > 0 &&
    shippingCity.trim().length > 0 &&
    shippingPostalCode.trim().length > 0;
  const [phone, setPhone] = useState("");
  const hasCompleteDeliveryDetails =
    email.trim().length > 0 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    shippingAddress.trim().length > 0 &&
    shippingCity.trim().length > 0 &&
    shippingPostalCode.trim().length > 0 &&
    phone.trim().length > 0;
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
const [offerProducts, setOfferProducts] = useState<CheckoutOfferProduct[]>([]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerDismissed, setOfferDismissed] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [bottomOrderSummaryOpen, setBottomOrderSummaryOpen] = useState(true);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocumentKey>("refund");

  const checkoutEventSent = useRef(false);
  const ga4BeginCheckoutSent = useRef(false);
  const ga4NameEnteredSent = useRef(false);
  const ga4OrderEventsSent = useRef<Set<string>>(new Set());

  // Checkout behavior tracking: never collect field values or other PII.
  const checkoutStartedAt = useRef(0);
  const maxScrollDepth = useRef(0);
  const scrollMilestonesSent = useRef<Set<number>>(new Set());
  const viewedCheckoutSections = useRef<Set<string>>(new Set());
  const focusedCheckoutFields = useRef<Set<string>>(new Set());
  const editedCheckoutFields = useRef<Set<string>>(new Set());
  const lastCheckoutSection = useRef("checkout_top");
  const lastPaymentAttempt = useRef<{
    flow: CheckoutFlow;
    paymentType: "PayPal" | "Card";
  } | null>(null);
  const checkoutExitSent = useRef(false);
  const checkoutCompleted = useRef(false);

  function trackCheckoutPaymentClick(
    flow: CheckoutFlow,
    paymentType: "PayPal" | "Card",
  ) {
    lastPaymentAttempt.current = { flow, paymentType };
    pushCheckoutBehaviorEvent("checkout_payment_click", {
      checkout_flow: flow,
      payment_type: paymentType,
      payment_location: flow === "express" ? "express_checkout" : "payment_section",
    });
  }

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
  const netShippingUsd = Math.max(0, shippingFeeUsd - shippingDiscountUsd);
  const totalUsd = Math.max(
    0,
    subtotalUsd + shippingFeeUsd - discountAmountUsd - shippingDiscountUsd - customerDiscountUsd,
  );

  // Track checkout page entry, scroll milestones, section visibility,
  // field interaction (field names only), and page exit.
  useEffect(() => {
    checkoutStartedAt.current = performance.now();
    pushCheckoutBehaviorEvent("checkout_page_view", {
      item_count: count,
      currency: "USD",
      value: Number(totalUsd.toFixed(2)),
    });

    const getScrollPercent = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
      return atBottom ? 100 : Math.min(99, Math.round((window.scrollY / scrollable) * 100));
    };

    const handleScroll = () => {
      const percent = getScrollPercent();
      maxScrollDepth.current = Math.max(maxScrollDepth.current, percent);

      for (const milestone of [25, 50, 75, 90, 100]) {
        if (percent >= milestone && !scrollMilestonesSent.current.has(milestone)) {
          scrollMilestonesSent.current.add(milestone);
          pushCheckoutBehaviorEvent("checkout_scroll_depth", {
            percent_scrolled: milestone,
            max_scroll_depth: maxScrollDepth.current,
          });
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    const sectionIds = [
      ["checkout-order-summary", "order_summary"],
      ["checkout-order-summary-desktop", "order_summary"],
      ["checkout-express", "express_checkout"],
      ["checkout-contact", "contact"],
      ["checkout-delivery", "delivery"],
      ["checkout-shipping", "shipping"],
      ["checkout-payment", "payment"],
      ["checkout-billing", "billing_address"],
    ] as const;

    const sectionEnteredAt = new Map<string, number>();
    const sectionTotalTime = new Map<string, number>();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = sectionIds.find(([id]) => id === entry.target.id)?.[1];
          if (!section) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            lastCheckoutSection.current = section;
            if (!viewedCheckoutSections.current.has(section)) {
              viewedCheckoutSections.current.add(section);
              pushCheckoutBehaviorEvent("checkout_section_view", {
                section_name: section,
                visibility_ratio: Number(entry.intersectionRatio.toFixed(2)),
              });
            }
            if (!sectionEnteredAt.has(section)) sectionEnteredAt.set(section, Date.now());
          } else if (sectionEnteredAt.has(section)) {
            const seconds = Math.max(0, Math.round((Date.now() - sectionEnteredAt.get(section)!) / 1000));
            sectionTotalTime.set(section, (sectionTotalTime.get(section) ?? 0) + seconds);
            sectionEnteredAt.delete(section);
            if (seconds > 0) {
              pushCheckoutBehaviorEvent("checkout_section_time", {
                section_name: section,
                visible_seconds: seconds,
              });
            }
          }
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );

    sectionIds.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });

    const form = document.querySelector<HTMLFormElement>("#infibetter-checkout-form");
    const getFieldSection = (fieldName: string) => {
      if (fieldName.startsWith("billing_")) return "billing_address";
      if (["email"].includes(fieldName)) return "contact";
      if (["first_name", "last_name", "address", "address_line_2", "city", "state", "postal_code", "phone"].includes(fieldName)) return "delivery";
      return "other";
    };

    const handleFieldFocus = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
      const fieldName = target.name;
      if (!fieldName || focusedCheckoutFields.current.has(fieldName)) return;
      focusedCheckoutFields.current.add(fieldName);
      pushCheckoutBehaviorEvent("checkout_field_focus", {
        field_name: fieldName,
        form_section: getFieldSection(fieldName),
      });
    };

    const handleFieldInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
      const fieldName = target.name;
      if (!fieldName || editedCheckoutFields.current.has(fieldName)) return;
      editedCheckoutFields.current.add(fieldName);
      pushCheckoutBehaviorEvent("checkout_field_interaction", {
        field_name: fieldName,
        form_section: getFieldSection(fieldName),
      });
    };

    const handleFieldBlur = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
      if (!target.name) return;
      // Record only validity state, never the field value.
      pushCheckoutBehaviorEvent("checkout_field_validation", {
        field_name: target.name,
        form_section: getFieldSection(target.name),
        is_valid: target.checkValidity(),
        validation_reason: target.validity.valueMissing
          ? "required"
          : target.validity.typeMismatch
            ? "type_mismatch"
            : target.validity.patternMismatch
              ? "pattern_mismatch"
              : target.validity.tooShort
                ? "too_short"
                : target.validity.tooLong
                  ? "too_long"
                  : "other",
      });
    };

    const handleCheckoutClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest("button, [role='button'], label");
      if (!control) return;
      const text = (control.textContent ?? "").replace(/\\s+/g, " ").trim().slice(0, 70);
      if (!text) return;
      const lower = text.toLowerCase();

      let actionCategory = "other";
      if (/apply|discount|gift card|coupon/.test(lower)) actionCategory = "discount";
      else if (/shipping|delivery|standard|express/.test(lower)) actionCategory = "shipping";
      else if (/same as shipping|different billing|billing address/.test(lower)) actionCategory = "billing_address";
      else if (/remove|delete|\bminus\b|\bplus\b|quantity/.test(lower)) actionCategory = "cart";
      else if (/sign in|login/.test(lower)) actionCategory = "account";

      pushCheckoutBehaviorEvent("checkout_ui_interaction", {
        action_category: actionCategory,
        control_text: text,
      });
    };

    form?.addEventListener("focusin", handleFieldFocus, true);
    form?.addEventListener("input", handleFieldInput, true);
    form?.addEventListener("change", handleFieldInput, true);
    form?.addEventListener("focusout", handleFieldBlur, true);
    document.addEventListener("click", handleCheckoutClick, true);

    const handlePageHide = () => {
      if (checkoutExitSent.current || checkoutCompleted.current) return;
      checkoutExitSent.current = true;
      pushCheckoutBehaviorEvent("checkout_page_exit", {
        max_scroll_depth: maxScrollDepth.current,
        last_section_viewed: lastCheckoutSection.current,
        sections_viewed: Array.from(viewedCheckoutSections.current),
        fields_focused_count: focusedCheckoutFields.current.size,
        fields_interacted_count: editedCheckoutFields.current.size,
        section_time_seconds: Object.fromEntries(
          Array.from(sectionTotalTime.entries()),
        ),
        elapsed_seconds: Math.max(
          0,
          Math.round((performance.now() - checkoutStartedAt.current) / 1000),
        ),
        last_payment_flow: lastPaymentAttempt.current?.flow ?? "none",
        last_payment_type: lastPaymentAttempt.current?.paymentType ?? "none",
      });
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      sectionObserver.disconnect();
      form?.removeEventListener("focusin", handleFieldFocus, true);
      form?.removeEventListener("input", handleFieldInput, true);
      form?.removeEventListener("change", handleFieldInput, true);
      form?.removeEventListener("focusout", handleFieldBlur, true);
      document.removeEventListener("click", handleCheckoutClick, true);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  // Meta Pixel: fire InitiateCheckout once per checkout-page visit.
  useEffect(() => {
    if (!legalModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLegalModalOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [legalModalOpen]);

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

  function validateStandardCheckout(): boolean {
    setShowValidationErrors(true);

    const form = document.querySelector<HTMLFormElement>("form");
    if (!form) {
      toast.error("Checkout form not found.");
      return false;
    }

    const formData = new FormData(form);
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();
    const requiredFields = [
      ["email", "Email"],
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["address", "Address"],
      ["city", "City"],
      ["state", "State"],
      ["postal_code", "ZIP code"],
      ["phone", "Phone number"],
    ] as const;

    let firstInvalid: HTMLInputElement | null = null;
    for (const [name] of requiredFields) {
      const field = form.elements.namedItem(name);
      if (!(field instanceof HTMLInputElement)) continue;
      const value = getValue(name);
      const invalid = !value || (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || (name === "phone" && (value.replace(/\D/g, "").length < 7 || value.replace(/\D/g, "").length > 15));
      field.setAttribute("aria-invalid", invalid ? "true" : "false");
      if (invalid) firstInvalid ??= field;
    }

    if (!billingSameAsShipping) {
      const billingRequired = [
        ["billing_address", "Billing address"],
        ["billing_city", "Billing city"],
        ["billing_state", "Billing state"],
        ["billing_postal_code", "Billing ZIP code"],
      ] as const;
      for (const [name] of billingRequired) {
        const field = form.elements.namedItem(name);
        if (!(field instanceof HTMLInputElement)) continue;
        const invalid = !getValue(name);
        field.setAttribute("aria-invalid", invalid ? "true" : "false");
        if (invalid) firstInvalid ??= field;
      }
    }

    if (firstInvalid) {
      const validationFieldNames = [
        ...requiredFields.map(([name]) => name),
        ...(!billingSameAsShipping
          ? ["billing_address", "billing_city", "billing_state", "billing_postal_code"]
          : []),
      ];
      const invalidFieldNames = validationFieldNames
        .map((name) => form.elements.namedItem(name))
        .filter((field): field is HTMLInputElement => field instanceof HTMLInputElement)
        .filter((field) => field.getAttribute("aria-invalid") === "true")
        .map((field) => field.name);

      pushCheckoutBehaviorEvent("checkout_validation_error", {
        checkout_flow: "standard",
        invalid_field_names: invalidFieldNames,
        billing_address_mode: billingSameAsShipping ? "same_as_shipping" : "different_billing",
      });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => firstInvalid?.focus(), 250);
      toast.error("Please complete the highlighted required fields.");
      return false;
    }
    pushCheckoutBehaviorEvent("checkout_validation_success", {
      checkout_flow: "standard",
      billing_address_mode: billingSameAsShipping ? "same_as_shipping" : "different_billing",
    });
    return true;
  }

  function buildPaypalCheckoutPayload(flow: CheckoutFlow) {
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
      address: [getValue("address"), getValue("address_line_2")].filter(Boolean).join(", "),
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
      checkout_flow: flow,
      country_code: countryCode,
      billing_same_as_shipping: billingSameAsShipping,
      billing: billingSameAsShipping
        ? null
        : {
            address: [getValue("billing_address"), getValue("billing_address_line_2")].filter(Boolean).join(", "),
            city: getValue("billing_city"),
            state: getValue("billing_state"),
            postal_code: getValue("billing_postal_code"),
            country_code: countryCode,
          },
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

    if (!checkout.items.length || checkout.items.some(
      (item) => !item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1
    )) {
      throw new Error("Your cart contains an invalid item.");
    }

    // The server recalculates prices and total from the database.
    // Do not send client-calculated amounts as payment authority.
    return checkout;
  }

  async function createPayPalOrder(
    paymentType: "PayPal" | "Card",
    flow: CheckoutFlow,
  ) {
    // Only the standard form-based checkout validates Contact/Delivery.
    // Express Checkout intentionally bypasses these fields.
    if (flow === "standard" && !validateStandardCheckout()) {
      throw new Error("Please complete the required checkout details.");
    }
    const checkout = buildPaypalCheckoutPayload(flow);
    pushCheckoutBehaviorEvent("checkout_payment_order_create_started", {
      checkout_flow: flow,
      payment_type: paymentType,
    });
    const { data, error } = await supabase.functions.invoke(
      "paypal-create-order",
      { body: { checkout, currency: "USD", checkout_flow: flow } },
    );

    if (error || !data?.success || !data?.orderId) {
      pushCheckoutBehaviorEvent("checkout_payment_order_create_failed", {
        checkout_flow: flow,
        payment_type: paymentType,
        error_category: error ? "function_error" : "provider_or_validation_error",
      });
      console.error("PAYPAL CREATE ORDER ERROR", { error, data });
      throw new Error(
        data?.error ?? "Unable to create the PayPal order.",
      );
    }

    const paypalOrderId = String(data.orderId);
    pushCheckoutBehaviorEvent("checkout_payment_order_created", {
      checkout_flow: flow,
      payment_type: paymentType,
    });
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
    const paymentAttempt = lastPaymentAttempt.current;
    pushCheckoutBehaviorEvent("checkout_payment_approved", {
      checkout_flow: paymentAttempt?.flow ?? "unknown",
      payment_type: paymentAttempt?.paymentType ?? "unknown",
    });
    try {
      const form = document.querySelector("form");
      if (!form) throw new Error("Checkout form not found.");
      const formData = new FormData(form);
      const getValue = (name: string) => String(formData.get(name) ?? "").trim();
      const checkout = {
        full_name: getValue("full_name"),
        email: getValue("email"),
        phone: getValue("phone"),
        address: [getValue("address"), getValue("address_line_2")].filter(Boolean).join(", "),
        city: `${getValue("city")}, ${country.name}`,
        district: getValue("state"),
        ward: getValue("postal_code"),
        notes: `Shipping: ${country.name} / ${country.zone} / ${shippingMethod} | Estimated delivery: ${deliveryRange}${billingSameAsShipping ? " | Billing: same as shipping" : ` | Billing: ${[getValue("billing_address_desktop") || getValue("billing_address"), getValue("billing_address_line_2_desktop") || getValue("billing_address_line_2"), getValue("billing_city_desktop") || getValue("billing_city"), getValue("billing_state_desktop") || getValue("billing_state"), getValue("billing_postal_code_desktop") || getValue("billing_postal_code")].filter(Boolean).join(", ")}`} | PayPal Order ID: ${orderID}`,
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

      const { data, error } = await supabase.functions.invoke(
        "paypal-capture-order",
        { body: { orderId: orderID } },
      );
      if (error || !data?.success || !data?.dbOrderId) {
        pushCheckoutBehaviorEvent("checkout_payment_capture_failed", {
          checkout_flow: paymentAttempt?.flow ?? "unknown",
          payment_type: paymentAttempt?.paymentType ?? "unknown",
        });
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

      pushCheckoutBehaviorEvent("checkout_payment_completed", {
        checkout_flow: paymentAttempt?.flow ?? "unknown",
        payment_type: paymentAttempt?.paymentType ?? "unknown",
        payment_status: data.paymentStatus ?? "unknown",
      });
      checkoutCompleted.current = true;

      localStorage.setItem("infibetter_last_order", JSON.stringify({
        id: data.dbOrderId,
        created_at: new Date().toISOString(),
        full_name: data.customer?.full_name ?? checkout.full_name,
        phone: data.customer?.phone ?? checkout.phone,
        email: data.customer?.email ?? checkout.email,
        address: data.delivery?.address ?? checkout.address,
        city: data.delivery?.city ?? checkout.city,
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
    <div className="min-h-screen bg-white text-[#111] [&_button]:font-[inherit] [&_input]:font-[inherit] [&_select]:font-[inherit] [&_textarea]:font-[inherit]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}> 
      <main className="mx-auto w-full max-w-[1120px] px-4 py-5 sm:px-5 lg:px-8 lg:py-0">
        <PayPalScriptProvider options={PAYPAL_OPTIONS}>
          <form
            id="infibetter-checkout-form"
            onSubmit={handleSubmit}
            data-validation-visible={showValidationErrors ? "true" : "false"}
            className="grid items-start gap-7 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-0 [&[data-validation-visible=true]_input:required:invalid]:border-red-500 [&[data-validation-visible=true]_input:required:invalid]:ring-1 [&[data-validation-visible=true]_input:required:invalid]:ring-red-500"
          >
          <div className="contents lg:block lg:space-y-0 lg:py-7 lg:pr-10">
            <div className="mx-auto w-full max-w-[500px]">
            {/* Mobile order summary + express checkout */}
            <section id="checkout-order-summary" className="mb-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-[#fafafa] lg:hidden">
              <button
                type="button"
                onClick={() => setOrderSummaryOpen((open) => !open)}
                aria-expanded={orderSummaryOpen}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  Order summary
                  <ChevronDown className={`h-4 w-4 transition-transform ${orderSummaryOpen ? "rotate-180" : ""}`} />
                </span>
                <span className="text-sm font-semibold tabular-nums">{usd(totalUsd)}</span>
              </button>
              {orderSummaryOpen && (
                <div className="border-t border-[#e8e8e8] px-3 py-3">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={[
                        item.id,
                        item.productColorId ?? "default-color",
                        item.variantId ?? "default-variant",
                        item.deviceModelId ?? "default-device",
                        item.plugType ?? "default-plug",
                      ].join("-")} className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[#e8e8e8] bg-white">
                          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-medium">{item.name}</p>
                          <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                            {[
                              item.colorName ? `Color: ${item.colorName}` : null,
                              item.deviceModelName ? `Model: ${item.deviceModelName}` : null,
                              item.plugType ? `Plug type: ${item.plugType}` : null,
                            ].filter(Boolean).join(" / ")}
                          </p>
                          <p className="mt-0.5 text-[11px] text-neutral-500">Qty {item.quantity}</p>
                        </div>
                        <span className="text-xs font-medium tabular-nums">{usd(Number(item.price) * Number(item.quantity))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 border-t border-[#e8e8e8] pt-3 text-xs">
                    <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{usd(subtotalUsd)}</span></div>
                    {(discountAmountUsd + customerDiscountUsd) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−{usd(discountAmountUsd + customerDiscountUsd)}</span></div>}
                    <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{netShippingUsd <= 0 ? "FREE" : usd(netShippingUsd)}</span></div>
                    <div className="flex justify-between border-t border-[#e8e8e8] pt-2 text-sm font-semibold"><span>Total</span><span>{usd(totalUsd)}</span></div>
                  </div>
                </div>
              )}
            </section>

            <section id="checkout-express" className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-[-0.01em]">Express Checkout</h2>
                <img
                  src="/payment-methods/all%20card.png"
                  alt="Accepted payment cards: Visa, Mastercard, American Express and UnionPay"
                  className="h-[34px] w-auto max-w-[150px] object-contain"
                  loading="eager"
                />
              </div>
              <div className="grid grid-cols-1 items-stretch gap-2">
                <div className="w-full min-w-0 rounded-lg">
                  <PayPalButtons
                    fundingSource={FUNDING.PAYPAL}
                    disabled={submitting}
                    style={{ layout: "vertical", shape: "rect", color: "gold", label: "paypal", height: 46, disableMaxWidth: true }}
                    onClick={async (_data, actions) => {
                      trackCheckoutPaymentClick("express", "PayPal");
                      return actions.resolve();
                    }}
                    createOrder={async () => createPayPalOrder("PayPal", "express")}
                    onApprove={async (data) => { await handlePaypalApprove(data.orderID); }}
                    onCancel={() => {
                      pushCheckoutBehaviorEvent("checkout_payment_cancelled", { checkout_flow: "express", payment_type: "PayPal" });
                      toast.info("PayPal checkout was cancelled.");
                    }}
                    onError={(error) => {
                      pushCheckoutBehaviorEvent("checkout_payment_error", { checkout_flow: "express", payment_type: "PayPal" });
                      console.error("PAYPAL EXPRESS ERROR", error);
                      toast.error("PayPal could not complete the payment.");
                    }}
                  />
                </div>
                <div className="w-full min-w-0 rounded-lg">
                  <PayPalButtons
                    fundingSource={FUNDING.CARD}
                    disabled={submitting}
                    style={{ layout: "vertical", shape: "rect", label: "pay", height: 46, tagline: false, disableMaxWidth: true }}
                    onClick={async (_data, actions) => {
                      trackCheckoutPaymentClick("express", "Card");
                      return actions.resolve();
                    }}
                    createOrder={async () => createPayPalOrder("Card", "express")}
                    onApprove={async (data) => { await handlePaypalApprove(data.orderID); }}
                    onCancel={() => {
                      pushCheckoutBehaviorEvent("checkout_payment_cancelled", { checkout_flow: "express", payment_type: "Card" });
                      toast.info("Card checkout was cancelled.");
                    }}
                    onError={(error) => {
                      pushCheckoutBehaviorEvent("checkout_payment_error", { checkout_flow: "express", payment_type: "Card" });
                      console.error("CARD EXPRESS ERROR", error);
                      toast.error("Card payment could not be completed.");
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 mb-0 flex items-center gap-3 text-[11px] text-neutral-400">
                <span className="h-px flex-1 bg-[#e5e5e5]" />
                <span>OR</span>
                <span className="h-px flex-1 bg-[#e5e5e5]" />
              </div>
            </section>

            <section id="checkout-contact" className="border-b border-[#e8e8e8] pb-5 pt-1 sm:py-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Contact</h2>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    aria-required="true"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="h-12 w-full rounded-xl border border-[#d8d8d8] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#777] focus:border-[#777] focus:ring-0"
                  />
                </label>


              </div>
            </section>

            <section id="checkout-delivery" className="border-b border-[#e8e8e8] py-5 sm:py-6">
              <h2 className="mb-4 text-[18px] font-semibold tracking-[-0.02em]">Delivery</h2>

              <div className="space-y-2.5">
                <CountryDropdown
                  name="country"
                  value={countryCode}
                  onChange={(value) => {
                    setCountryCode(value);
                    setShippingMethod("standard");
                  }}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className="sr-only">First name</span>
                    <input
                      name="first_name"
                      type="text"
                      required
                      aria-required="true"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setFullName([e.target.value, lastName].filter(Boolean).join(" "));
                      }}
                      onBlur={trackCheckoutNameEntered}
                      placeholder="First name"
                      className="h-12 w-full rounded-xl border border-[#d8d8d8] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#777] focus:border-[#777] focus:ring-0"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Last name</span>
                    <input
                      name="last_name"
                      type="text"
                      required
                      aria-required="true"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setFullName([firstName, e.target.value].filter(Boolean).join(" "));
                      }}
                      onBlur={trackCheckoutNameEntered}
                      placeholder="Last name"
                      className="h-12 w-full rounded-xl border border-[#d8d8d8] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#777] focus:border-[#777] focus:ring-0"
                    />
                  </label>
                </div>
                <input type="hidden" name="full_name" value={fullName} />

                <Field
                  name="address"
                  label="Address"
                  required
                  placeholder="Address"
                  onValueChange={setShippingAddress}
                />

                <Field
                  name="address_line_2"
                  label="Apartment, suite, etc. (optional)"
                  placeholder="Apartment, suite, etc. (optional)"
                />

                <div className="grid grid-cols-3 gap-2.5">
                  <Field name="city" label="City" placeholder="City" required onValueChange={setShippingCity} />
                  <Field name="state" label="State" placeholder="State" required />
                  <Field name="postal_code" label="ZIP code" placeholder="ZIP code" required onValueChange={setShippingPostalCode} />
                </div>

                <PhoneField
                  country={country}
                  value={phone}
                  onChange={setPhone}
                  showValidationErrors={showValidationErrors}
                />
              </div>
            </section>

            <section id="checkout-shipping" className="border-b border-[#e8e8e8] py-5 first:pt-2 sm:py-6">
              {hasShippingAddress ? (
                <>
                  <SectionTitle
                    eyebrow="3"
                    title="Shipping"
                    description={`Shipping rates for ${country.name}`}
                  />

                  <div className="mt-4 overflow-hidden rounded-md border border-[#dedede]">
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
                </>
              ) : (
                <>
                  <h2 className="text-[16px] font-semibold leading-5 tracking-[-0.02em] sm:text-[18px] sm:leading-6">
                    Shipping method
                  </h2>
                  <div className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#f5f5f5] px-4 py-3 text-center text-[13px] text-[#777777]">
                    Enter your shipping address to view available shipping methods.
                  </div>
                </>
              )}
            </section>

            {/* PAYMENT */}
            <section id="checkout-payment" className="order-20 box-border w-full min-w-0 border-b border-[#e5e7eb] bg-white py-5 sm:py-6 lg:order-none">
              <div className="px-3 pb-3 sm:px-5 sm:pb-4">
                <h2 className="text-[16px] font-semibold leading-5 tracking-[-0.02em] sm:text-[18px] sm:leading-6">
                  Payment
                </h2>
                <p className="mt-1 text-[11px] font-normal leading-4 text-[#6B7280] sm:text-xs">
                  All transactions are secure and encrypted.
                </p>
              </div>

              <div className="px-3 sm:px-4">
                <div className="w-full min-w-0 rounded-lg border border-[#d7d7d7] bg-white">
                  {/* Credit / debit card option */}
                  <div className={paymentMethod === "card" ? "border-b border-[#d7d7d7] bg-white" : "border-b border-[#d7d7d7] bg-white"}>
                    <button
                      type="button"
                      aria-expanded={paymentMethod === "card"}
                      onClick={() => {
                        setPaymentMethod("card");
                        pushCheckoutBehaviorEvent("checkout_payment_method_selected", {
                          payment_type: "Card",
                          payment_location: "payment_section",
                        });
                      }}
                      className="flex min-h-[68px] w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span aria-hidden="true" className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${paymentMethod === "card" ? "border-[#303030]" : "border-[#b8b8b8]"}`}>
                          {paymentMethod === "card" && <span className="h-[9px] w-[9px] rounded-full bg-[#303030]" />}
                        </span>
                        <span className="text-[13px] font-semibold text-[#242424]">Credit / Debit Card</span>
                      </span>
                      <img
                        src="/payment-methods/all%20card.png"
                        alt="Accepted cards: Visa, Mastercard, American Express and UnionPay"
                        className="h-[42px] w-auto max-w-[190px] shrink-0 object-contain"
                        loading="eager"
                      />
                    </button>
                    {paymentMethod === "card" && (
                      <div className="w-full min-w-0 px-3 pb-4 sm:px-4">
                        <div className="w-full min-w-0 max-w-full [&>div]:!w-full [&_iframe]:!w-full">
                          <PayPalButtons
                            fundingSource={FUNDING.CARD}
                            disabled={submitting}
                            style={{ layout: "vertical", shape: "rect", label: "pay", height: 44 }}
                            onClick={async (_data, actions) => {
                              trackCheckoutPaymentClick("standard", "Card");
                              return validateStandardCheckout() ? actions.resolve() : actions.reject();
                            }}
                            createOrder={async () => createPayPalOrder("Card", "standard")}
                            onApprove={async (data) => { await handlePaypalApprove(data.orderID); }}
                            onCancel={() => toast.info("Card checkout was cancelled.")}
                            onError={(error) => {
                              console.error("PAYPAL CARD BUTTON ERROR", error);
                              toast.error("Card payment could not be completed.");
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PayPal option */}
                  <div className="bg-white">
                    <button
                      type="button"
                      aria-expanded={paymentMethod === "paypal"}
                      onClick={() => {
                        setPaymentMethod("paypal");
                        pushCheckoutBehaviorEvent("checkout_payment_method_selected", {
                          payment_type: "PayPal",
                          payment_location: "payment_section",
                        });
                      }}
                      className={`flex min-h-[58px] w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4 ${paymentMethod === "paypal" ? "bg-[#f7f7f7]" : "bg-white"}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span aria-hidden="true" className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${paymentMethod === "paypal" ? "border-[#303030]" : "border-[#b8b8b8]"}`}>
                          {paymentMethod === "paypal" && <span className="h-[9px] w-[9px] rounded-full bg-[#303030]" />}
                        </span>
                        <span className="text-[13px] font-semibold text-[#242424]">PayPal</span>
                      </span>
                      <span className="shrink-0 text-[17px] font-bold italic tracking-[-0.06em] text-[#003087]">Pay<span className="text-[#009cde]">Pal</span></span>
                    </button>
                    {paymentMethod === "paypal" && (
                      <div className="border-t border-[#d7d7d7] bg-white px-3 py-3 sm:px-4">
                        <p className="text-center text-[12px] leading-5 text-[#555]">You'll be redirected to PayPal to complete your purchase.</p>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </section>

            {/* BILLING ADDRESS */}
            <section id="checkout-billing" className="border-b border-[#e5e7eb] py-5 sm:py-6">
              <div className="px-3 sm:px-4">
                <h2 className="mb-4 text-[16px] font-semibold leading-5 tracking-[-0.02em] sm:text-[18px] sm:leading-6">Billing address</h2>
                <div className="overflow-hidden rounded-lg border border-[#d7d7d7]">
                  <label className={`flex min-h-[54px] cursor-pointer items-center gap-3 px-3 py-3 sm:px-4 ${billingSameAsShipping ? "bg-[#f7f7f7]" : "bg-white"}`}>
                    <input type="radio" name="billing_address_choice" checked={billingSameAsShipping} onChange={() => {
                      setBillingSameAsShipping(true);
                      pushCheckoutBehaviorEvent("checkout_billing_address_mode", { billing_address_mode: "same_as_shipping" });
                    }} className="h-4 w-4 accent-[#303030]" />
                    <span className="text-[13px] font-medium text-[#292929]">Same as shipping address</span>
                  </label>
                  <div className="border-t border-[#d7d7d7]" />
                  <label className={`flex min-h-[54px] cursor-pointer items-center gap-3 px-3 py-3 sm:px-4 ${!billingSameAsShipping ? "bg-[#f7f7f7]" : "bg-white"}`}>
                    <input type="radio" name="billing_address_choice" checked={!billingSameAsShipping} onChange={() => {
                      setBillingSameAsShipping(false);
                      pushCheckoutBehaviorEvent("checkout_billing_address_mode", { billing_address_mode: "different_billing" });
                    }} className="h-4 w-4 accent-[#303030]" />
                    <span className="text-[13px] font-medium text-[#292929]">Use a different billing address</span>
                  </label>
                  {!billingSameAsShipping && (
                    <div className="space-y-2.5 border-t border-[#d7d7d7] bg-white p-3 sm:p-4">
                      <input name="billing_address" type="text" required aria-required="true" autoComplete="billing street-address" placeholder="Address" className="h-12 w-full rounded-lg border border-[#d8d8d8] px-3 text-[13px] outline-none focus:border-[#777]" />
                      <input name="billing_address_line_2" type="text" autoComplete="billing address-line2" placeholder="Apartment, suite, etc. (optional)" className="h-12 w-full rounded-lg border border-[#d8d8d8] px-3 text-[13px] outline-none focus:border-[#777]" />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input name="billing_city" type="text" required aria-required="true" autoComplete="billing address-level2" placeholder="City" className="h-12 min-w-0 rounded-lg border border-[#d8d8d8] px-3 text-[13px] outline-none focus:border-[#777]" />
                        <input name="billing_state" type="text" required aria-required="true" autoComplete="billing address-level1" placeholder="State" className="h-12 min-w-0 rounded-lg border border-[#d8d8d8] px-3 text-[13px] outline-none focus:border-[#777]" />
                      </div>
                      <input name="billing_postal_code" type="text" required aria-required="true" autoComplete="billing postal-code" placeholder="ZIP code" className="h-12 w-full rounded-lg border border-[#d8d8d8] px-3 text-[13px] outline-none focus:border-[#777]" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Desktop PayPal action: directly below Billing address in the left column */}
            <div className="mt-5 hidden w-full min-w-0 overflow-hidden lg:block">
              <PayPalButtons
                fundingSource={FUNDING.PAYPAL}
                disabled={submitting}
                style={{
                  layout: "vertical",
                  shape: "rect",
                  color: "blue",
                  label: "pay",
                  height: 48,
                }}
                onClick={async (_data, actions) => {
                  trackCheckoutPaymentClick("standard", "PayPal");
                  return validateStandardCheckout() ? actions.resolve() : actions.reject();
                }}
                createOrder={async () => createPayPalOrder("PayPal", "standard")}
                onApprove={async (data) => {
                  await handlePaypalApprove(data.orderID);
                }}
                onCancel={() => {
                  pushCheckoutBehaviorEvent("checkout_payment_cancelled", { checkout_flow: "standard", payment_type: "PayPal" });
                  toast.info("PayPal checkout was cancelled.");
                }}
                onError={(error) => {
                  pushCheckoutBehaviorEvent("checkout_payment_error", { checkout_flow: "standard", payment_type: "PayPal" });
                  console.error("PAYPAL BUTTON ERROR", error);
                  toast.error("PayPal could not complete the payment.");
                }}
              />
            </div>
            <div className="mt-3 hidden w-full lg:block">
              <button
                type="button"
                onClick={() => setLegalModalOpen(true)}
                className="text-xs font-medium text-neutral-500 underline underline-offset-2 transition hover:text-[#111]"
              >
                Terms and policies
              </button>
            </div>

            {/* Mobile bottom order summary with final payment action */}
            <section className="mt-6 pt-5 lg:hidden">
              <button
                type="button"
                onClick={() => setBottomOrderSummaryOpen((open) => !open)}
                aria-expanded={bottomOrderSummaryOpen}
                aria-label={bottomOrderSummaryOpen ? "Collapse bottom order summary" : "Expand bottom order summary"}
                className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
              >
                <span className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
                  Order summary
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${bottomOrderSummaryOpen ? "rotate-180" : "rotate-0"}`} />
                </span>
                <span className="text-[15px] font-semibold tabular-nums">{usd(totalUsd)}</span>
              </button>

              {bottomOrderSummaryOpen && (<>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={[item.id, item.productColorId ?? "default-color", item.variantId ?? "default-variant", item.deviceModelId ?? "default-device", item.plugType ?? "default-plug"].join("-")} className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#e8e8e8] bg-white">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#111] px-1 text-[10px] font-semibold text-white">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[12px] font-medium leading-4">{item.name}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">{[
                        item.colorName ? `Color: ${item.colorName}` : null,
                        item.deviceModelName ? `Model: ${item.deviceModelName}` : null,
                        item.plugType ? `Plug type: ${item.plugType}` : null,
                      ].filter(Boolean).join(" / ")}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium tabular-nums">{usd(Number(item.price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <CheckoutVoucher subtotal={subtotalUsd} shippingFee={shippingFeeUsd} phone={phone} cartItems={items} onChange={setVoucherSummary} />
              </div>

              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="tabular-nums">{usd(subtotalUsd)}</span></div>
                {(discountAmountUsd + customerDiscountUsd) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span className="tabular-nums">−{usd(discountAmountUsd + customerDiscountUsd)}</span></div>}
                <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span className={netShippingUsd <= 0 ? "font-medium text-emerald-600" : "tabular-nums"}>{netShippingUsd <= 0 ? "FREE" : usd(netShippingUsd)}</span></div>
                <div className="flex items-end justify-between border-t border-[#e8e8e8] pt-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-semibold tabular-nums">{usd(totalUsd)}</span>
                </div>
                <p className="-mt-1 text-right text-[10px] text-neutral-500">USD</p>
              </div>

              </>)}

              <div className="mt-4 w-full min-w-0 overflow-hidden">
                <PayPalButtons
                  fundingSource={FUNDING.PAYPAL}
                  disabled={submitting}
                  style={{ layout: "vertical", shape: "rect", color: "blue", label: "pay", height: 48 }}
                  onClick={async (_data, actions) => {
                    trackCheckoutPaymentClick("standard", "PayPal");
                    return validateStandardCheckout() ? actions.resolve() : actions.reject();
                  }}
                  createOrder={async () => createPayPalOrder("PayPal", "standard")}
                  onApprove={async (data) => { await handlePaypalApprove(data.orderID); }}
                  onCancel={() => {
                    pushCheckoutBehaviorEvent("checkout_payment_cancelled", { checkout_flow: "standard", payment_type: "PayPal", payment_location: "mobile_bottom_summary" });
                    toast.info("PayPal checkout was cancelled.");
                  }}
                  onError={(error) => {
                    pushCheckoutBehaviorEvent("checkout_payment_error", { checkout_flow: "standard", payment_type: "PayPal", payment_location: "mobile_bottom_summary" });
                    console.error("PAYPAL MOBILE SUMMARY ERROR", error);
                    toast.error("PayPal could not complete the payment.");
                  }}
                />
              </div>
              <div className="mt-3">
                <button type="button" onClick={() => setLegalModalOpen(true)} className="text-xs font-medium text-neutral-500 underline underline-offset-2 transition hover:text-[#111]">Terms and policies</button>
              </div>

              {hasCompleteDeliveryDetails && (
                <div className="mt-7 grid grid-cols-3 items-center gap-2 px-1 py-3 text-center">
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <RotateCcw className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[11px] font-semibold leading-4 text-[#111] sm:text-xs">30 Day Returns</span>
                  </div>
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <ShieldCheck className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[11px] font-semibold leading-4 text-[#111] sm:text-xs">1 Year Warranty</span>
                  </div>
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <PackageCheck className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[11px] font-semibold leading-4 text-[#111] sm:text-xs">Fast Shipping</span>
                  </div>
                </div>
              )}
            </section>

            </div>
          </div>

          <aside className="relative hidden min-w-0 lg:block lg:self-stretch lg:bg-transparent lg:px-7 lg:py-8 lg:before:absolute lg:before:top-0 lg:before:bottom-[-160px] lg:before:left-0 lg:before:right-[calc((1120px-100vw)/2-2rem)] lg:before:bg-[#f6f6f6] lg:before:content-['']">
            <div className="relative z-10 order-10 bg-transparent py-5 sm:py-6 lg:sticky lg:top-[120px] lg:order-none lg:py-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">
                  Order summary
                </h2>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-neutral-500 lg:inline">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrderSummaryOpen((open) => !open)}
                    aria-label={orderSummaryOpen ? "Collapse order summary" : "Expand order summary"}
                    aria-expanded={orderSummaryOpen}
                    className="grid h-8 w-8 place-items-center rounded-full text-neutral-700 transition hover:bg-black/5 lg:hidden"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        orderSummaryOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div id="checkout-order-summary-desktop" className={`${orderSummaryOpen ? "block" : "hidden"} mt-5 lg:block`}>
              <div className="space-y-4 border-b border-[#e8e8e8] pb-5">
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

                {(discountAmountUsd + customerDiscountUsd) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>−{usd(discountAmountUsd + customerDiscountUsd)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span
                    className={
                      netShippingUsd <= 0
                        ? "font-medium text-emerald-600"
                        : ""
                    }
                  >
                    {netShippingUsd <= 0 ? "FREE" : usd(netShippingUsd)}
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

              {hasCompleteDeliveryDetails && (
                <div className="mt-8 grid grid-cols-3 items-center gap-2 px-3 py-4 text-center">
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <RotateCcw className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[12px] font-semibold leading-4 text-[#111]">30 Day Returns</span>
                  </div>
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <ShieldCheck className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[12px] font-semibold leading-4 text-[#111]">1 Year Warranty</span>
                  </div>
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <PackageCheck className="h-7 w-7 text-[#111]" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[12px] font-semibold leading-4 text-[#111]">Fast Shipping</span>
                  </div>
                </div>
              )}
            </div>

          </aside>
          </form>
        </PayPalScriptProvider>
      </main>

      {legalModalOpen && (
        <TermsPoliciesModal
          document={legalDocument}
          onDocumentChange={setLegalDocument}
          onClose={() => setLegalModalOpen(false)}
        />
      )}
    </div>
  );
}


type LegalDocumentKey =
  | "refund"
  | "shipping"
  | "privacy"
  | "terms"
  | "legal"
  | "cancellations"
  | "contact";

function TermsPoliciesModal({
  document,
  onDocumentChange,
  onClose,
}: {
  document: LegalDocumentKey;
  onDocumentChange: (value: LegalDocumentKey) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-policies-title"
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4 sm:px-6">
          <h2
            id="terms-policies-title"
            className="text-[19px] font-semibold tracking-[-0.025em] text-[#171717]"
          >
            Terms and policies
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and policies"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-neutral-500">
              Policy
            </span>
            <select
              value={document}
              onChange={(event) =>
                onDocumentChange(event.target.value as LegalDocumentKey)
              }
              className="h-[50px] w-full rounded-xl border border-[#bdbdbd] bg-white px-3 text-sm text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.18)] outline-none focus:border-[#777] focus:ring-1 focus:ring-[#777]"
            >
              <option value="refund">Refund policy</option>
              <option value="shipping">Shipping</option>
              <option value="privacy">Privacy policy</option>
              <option value="terms">Terms of service</option>
              <option value="contact">Contact</option>
            </select>
          </label>

          <div className="pt-4">
            <LegalDocumentContent document={document} />
          </div>
        </div>
      </section>
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
  const mailto = "mailto:support@infibetter.com";

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
          <li>Email <a className={linkClass} href={mailto}>Support@infibetter.com</a>.</li>
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
          Contact us at <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
          For assistance, email <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
          <li><strong>Privacy requests:</strong> Email <a className={linkClass} href={mailto}>Support@infibetter.com</a> with the subject line <strong>Privacy Request</strong>.</li>
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a> with
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a> with
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
          <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
        <a className={linkClass} href={mailto}>Support@infibetter.com</a>
      </p>

      <h3 className={headingClass}>Customer support</h3>
      <p className={paragraphClass}>
        For assistance with an order, delivery, return, or product, email{" "}
        <a className={linkClass} href={mailto}>Support@infibetter.com</a>.
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
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  required,
  placeholder,
  type = "text",
  onValueChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">
        {label}{required ? " (required)" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        aria-required={required ? "true" : undefined}
        placeholder={placeholder}
        onChange={(event) => onValueChange?.(event.target.value)}
        autoComplete={
          name === "address" ? "address-line1" :
          name === "address_line_2" ? "address-line2" :
          name === "city" ? "address-level2" :
          name === "state" ? "address-level1" :
          name === "postal_code" ? "postal-code" : undefined
        }
        inputMode={type === "tel" ? "tel" : undefined}
        className="h-12 w-full rounded-xl border border-[#d8d8d8] bg-white px-3 text-[13px] outline-none transition placeholder:text-[#777] focus:border-[#777] focus:ring-0"
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
        className="flex h-12 w-full items-center justify-between rounded-xl border border-[#d8d8d8] bg-white px-3 text-left text-[13px] outline-none transition hover:border-[#bdbdbd] focus:border-[#777] focus:ring-0"
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
  showValidationErrors,
}: {
  country: CountryOption;
  value: string;
  onChange: (value: string) => void;
  showValidationErrors: boolean;
}) {
  const phoneDigits = value.replace(/\D/g, "");
  const phoneInvalid = phoneDigits.length < 7 || phoneDigits.length > 15;

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        Phone number
      </span>

      <div className={`flex h-12 overflow-hidden rounded-xl border bg-white transition focus-within:border-[#777] focus-within:ring-0 ${showValidationErrors && phoneInvalid ? "border-red-500 ring-1 ring-red-500" : "border-[#d8d8d8]"}`}>
        <input
          name="phone"
          type="tel"
          required
          aria-required="true"
          aria-invalid={showValidationErrors && phoneInvalid ? "true" : "false"}
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
    <section className="overflow-hidden rounded-lg border border-[#e2e2e2] bg-[#fafafa]">
      <div className="px-3 pt-2">
        <h3 className="text-[13px] font-semibold tracking-[-0.02em]">
          Your checkout offer
        </h3>
        <p className="mt-0.5 text-[10px] leading-3 text-neutral-500">
          Take an extra 15% off the sale price.
        </p>
      </div>

      {loading ? (
        <div className="mx-2.5 mt-2 animate-pulse rounded-md bg-white p-2">
          <div className="flex gap-2">
            <div className="h-12 w-12 shrink-0 rounded-md bg-neutral-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-2/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ) : product ? (
        <div className="mx-2.5 mt-2 rounded-md bg-white p-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#f3f3f3]">
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
              <h4 className="line-clamp-2 text-[11px] font-semibold leading-[14px]">
                {product.name}
              </h4>
              <div className="mt-0 flex items-center gap-1">
                <span className="text-[9px] tracking-[-1px] text-[#f5b800]">
                  ★★★★★
                </span>
                <span className="text-[9px] font-medium text-neutral-600">
                  4.9
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0">
                <span className="text-xs font-bold text-[#d71920]">
                  {usd(Number(product.price) * (1 - OFFER_DISCOUNT))}
                </span>
                <span className="text-[9px] text-neutral-400 line-through">
                  {usd(Number(product.price))}
                </span>
                <span className="rounded-full bg-[#eeeeee] px-1 py-0 text-[8px] font-semibold text-neutral-700">
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
              className="flex min-h-8 shrink-0 items-center justify-center rounded-md bg-[#0066E6] px-2 text-[9px] font-semibold text-white shadow-sm transition hover:bg-[#0057C7] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0066E6]/20 focus:ring-offset-1"
            >
              Add · {usd(Number(product.price) * (1 - OFFER_DISCOUNT))}
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-2.5 mt-2 rounded-md bg-white px-3 py-3 text-[11px] text-neutral-500">
          No additional offer is available right now.
        </div>
      )}

      <div className="flex items-center justify-between px-2.5 py-0">
        <button
          type="button"
          onClick={onPrevious}
          disabled={products.length < 2}
          aria-label="Previous offer"
          className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-800 disabled:opacity-30"
        >
          <span className="text-lg">‹</span>
        </button>
        <button
          type="button"
          onClick={onNoThanks}
          className="min-h-7 text-[10px] font-medium text-[#0066e6] underline underline-offset-2"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={products.length < 2}
          aria-label="Next offer"
          className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-800 disabled:opacity-30"
        >
          <span className="text-lg">›</span>
        </button>
      </div>
    </section>
  );
}
