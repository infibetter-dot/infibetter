import {
  createFileRoute,
  Link,
  notFound,
  useNavigate } from "@tanstack/react-router";

import { queryOptions,
  useQuery,
  useSuspenseQuery } from "@tanstack/react-query";

import { useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent } from "react";

import {

  ChevronDown,
  CircleHelp,
  BookOpen,
  SlidersHorizontal,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  ArrowUpRight,
  PackageCheck,
  BadgeCheck,
  Mail,
  Package,
  CreditCard,
  LockKeyhole,
  Headphones,
  RefreshCw,
  Sparkles,
  Lightbulb,
  BatteryCharging,
  Usb,
  Hand,
  Clock3,
  Leaf,
  Star,
  Palette,
  Award,
  Heart,
  Gift,
  House,
  LampDesk,
  Sofa,
  Users
} from "lucide-react";

// Keep this mapping in sync with the icon keys in admin ProductUSP.tsx.
// Retail renders the exact icon key saved in public.product_usps.icon.
const PRODUCT_USP_ICON_MAP = {
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  shield: ShieldCheck,
  truck: Truck,
  battery: BatteryCharging,
  usb: Usb,
  touch: Hand,
  clock: Clock3,
  leaf: Leaf,
  star: Star,
  palette: Palette,
  award: Award,
  heart: Heart,
  gift: Gift,
  home: House,
  lamp: LampDesk,
  sofa: Sofa,
};


import { toast } from "sonner";
import { trackProductInteraction } from "@/lib/analytics";

import { supabase } from "@/integrations/supabase/client";

import {

  getCurrency,

  subscribeToCurrencyChange,

  type CurrencyCode,

} from "@/lib/currency-system";

import { useCart } from "@/lib/cart";

import { getImageUrl } from "@/lib/storage";

import ProductReviews from "@/components/ProductReviews";

import { trackViewContent } from "@/lib/meta-pixel";

// Product prices in Supabase are USD. This page formats them locally so the

// product-detail price cannot be affected by a broken/stale shared formatter.

const PRODUCT_CURRENCY_RATES: Record<CurrencyCode, number> = {

  USD: 1,

  VND: 25500,

  CAD: 1.38,

  AUD: 1.52,

  EUR: 0.88,

  GBP: 0.75,

  SGD: 1.28,

};

const PRODUCT_CURRENCY_LOCALES: Record<CurrencyCode, string> = {

  USD: "en-US",

  VND: "vi-VN",

  CAD: "en-CA",

  AUD: "en-AU",

  EUR: "de-DE",

  GBP: "en-GB",

  SGD: "en-SG",

};

function formatProductPrice(

  value: number | string | null | undefined,

  currency: CurrencyCode,

): string {

  const usd = Number(value);

  const activeCurrency = PRODUCT_CURRENCY_RATES[currency] !== undefined

    ? currency

    : "USD";

  if (!Number.isFinite(usd)) {

    return new Intl.NumberFormat("en-US", {

      style: "currency",

      currency: "USD",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    }).format(0);

  }

  const converted = usd * PRODUCT_CURRENCY_RATES[activeCurrency];

  const fractionDigits = activeCurrency === "VND" ? 0 : 2;

  return new Intl.NumberFormat(PRODUCT_CURRENCY_LOCALES[activeCurrency], {

    style: "currency",

    currency: activeCurrency,

    minimumFractionDigits: fractionDigits,

    maximumFractionDigits: fractionDigits,

  }).format(converted);

}

const productOptions = (slug: string) =>

  queryOptions({

    queryKey: ["product", slug],

    queryFn: async () => {

      const { data, error } = await supabase

        .from("products")

        .select(`

          included_in_box,

          short_description,

          plug_type,

          id,

          slug,

          name,

          description,

          price,

          compare_at_price,

          stock,

          image_url,

          dimensions,

          material,

          color,

          light_source,

          power_source,

          warranty,

          seo_title,

          seo_description,

          category_id,

          product_images(

  id,

  image_url,

  sort_order,

  color_id,

  is_lifestyle,

  image_type

)

          product_colors(

            id,

            name,

            hex

          ),

          product_variants (

            id,

            device_model_id,

            color_id,

            price,

            compare_at_price,

            stock,

            image_url,

            sort_order,

            is_active

          ),

          product_specifications(

            id,

            label,

            value,

            sort_order

          ),

          product_usps(

            id,

            title,

            icon,

            sort_order

          ),

          product_faqs(

            id,

            question,

            answer,

            sort_order,

            is_visible

          )

        `)

        .eq("slug", slug)

        .maybeSingle();

      if (error) {

        console.error("PRODUCT QUERY ERROR:", error);

        throw new Error(error.message);

      }

      if (!data) {

        throw notFound();

      }

      // Load related product data explicitly. This avoids relying on nested

      // PostgREST relationships for colors and variants.

      const [

        specificationsResult,

        faqsResult,

        uspsResult,

        colorsResult,

        variantsResult,

      ] = await Promise.all([

        supabase.from("product_specifications")

          .select("id, label, value, sort_order")

          .eq("product_id", data.id)

          .order("sort_order", { ascending: true }),

        supabase.from("product_faqs")

          .select("id, question, answer, sort_order, is_visible")

          .eq("product_id", data.id)

          .order("sort_order", { ascending: true }),

        supabase.from("product_usps")

          .select("id, title, icon, sort_order")

          .eq("product_id", data.id)

          .order("sort_order", { ascending: true }),

        supabase.from("product_colors")

          .select("id, name, hex")

          .eq("product_id", data.id)

          .order("name", { ascending: true }),

        supabase.from("product_variants")

          .select("id, device_model_id, color_id, price, compare_at_price, stock, image_url, sort_order, is_active")

          .eq("product_id", data.id)

          .eq("is_active", true)

          .order("sort_order", { ascending: true }),

      ]);

      if (specificationsResult.error) console.error("PRODUCT SPECIFICATIONS QUERY ERROR:", specificationsResult.error);

      if (faqsResult.error) console.error("PRODUCT FAQS QUERY ERROR:", faqsResult.error);

      if (uspsResult.error) console.error("PRODUCT USPs QUERY ERROR:", uspsResult.error);

      if (colorsResult.error) console.error("PRODUCT COLORS QUERY ERROR:", colorsResult.error);

      if (variantsResult.error) console.error("PRODUCT VARIANTS QUERY ERROR:", variantsResult.error);

      const colors = colorsResult.data ?? [];

      const variants = variantsResult.data ?? [];

      const deviceModelIds = Array.from(

        new Set(

          variants

            .map((variant: any) => variant?.device_model_id)

            .filter(Boolean)

            .map((id: any) => String(id)),

        ),

      );

      let deviceModels: any[] = [];

      if (deviceModelIds.length > 0) {

        const { data: modelData, error: modelError } = await supabase

          .from("device_models")

          .select("id, name")

          .in("id", deviceModelIds);

        if (modelError) {

          console.error("DEVICE MODEL QUERY ERROR:", modelError);

        } else {

          deviceModels = modelData ?? [];

        }

      }

      const deviceModelMap = new Map(

        deviceModels.map((model: any) => [String(model.id), model.name]),

      );

      const variantsWithModels = variants.map((variant: any) => ({

        ...variant,

        device_model_name: deviceModelMap.get(String(variant.device_model_id)) ?? null,

      }));

      const relatedResult = await supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, image_url, stock, is_active, status")
        .eq("category_id", data.category_id!)
        .neq("id", data.id)
        .limit(30);

      if (relatedResult.error) {
        console.error("RELATED PRODUCTS QUERY ERROR:", relatedResult.error);
      }

      // Match Admin Products and Checkout visibility rules:
      // only active products that are not marked as hidden can be recommended.
      const visibleRelatedProducts = (relatedResult.data ?? [])
        .filter(
          (item: any) => item.is_active === true && item.status !== "hidden",
        )
        .slice(0, 4);

      return {
        product: {
          ...data,
          product_colors: colors,
          product_variants: variantsWithModels,
          product_specifications: specificationsResult.data ?? data.product_specifications ?? [],
          product_faqs: faqsResult.data ?? data.product_faqs ?? [],
          product_usps: uspsResult.data ?? data.product_usps ?? [],
        },
        related: visibleRelatedProducts,
      };

    },

  });

export const Route = createFileRoute("/products/$slug")({

  loader: ({ context, params }) =>

    context.queryClient.ensureQueryData(productOptions(params.slug)),

  component: ProductPage,

});

function ProductPage() {

  const { slug } = Route.useParams();

  const navigate = useNavigate();

  const cart = useCart();

  // INFIBETTER product prices are stored as USD in Supabase.

  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>

    getCurrency(),

  );

  const safeCurrency: CurrencyCode =

    currency || getCurrency() || "USD";

  useEffect(() => {

    return subscribeToCurrencyChange(setCurrencyState);

  }, []);

  const { data } = useSuspenseQuery(productOptions(slug));

  const { product, related } = data;
  const compatiblePlugTypes = String(product.plug_type ?? "")
    .split(",")
    .map((type: string) => type.trim().toUpperCase())
    .filter((type: string) => ["US", "EU", "UK", "AU"].includes(type));
  const [selectedPlugType, setSelectedPlugType] = useState<string>(
    compatiblePlugTypes[0] ?? "",
  );

  // Keep the rating summary in sync with the visible customer reviews.
  const productReviewSummaryQuery = useQuery({
    queryKey: ["product-review-summary", product.id],
    enabled: Boolean(product.id),
    queryFn: async () => {
      const { data: reviewRows, error } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", product.id)
        .eq("is_visible", true);

      if (error) {
        console.error("PRODUCT REVIEW SUMMARY ERROR:", error);
        return [] as Array<{ rating: number }>;
      }

      return (reviewRows ?? []) as Array<{ rating: number }>;
    },
    staleTime: 60_000,
  });

  const productReviewSummary = useMemo(() => {
    const rows = productReviewSummaryQuery.data ?? [];
    if (rows.length === 0) return null;
    const average =
      rows.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      rows.length;
    return { average, total: rows.length };
  }, [productReviewSummaryQuery.data]);

  const [selectedImage, setSelectedImage] = useState("");

  const [selectedColor, setSelectedColor] = useState<any>(

    product.product_colors?.[0] ?? null,

  );

  const [selectedModel, setSelectedModel] = useState("");

  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);

  const [activeModelIndex, setActiveModelIndex] = useState(0);

  const modelSelectRef = useRef<HTMLDivElement | null>(null);

  const videoCarouselRef = useRef<HTMLDivElement | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [isShortDescriptionExpanded, setIsShortDescriptionExpanded] = useState(false);
  const primaryAddToCartRef = useRef<HTMLButtonElement | null>(null);
  const [showStickyAddToCart, setShowStickyAddToCart] = useState(false);
  const [activeTrustInfo, setActiveTrustInfo] = useState<{
    title: string;
    description: string;
    icon: typeof Truck;
  } | null>(null);

  useEffect(() => {
    if (!activeTrustInfo) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTrustInfo(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [activeTrustInfo]);

  useEffect(() => {
    const button = primaryAddToCartRef.current;
    if (!button || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyAddToCart(
          !entry.isIntersecting && entry.boundingClientRect.bottom < 0,
        );
      },
      { threshold: 0.01 },
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, [product.id]);

  const [openSpecs, setOpenSpecs] = useState(false);

  const [openProductFaq, setOpenProductFaq] = useState<string | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

  async function handleProductContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (contactSubmitting) return;

    const customerName = contactName.trim();
    const customerEmail = contactEmail.trim();
    const customerMessage = contactMessage.trim();

    if (!customerName || !customerEmail || !customerMessage) {
      toast.error("Please complete all fields.");
      return;
    }

    setContactSubmitting(true);

    try {
      const { error } = await supabase.from("support_requests").insert({
        customer_name: customerName,
        customer_email: customerEmail,
        issue_type: "Product Information",
        message: `Product: ${product.name}\n\n${customerMessage}`,
        page_url: window.location.href,
        status: "new",
      });

      if (error) throw error;

      toast.success("Your message has been sent. Our team will get back to you.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (error: any) {
      console.error("PRODUCT SUPPORT REQUEST ERROR:", error);
      toast.error(
        error?.message
          ? `Unable to send your message: ${error.message}`
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setContactSubmitting(false);
    }
  }

  const productImages = useMemo(() => {

    // Product gallery contains product images only. Lifestyle images are rendered

    // separately in the Lifestyle section below and must not appear in thumbnails

    // or the main gallery navigation.

    const images = (product.product_images ?? [])

      .filter(

        (item: any) =>

          item?.image_url &&

          item?.is_lifestyle !== true &&

          item?.image_type !== "video" &&

          !/\.(mp4|webm)(?:$|[?#])/i.test(item.image_url),

      )

      .sort((a: any, b: any) => {

        const sortDiff =

          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);

        if (sortDiff !== 0) return sortDiff;

        return Number(Boolean(a.is_lifestyle)) - Number(Boolean(b.is_lifestyle));

      });

    if (images.length > 0) return images;

    if (product.image_url) {

      return [

        {

          id: "main",

          image_url: product.image_url,

          color_id: null,

          is_lifestyle: false,

        },

      ];

    }

    return [];

  }, [product]);

  const lifestyleImages = useMemo(

    () =>

      (product.product_images ?? [])

        .filter(

          (item: any) =>

            item?.image_url &&

            item?.is_lifestyle === true,

        )

        .sort(

          (a: any, b: any) =>

            Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),

        ),

    [product],

  );

  // Lifestyle images gently zoom in while entering the viewport,
  // then return to their original scale when scrolled out.
  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement>(
      "img[data-lifestyle-zoom]"
    );

    if (!images.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const image = entry.target as HTMLImageElement;
          image.classList.toggle("scale-[1.06]", entry.isIntersecting);
        });
      },
      {
        threshold: 0.4,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    images.forEach((image) => observer.observe(image));

    return () => observer.disconnect();
  }, [product.id, lifestyleImages.length]);

  // Product videos are displayed in their own horizontal carousel below Lifestyle.

  const productVideos = useMemo(

    () =>

      (product.product_images ?? [])

        .filter(

          (item: any) =>

            item?.image_url &&

            (

              item?.image_type === "video" ||

              /\.(mp4|webm)(?:$|[?#])/i.test(item.image_url)

            ),

        )

        .sort(

          (a: any, b: any) =>

            Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),

        ),

    [product],

  );

  useEffect(() => {

    const firstColor = product.product_colors?.[0] ?? null;

    const firstColorImages = firstColor

      ? productImages.filter(

          (image: any) =>

            String(image?.color_id ?? "") === String(firstColor.id),

        )

      : [];

    const colorImage =

      firstColorImages[0] ??

      productImages[0];

    setSelectedColor(firstColor);
    setSelectedPlugType(compatiblePlugTypes[0] ?? "");

    const firstVariant = (product.product_variants ?? []).find(

      (variant: any) =>

        variant?.is_active !== false &&

        String(variant?.color_id ?? "") === String(firstColor?.id ?? ""),

    );

    setSelectedModel(firstVariant?.device_model_name ?? "");

    setSelectedImage(

      colorImage?.image_url ||

        product.image_url ||

        productImages[0]?.image_url ||

        "",

    );

    setQuantity(1);

  }, [product.id]);

  function handleColorChange(color: any) {

    setSelectedColor(color);

    const modelsForColor = Array.from(

      new Set(

        (product.product_variants ?? [])

          .filter((variant: any) =>

            variant?.is_active !== false &&

            variant?.device_model_name &&

            String(variant?.color_id ?? "") === String(color?.id ?? ""),

          )

          .map((variant: any) => String(variant.device_model_name).trim())

          .filter(Boolean),

      ),

    );

    setSelectedModel((current) =>

      current && modelsForColor.includes(current)

        ? current

        : modelsForColor[0] ?? "",

    );

    const colorImages = productImages.filter(

      (image: any) => String(image?.color_id ?? "") === String(color?.id ?? ""),

    );

    const colorImage = colorImages[0];

    if (colorImage?.image_url) setSelectedImage(colorImage.image_url);

  }

  const activeImage =

    selectedImage ||

    product.image_url ||

    productImages[0]?.image_url ||

    "";

  const activeMedia = productImages.find(

    (item: any) => item?.image_url === activeImage,

  );

  const isActiveVideo =

    activeMedia?.image_type === "video" ||

    /\.(mp4|webm)(?:$|[?#])/i.test(activeImage);

  const compatibleModels = Array.from(

    new Set(

      (product.product_variants ?? [])

        .filter((variant: any) =>

          variant?.is_active !== false &&

          variant?.device_model_name &&

          (!selectedColor?.id ||

            String(variant?.color_id ?? "") === String(selectedColor.id)),

        )

        .map((variant: any) => String(variant.device_model_name).trim())

        .filter(Boolean),

    ),

  );

  const selectedVariant =

    (product.product_variants ?? []).find((variant: any) =>

      variant?.is_active !== false &&

      String(variant?.color_id ?? "") === String(selectedColor?.id ?? "") &&

      String(variant?.device_model_name ?? "").trim() === selectedModel,

    ) ?? null;

  const inStock = selectedVariant

    ? Number(selectedVariant.stock ?? 0) > 0

    : Number(product.stock ?? 0) > 0;

  const price = Number(selectedVariant?.price ?? product.price) || 0;

  // Meta Pixel: record the selected product/variant price in USD.

  useEffect(() => {

    trackViewContent({

      id: String(product.id),

      name: product.name,

      price,

      currency: "USD",

    });

  }, [product.id, product.name, price]);

  // GA4: send product detail data to GTM without changing Meta Pixel tracking.

  useEffect(() => {

    // Wait for the default compatible model to be selected when variants exist.

    if (compatibleModels.length > 0 && !selectedVariant) return;

    const win = window as Window & {

      dataLayer?: Array<Record<string, unknown>>;

    };

    win.dataLayer = win.dataLayer || [];

    win.dataLayer.push({ ecommerce: null });

    win.dataLayer.push({

      event: "view_item",

      ecommerce: {

        currency: "USD",

        value: price,

        items: [

          {

            item_id: String(product.id),

            item_name: product.name,

            item_brand: "INFIBETTER",

            item_variant:

              selectedVariant?.device_model_name ||

              selectedColor?.name ||

              undefined,

            price,

            quantity: 1,

          },

        ],

      },

    });

  }, [

    product.id,

    product.name,

    price,

    selectedVariant?.id,

    selectedVariant?.device_model_name,

    selectedColor?.name,

    compatibleModels.length,

  ]);

  const comparePrice = Number(

    selectedVariant?.compare_at_price ?? product.compare_at_price,

  ) || 0;

  const hasDiscount = comparePrice > price;

  const discountPercent = hasDiscount

    ? Math.round(((comparePrice - price) / comparePrice) * 100)

    : 0;

  useEffect(() => {

    if (!isModelSelectOpen) return;

    function handlePointerDown(event: PointerEvent) {

      const target = event.target as Node;

      if (!modelSelectRef.current?.contains(target)) {

        setIsModelSelectOpen(false);

      }

    }

    function handleKeyDown(event: KeyboardEvent) {

      if (event.key === "Escape") {

        setIsModelSelectOpen(false);

      }

    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {

      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);

    };

  }, [isModelSelectOpen]);

  const selectedModelIndex = Math.max(

    0,

    compatibleModels.findIndex((model) => model === selectedModel),

  );

  const openModelSelect = () => {

    const nextIndex = selectedModelIndex >= 0 ? selectedModelIndex : 0;

    setActiveModelIndex(nextIndex);

    setIsModelSelectOpen(true);

  };

  const closeModelSelect = () => {

    setIsModelSelectOpen(false);

  };

  const handleModelSelect = (model: string) => {

    setSelectedModel(model);

    closeModelSelect();

  };

  const handleModelKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {

    if (!compatibleModels.length) return;

    if (event.key === "Enter" || event.key === " ") {

      event.preventDefault();

      if (!isModelSelectOpen) {

        openModelSelect();

        return;

      }

      handleModelSelect(compatibleModels[activeModelIndex] ?? compatibleModels[0]);

      return;

    }

    if (event.key === "ArrowDown") {

      event.preventDefault();

      if (!isModelSelectOpen) {

        openModelSelect();

        return;

      }

      setActiveModelIndex((index) =>

        Math.min(index + 1, compatibleModels.length - 1),

      );

      return;

    }

    if (event.key === "ArrowUp") {

      event.preventDefault();

      if (!isModelSelectOpen) {

        openModelSelect();

        return;

      }

      setActiveModelIndex((index) => Math.max(index - 1, 0));

      return;

    }

    if (event.key === "Home") {

      event.preventDefault();

      setActiveModelIndex(0);

      return;

    }

    if (event.key === "End") {

      event.preventDefault();

      setActiveModelIndex(compatibleModels.length - 1);

    }

  };

  const includedInBox = Array.isArray(product.included_in_box)
    ? product.included_in_box.filter((item: any) => item && (item.name || item.title))
    : [];

  const specs = (product.product_specifications ?? [])

    .slice()

    .sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  const usps = (product.product_usps ?? [])

    .slice()

    .sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  const productFaqs = (product.product_faqs ?? [])

    .filter((faq: any) => faq?.is_visible !== false)

    .slice()

    .sort(

      (a: any, b: any) =>

        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),

    );

  function addToCart() {

    if (!inStock) {

      toast.error("This product is currently out of stock");

      return;

    }

    // Cart thumbnails should use the product's representative image,
    // not whichever gallery image the customer last viewed.
    // Prefer the product cover, then the selected color's first gallery image,
    // then the first valid product image, with the active image as a last fallback.
    const selectedColorImage = productImages.find(
      (item: any) =>
        item?.image_url &&
        selectedColor?.id &&
        String(item?.color_id ?? "") === String(selectedColor.id),
    )?.image_url;

    const image =
      (typeof product.image_url === "string" && product.image_url.trim()
        ? product.image_url.trim()
        : null) ||
      selectedColorImage ||
      productImages.find((item: any) => typeof item?.image_url === "string" && item.image_url.trim())?.image_url ||
      (typeof activeImage === "string" && activeImage.trim()
        ? activeImage.trim()
        : null) ||
      null;

    cart.add(

      {

        id: product.id,

        slug: product.slug,

        name: product.name,

        price,

        image,

        productColorId: selectedColor?.id,

        colorName: selectedColor?.name,

        colorHex: selectedColor?.hex,

        variantId: selectedVariant?.id,

        deviceModelId: selectedVariant?.device_model_id,

        deviceModelName: selectedVariant?.device_model_name,

        plugType: selectedPlugType || undefined,

      } as any,

      quantity,

    );

    // GA4: track a successful add-to-cart action through GTM.

    const win = window as Window & {

      dataLayer?: Array<Record<string, unknown>>;

    };

    win.dataLayer = win.dataLayer || [];

    win.dataLayer.push({ ecommerce: null });

    win.dataLayer.push({

      event: "add_to_cart",

      ecommerce: {

        currency: "USD",

        value: price * quantity,

        items: [

          {

            item_id: String(product.id),

            item_name: product.name,

            item_brand: "INFIBETTER",

            item_variant:

              selectedVariant?.device_model_name ||

              selectedColor?.name ||

              undefined,

            price,

            quantity,

          },

        ],

      },

    });

    toast.success("Added to cart");
    window.dispatchEvent(new Event("infibetter:open-cart"));

  }

  function buyNow() {

  if (!inStock) {

    toast.error("This product is currently out of stock");

    return;

  }

  addToCart();


}

  function changeImage(direction: "next" | "prev") {

    if (productImages.length < 2) return;

    const currentIndex = Math.max(

      0,

      productImages.findIndex((item: any) => item.image_url === activeImage),

    );

    const nextIndex =

      direction === "next"

        ? (currentIndex + 1) % productImages.length

        : (currentIndex - 1 + productImages.length) % productImages.length;

    setSelectedImage(productImages[nextIndex].image_url);

    trackProductInteraction("product_gallery_change", {
      product_id: String(product.id),
      product_name: product.name,
      interaction_type: direction,
      interaction_value: String(nextIndex + 1),
      gallery_image_index: nextIndex,
    });

  }

  return (

    <main className="min-h-screen bg-white text-[#1D1D1F]">

      {/* Breadcrumb */}

      <div className="mx-auto max-w-[1240px] px-5 pb-4 pt-5 md:px-8 lg:pt-7">

        <nav className="flex items-center gap-2 overflow-hidden text-[12px] text-[#6E6E73]">

          <Link to="/" className="shrink-0 hover:text-[#1D1D1F]">

            Home

          </Link>

          <span>/</span>

          <Link to="/shop" className="shrink-0 hover:text-[#1D1D1F]">

            Shop

          </Link>

          <span>/</span>

          <span className="truncate text-[#1D1D1F]">{product.name}</span>

        </nav>

      </div>

      {/* Product hero */}

      <section className="mx-auto max-w-[1240px] px-2 pb-12 md:px-8 lg:pb-16">

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-12 xl:gap-16">

          {/* Gallery */}

          <div className="min-w-0">

            <div className="relative w-full overflow-hidden rounded-[26px] bg-white">

              <div className="aspect-square w-full">

                {activeImage ? (

                  isActiveVideo ? (

                  <video

                      key={activeImage}

                      src={activeImage}

                      controls

                      playsInline

                      preload="metadata"

                      aria-label={`${product.name} video`}

                      className="h-full w-full bg-white object-contain"

                    />

                  ) : (

                    <img

                      src={getImageUrl(activeImage, "large") || activeImage}

                      alt={product.name}

                      className="h-full w-full object-contain scale-100 p-0 transition-transform duration-300"

                    />

                  )

                ) : (

                  <div className="flex h-full items-center justify-center text-sm text-[#86868B]">

                    No image available

                  </div>

                )}

              </div>

              {productImages.length > 1 && (

                <>

                  <button

                    type="button"

                    onClick={() => changeImage("prev")}

                    aria-label="Previous image"

                    className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm backdrop-blur transition hover:bg-white"

                  >

                    <ChevronLeft size={17} />

                  </button>

                  <button

                    type="button"

                    onClick={() => changeImage("next")}

                    aria-label="Next image"

                    className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm backdrop-blur transition hover:bg-white"

                  >

                    <ChevronRight size={17} />

                  </button>

                </>

              )}

            </div>

            {productImages.length > 1 && (

              <div className="mt-3 w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                <div className="flex w-max min-w-full items-end gap-2">{productImages.map((image: any, index: number) => {

                  const isActive = activeImage === image.image_url;

                  return (

                    <button

                      key={`${image.id ?? index}-${image.image_url}`}

                      type="button"

                      onClick={() => {
                        setSelectedImage(image.image_url);

                        trackProductInteraction("product_gallery_change", {
                          product_id: String(product.id),
                          product_name: product.name,
                          interaction_type: "thumbnail_click",
                          interaction_value: String(index + 1),
                          gallery_image_index: index,
                        });
                      }}

                      aria-label={`View image ${index + 1}`}

                      aria-current={isActive ? "true" : undefined}

                      className={`group relative h-[44px] w-[44px] shrink-0 overflow-visible bg-transparent p-0 transition-all duration-200 ease-out focus-visible:outline-none sm:h-[52px] sm:w-[52px] ${

                        isActive

                          ? "scale-[1.06] opacity-100"

                          : "opacity-65 hover:scale-[1.05] hover:opacity-100"

                      }`}

                    >

                      {image?.image_type === "video" ||

                      /\.(mp4|webm)(?:$|[?#])/i.test(image.image_url) ? (

                        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F7]">

                          <video

                            src={image.image_url}

                            preload="metadata"

                            muted

                            playsInline

                            aria-hidden="true"

                            className="h-full w-full object-contain"

                          />

                          <span className="absolute inset-0 flex items-center justify-center bg-black/[0.08]">

                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#1D1D1F] shadow-sm">

                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">

                                <path d="M8 5v14l11-7z" />

                              </svg>

                            </span>

                          </span>

                        </span>

                      ) : (

                        <img

                          src={getImageUrl(image.image_url, "thumb") || image.image_url}

                          alt={`${product.name} ${index + 1}`}

                          className="h-full w-full object-contain bg-transparent p-0 transition-transform duration-200 ease-out group-hover:scale-[1.03]"

                        />

                      )}

                      {isActive && (

                        <span

                          aria-hidden="true"

                          className="absolute -bottom-[5px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#0071E3]"

                        />

                      )}

                    </button>

                  );

                })}</div>

              </div>

            )}

          </div>

          {/* Product information */}

          <aside className="min-w-0 lg:sticky lg:top-24">

            <div className="max-w-[520px]">

              <div className="mb-2.5 flex items-center gap-2 text-[11px] text-[#6E6E73]">

                <span

                  className={`h-1.5 w-1.5 rounded-full ${

                    inStock ? "bg-[#34C759]" : "bg-[#FF3B30]"

                  }`}

                />

                {inStock ? "In stock" : "Out of stock"}

              </div>

              <h1 className="text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[34px] lg:text-[36px]">

                {product.name}

              </h1>

              {productReviewSummary && (
                <a
  href="#product-reviews"
  onClick={(event) => {
    event.preventDefault();
    document.getElementById("product-reviews")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
  className="mt-1.5 inline-flex min-h-5 items-center gap-1.5 whitespace-nowrap text-[12px] leading-5 text-[#6E6E73] transition hover:text-[#1D1D1F]"
  aria-label={`Rated ${productReviewSummary.average.toFixed(1)} out of 5 from ${productReviewSummary.total} reviews. View reviews.`}
>
  <span className="tracking-[1px] text-[#00B67A]" aria-label="5 out of 5 stars">{"★★★★★"}</span>
  <span className="font-semibold text-[#1D1D1F]">
    {productReviewSummary.average.toFixed(1)}
  </span>
  <span>({productReviewSummary.total} reviews)</span>
</a>
              )}

              {product.short_description && (
                <div className="mt-2.5 max-w-[480px]">
                  <p
                    className={`text-[14px] leading-[1.45rem] text-[#6E6E73] ${
                      isShortDescriptionExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {product.short_description}
                  </p>
                  {product.short_description.length > 105 && (
                    <button
                      type="button"
                      onClick={() => setIsShortDescriptionExpanded((value) => !value)}
                      aria-expanded={isShortDescriptionExpanded}
                      className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[#1D1D1F] underline decoration-[#B8B8B8] underline-offset-2 transition hover:text-[#0071E3]"
                    >
                      {isShortDescriptionExpanded ? "Read less" : "Read more"}
                      <ChevronDown
                        size={13}
                        className={`transition-transform ${isShortDescriptionExpanded ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              )}

              <div className="mt-3">

                <div className="flex flex-wrap items-baseline gap-2.5">

                  <span className="text-[26px] font-semibold tracking-[-0.025em]">

                    {formatProductPrice(price, safeCurrency)}

                  </span>

                  {hasDiscount && (

                    <>

                      <span className="text-[14px] text-[#86868B] line-through">

                        {formatProductPrice(comparePrice, safeCurrency)}

                      </span>

                      <span className="inline-flex items-center rounded-md bg-[#FFF0EB] px-2 py-1 text-[12px] font-bold text-[#E5482E]">
  -{discountPercent}%
</span>

                    </>

                  )}

                </div>

                <p className="mt-1 text-[12px] text-[#86868B]">

                  Price includes VAT where applicable.

                </p>

                {usps.length > 0 && (
                  <ul className="mt-3 grid gap-2" aria-label="Key product benefits">
                    {usps.map((item: any) => {
                      const UspIcon =
                        PRODUCT_USP_ICON_MAP[
                          String(item.icon ?? "").trim().toLowerCase() as keyof typeof PRODUCT_USP_ICON_MAP
                        ];

                      return (
                        <li
                          key={item.id}
                          className="flex min-w-0 items-center gap-2 text-[13px] font-semibold leading-5 text-[#303036]"
                        >
                          {UspIcon ? (
                            <UspIcon
                              size={15}
                              strokeWidth={2.2}
                              className="shrink-0 text-[#16A36A]"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
                          )}
                          <span className="min-w-0">{item.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}

              </div>

              {/* Premium compact color selector */}
              {product.product_colors?.length > 0 && (
                <div className="mt-3 min-w-0">
                  <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold tracking-[-0.01em] text-[#303036]">
                      Color
                    </span>
                    <span className="inline-flex min-h-[34px] min-w-[64px] shrink-0 items-center justify-center border border-[#D8DDE5] bg-white px-3 text-[11px] font-medium text-[#303846]">
                      {selectedColor?.name || "Choose a color"}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {product.product_colors.map((color: any) => {
                      const isSelected = selectedColor?.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          title={color.name}
                          aria-label={`Select ${color.name} color`}
                          aria-pressed={isSelected}
                          onClick={() => handleColorChange(color)}
                          className={`group flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border border-[#252525] bg-white p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,1)]"
                              : "border border-transparent bg-transparent p-[3px] hover:bg-[#F3F3F4]"
                          }`}
                        >
                          <span
                            className={`block h-full w-full rounded-none border ${
                              isSelected ? "border-black/10" : "border-black/[0.12] group-hover:border-black/20"
                            }`}
                            style={{ backgroundColor: color.hex || "#D2D2D7" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selectable plug type - displayed directly below Color */}
              {compatiblePlugTypes.length > 0 && (
                <div className="mt-3 min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#303036]">
                      Plug type
                    </p>
                    <span className="inline-flex min-h-[34px] min-w-[88px] shrink-0 items-center justify-center border border-[#D8DDE5] bg-white px-3 text-[11px] font-medium text-[#303846]">
                      {selectedPlugType ? `${selectedPlugType} Plug` : "Choose a plug"}
                    </span>
                  </div>
                  <div className="grid w-full grid-cols-4 gap-2">
                    {compatiblePlugTypes.map((type: string) => {
                      const isSelected = selectedPlugType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedPlugType(type)}
                          aria-pressed={isSelected}
                          className={`inline-flex min-h-[40px] w-full min-w-0 items-center justify-center rounded-none border px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border-[#B9DEC7] bg-[#EAF6EE] text-[#287A45] shadow-[inset_0_0_0_1px_rgba(40,122,69,0.04)]"
                              : "border-[#E5E5E7] bg-white text-[#45454B] hover:border-[#B9DEC7] hover:bg-[#F7FBF8]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compatible device models */}

              {compatibleModels.length > 0 && (

                <div className="mt-3 pt-0">

                  <label

                    htmlFor="compatible-model-select"

                    className="mb-2 block text-[14px] font-semibold leading-5 text-[#222222]"

                  >

                    Compatible model

                  </label>

                  <div

                    ref={modelSelectRef}

                    className="relative w-full"

                  >

                    <button

                      id="compatible-model-select"

                      type="button"

                      aria-haspopup="listbox"

                      aria-expanded={isModelSelectOpen}

                      aria-controls="compatible-model-options"

                      onClick={() => {

                        if (isModelSelectOpen) {

                          closeModelSelect();

                        } else {

                          openModelSelect();

                        }

                      }}

                      onKeyDown={handleModelKeyDown}

                      className={`flex h-12 w-full items-center justify-between gap-3 rounded-[10px] border bg-white px-3.5 text-left text-[13px] font-medium text-[#222222] outline-none transition-colors duration-150 touch-manipulation sm:h-[46px] sm:px-3.5 ${

                        isModelSelectOpen

                          ? "border-[#B8B8B8] ring-2 ring-[#111111]/[0.05]"

                          : "border-[#E2E2E2] hover:border-[#B8B8B8]"

                      } focus-visible:border-[#111111] focus-visible:ring-2 focus-visible:ring-[#111111]/10`}

                    >

                      <span className="min-w-0 flex-1 truncate">

                        {selectedModel || "Select model"}

                      </span>

                      <ChevronDown

                        size={16}

                        strokeWidth={1.9}

                        className={`shrink-0 text-[#666666] transition-transform duration-150 ${

                          isModelSelectOpen ? "rotate-180" : ""

                        }`}

                        aria-hidden="true"

                      />

                    </button>

                    {isModelSelectOpen && (

                      <div

                        id="compatible-model-options"

                        role="listbox"

                        aria-label="Compatible models"

                        className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[280px] overflow-y-auto overscroll-contain rounded-[10px] border border-[#E2E2E2] bg-white p-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.07)]"

                      >

                        {compatibleModels.map((model, index) => {

                          const isSelected = selectedModel === model;

                          const isActive = activeModelIndex === index;

                          return (

                            <button

                              key={model}

                              type="button"

                              role="option"

                              aria-selected={isSelected}

                              onMouseEnter={() => setActiveModelIndex(index)}

                              onClick={() => handleModelSelect(model)}

                              className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[7px] px-3 py-2 text-left text-[13px] leading-5 transition-colors duration-100 touch-manipulation sm:min-h-[42px] sm:text-[14px] ${

                                isSelected

                                  ? "bg-[#F7F7F7] font-semibold text-[#222222]"

                                  : isActive

                                    ? "bg-[#F7F7F7] text-[#222222]"

                                    : "text-[#222222] hover:bg-[#F7F7F7]"

                              }`}

                            >

                              <span className="min-w-0 flex-1 truncate">

                                {model}

                              </span>

                              {isSelected && (

                                <Check

                                  size={15}

                                  strokeWidth={2}

                                  className="shrink-0 text-[#111111]"

                                  aria-hidden="true"

                                />

                              )}

                            </button>

                          );

                        })}

                      </div>

                    )}

                  </div>

                </div>

              )}

              {/* Quantity + PayPal checkout actions */}
              <div className="mt-3 space-y-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-[46px] w-[96px] shrink-0 items-center justify-between rounded-[3px] border border-[#D8D8D8] bg-white">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="flex h-full w-8 items-center justify-center text-[#333] hover:bg-[#F5F5F5]"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="min-w-4 text-center text-[12px] font-medium tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((value) => Math.min(Math.max(1, Number(selectedVariant?.stock ?? product.stock ?? 1)), value + 1))}
                      className="flex h-full w-8 items-center justify-center text-[#333] hover:bg-[#F5F5F5]"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    ref={primaryAddToCartRef}
                    type="button"
                    onClick={addToCart}
                    disabled={!inStock}
                    className="flex h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[3px] bg-[#171717] px-3 text-[13px] font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:bg-[#A3A3A3]"
                  >
                    <span>Add to cart</span>
                    <span aria-hidden="true">–</span>
                    <span className="whitespace-nowrap">{formatProductPrice(price * quantity, "USD")} USD</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={buyNow}
                  disabled={!inStock}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[3px] bg-[#FFC439] px-5 text-[14px] font-semibold text-[#003087] transition hover:bg-[#F7B928] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Buy with PayPal"
                >
                  <svg viewBox="0 0 32 24" className="h-[19px] w-7" role="img" aria-label="PayPal">
                    <path d="M13 2h9c4 0 6 2.2 5.2 6-.7 3.8-3.2 5.6-7 5.6h-3l-1 4.5h-5L13 2Z" fill="#003087" />
                    <path d="M8.5 5h9c4 0 6 2.2 5.2 6-.7 3.8-3.2 5.6-7 5.6h-3l-1 4.5h-5L8.5 5Z" fill="#009CDE" />
                  </svg>
                  Buy with PayPal
                </button>

                <a
                  href="#payment-options"
                  className="mx-auto block w-fit text-center text-[11px] text-[#555] underline underline-offset-2 transition hover:text-[#003087]"
                >
                  More payment options
                </a>

                {/* Accepted payment cards - crisp inline vector marks */}
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2.5" aria-label="Accepted payment cards">
                  {/* Visa */}
                  <svg viewBox="0 0 52 32" className="h-7 w-[46px] shrink-0" role="img" aria-label="Visa">
                    <rect x="0.5" y="0.5" width="51" height="31" rx="4" fill="#1434CB" stroke="#1434CB" />
                    <text x="26" y="21" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="900" fontStyle="italic">VISA</text>
                  </svg>
                  {/* Mastercard */}
                  <svg viewBox="0 0 52 32" className="h-7 w-[46px] shrink-0" role="img" aria-label="Mastercard">
                    <rect x="0.5" y="0.5" width="51" height="31" rx="4" fill="#fff" stroke="#E5E7EB" />
                    <circle cx="22" cy="16" r="9" fill="#EB001B" />
                    <circle cx="30" cy="16" r="9" fill="#F79E1B" />
                    <path d="M26 8.06a9 9 0 0 1 0 15.88 9 9 0 0 1 0-15.88Z" fill="#FF5F00" />
                  </svg>
                  {/* Discover */}
                  <svg viewBox="0 0 62 32" className="h-7 w-[54px] shrink-0" role="img" aria-label="Discover">
                    <rect x="0.5" y="0.5" width="61" height="31" rx="4" fill="#fff" stroke="#E5E7EB" />
                    <text x="31" y="19" textAnchor="middle" fill="#222" fontFamily="Arial, Helvetica, sans-serif" fontSize="10" fontWeight="800">DISCOVER</text>
                    <path d="M25 22c8 0 15-2.5 21-7-3 7-11 11-21 11Z" fill="#F58220" />
                  </svg>
                  {/* Diners Club */}
                  <svg viewBox="0 0 52 32" className="h-7 w-[46px] shrink-0" role="img" aria-label="Diners Club">
                    <rect x="0.5" y="0.5" width="51" height="31" rx="4" fill="#fff" stroke="#E5E7EB" />
                    <circle cx="26" cy="16" r="10.5" fill="#fff" stroke="#0079BE" strokeWidth="2.5" />
                    <path d="M24 7.5v17a8.5 8.5 0 0 0 0-17Z" fill="#0079BE" />
                    <path d="M28 7.5v17a8.5 8.5 0 0 1 0-17Z" fill="#0079BE" />
                  </svg>
                  {/* American Express */}
                  <svg viewBox="0 0 52 32" className="h-7 w-[46px] shrink-0" role="img" aria-label="American Express">
                    <rect x="0.5" y="0.5" width="51" height="31" rx="4" fill="#2E77BC" stroke="#2466A3" />
                    <text x="26" y="13" textAnchor="middle" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="800">AMERICAN</text>
                    <text x="26" y="23" textAnchor="middle" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="10" fontWeight="900">EXPRESS</text>
                  </svg>
                </div>
              </div>

              {/* INFIBETTER - PREMIUM POLICY ACCORDION */}
              <section className="mt-5 w-full min-w-0" aria-label="Shopping policies">

                <div className="divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">

                  <details className="group">
                    <summary
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: "shop_confidence_click",
                          confidence_item: "tracked_delivery",
                          confidence_label: "Fast Worldwide Shipping",
                          page_type: "product",
                          product_name: product.name,
                          product_id: String(product.id),
                        });
                      }}
                      className="flex min-h-[62px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-[13px] font-medium text-[#202124] marker:hidden"
                    >
                      <span className="flex items-center gap-3">
                        <Truck size={21} strokeWidth={1.7} />
                        Fast Worldwide Shipping
                      </span>
                      <span className="text-[21px] font-light leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="pb-5 pl-9 pr-5 text-[12px] leading-[1.8] text-[#737373]">
                      <p>
                        We will ship orders within 24 to 72 business hours
                        (excluding pre-order items), except in the event of
                        force majeure or public holidays.
                      </p>
                      <p className="mt-2">
                        For more information, please see the{" "}
                        <Link
                          to="/shipping"
                          className="font-medium text-[#0071E3] underline underline-offset-2 hover:text-[#005BB5]"
                        >
                          Shipping Policy
                        </Link>.
                      </p>
                    </div>
                  </details>

                  <details className="group">
                    <summary
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: "shop_confidence_click",
                          confidence_item: "30_day_guarantee",
                          confidence_label: "30-Day Hassle-Free Returns",
                          page_type: "product",
                          product_name: product.name,
                          product_id: String(product.id),
                        });
                      }}
                      className="flex min-h-[62px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-[13px] font-medium text-[#202124] marker:hidden"
                    >
                      <span className="flex items-center gap-3">
                        <RotateCcw size={21} strokeWidth={1.7} />
                        30-Day Hassle-Free Returns
                      </span>
                      <span className="text-[21px] font-light leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="pb-5 pl-9 pr-5 text-[12px] leading-[1.8] text-[#737373]">
                      <p>
                        We accept returns up to 30 days after receipt of your order.
                      </p>
                      <p className="mt-4">
                        For more information, please see the{" "}
                        <Link
                          to="/refund-policy"
                          className="font-medium text-[#737373] underline underline-offset-2 hover:text-[#0071E3]"
                        >
                          Refund Policy
                        </Link>.
                      </p>
                    </div>
                  </details>

                  <details className="group">
                    <summary
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: "shop_confidence_click",
                          confidence_item: "one_year_warranty",
                          confidence_label: "1-Year Warranty Coverage",
                          page_type: "product",
                          product_name: product.name,
                          product_id: String(product.id),
                        });
                      }}
                      className="flex min-h-[62px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-[13px] font-medium text-[#202124] marker:hidden"
                    >
                      <span className="flex items-center gap-3">
                        <ShieldCheck size={21} strokeWidth={1.7} />
                        1-Year Warranty Coverage
                      </span>
                      <span className="text-[21px] font-light leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="pb-5 pl-9 pr-5 text-[12px] leading-[1.8] text-[#737373]">
                      <p>
                        We provide a straightforward, hassle-free warranty to save you some headaches.
                        If there is any quality problem with our products, please feel free to contact us at{" "}
                        <a
                          href="mailto:support@infibetter.com"
                          className="font-medium text-[#737373] underline underline-offset-2 hover:text-[#0071E3]"
                        >
                          support@infibetter.com
                        </a>{" "}
                        with your order receipt for confirmation.
                      </p>
                      <p className="mt-4">
                        For more details, you can view our{" "}
                        <Link
                          to="/warranty"
                          className="font-medium text-[#737373] underline underline-offset-2 hover:text-[#0071E3]"
                        >
                          Warranty Policy
                        </Link>.
                      </p>
                    </div>
                  </details>

                  <details className="group">
                    <summary
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: "shop_confidence_click",
                          confidence_item: "customer_support",
                          confidence_label: "Lifetime Customer Support",
                          page_type: "product",
                          product_name: product.name,
                          product_id: String(product.id),
                        });
                      }}
                      className="flex min-h-[62px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-[13px] font-medium text-[#202124] marker:hidden"
                    >
                      <span className="flex items-center gap-3">
                        <Users size={21} strokeWidth={1.7} />
                        Lifetime Customer Support
                      </span>
                      <span className="text-[21px] font-light leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="pb-5 pl-9 pr-5 text-[12px] leading-[1.8] text-[#737373]">
                      <p>
                        We are here to help whenever you need us. Whether you have questions about a product,
                        your order, or delivery, our support team is ready to assist.
                      </p>
                      <p className="mt-3">
                        Feel free to reach us at{" "}
                        <a
                          href="mailto:support@infibetter.com"
                          className="font-medium text-[#737373] underline underline-offset-2 hover:text-[#0071E3]"
                        >
                          support@infibetter.com
                        </a>.
                        Please include your order number so we can assist you faster.
                      </p>
                    </div>
                  </details>

                </div>



              </section>
              {/* Description */}

              {product.description && (

                <div className="mt-7 border-b border-[#D2D2D7] pb-5">

                  <button

                    type="button"

                    onClick={() => {
                      const nextOpen = !openSpecs;
                      setOpenSpecs(nextOpen);

                      if (nextOpen) {
                        trackProductInteraction("product_description_click", {
                          product_id: String(product.id),
                          product_name: product.name,
                          interaction_type: "description_open",
                          content_section: "product_description",
                        });
                      }
                    }}

                    className="flex w-full items-center justify-between text-left"

                  >

                    <span className="text-[14px] font-semibold">

                      Product description

                    </span>

                    <ChevronDown

                      size={17}

                      className={`transition-transform ${

                        openSpecs ? "rotate-180" : ""

                      }`}

                    />

                  </button>

                  {openSpecs && (

                    <div

                      className="prose prose-sm mt-4 max-w-none text-[13px] leading-6 text-[#6E6E73]"

                      dangerouslySetInnerHTML={{ __html: product.description }}

                    />

                  )}

                </div>

              )}

            </div>

          </aside>

        </div>

      </section>

            {/* Product video carousel â€” displayed above Lifestyle */}

      {productVideos.length > 0 && (

        <section className="bg-white">

          <div className="mx-auto max-w-[1240px] px-5 pb-14 md:px-8 md:pb-20">

            <div className="mb-6 flex items-end justify-between gap-4">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">

                  WATCH

                </p>

                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1D1D1F] sm:text-[28px]">

                  Product videos

                </h2>

                <p className="mt-2 text-[13px] text-[#6E6E73]">

                  See the details in motion.

                </p>

              </div>

              {productVideos.length > 1 && (

                <div className="hidden shrink-0 gap-2 sm:flex">

                  <button type="button" onClick={() => videoCarouselRef.current?.scrollBy({ left: -360, behavior: "smooth" })} aria-label="Scroll videos left" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[#1D1D1F] transition hover:bg-[#F5F5F7]">

                    <ChevronLeft size={18} />

                  </button>

                  <button type="button" onClick={() => videoCarouselRef.current?.scrollBy({ left: 360, behavior: "smooth" })} aria-label="Scroll videos right" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[#1D1D1F] transition hover:bg-[#F5F5F7]">

                    <ChevronRight size={18} />

                  </button>

                </div>

              )}

            </div>

            <div ref={videoCarouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Product videos">

              {productVideos.map((video: any, index: number) => (

                <article key={`${video.id ?? index}-${video.image_url}`} className="w-[78vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[16px] bg-[#F5F5F7] ring-1 ring-black/[0.06] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">

                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#E8E8EA]">

                    <video

                      src={video.image_url}

                      autoPlay

                      muted

                      loop

                      playsInline

                      preload="auto"

                      aria-label={`${product.name} product video ${index + 1}`}

                      className="h-full w-full object-contain"

/>

                    <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white">Video {index + 1}</span>

                  </div>

                  <div className="p-4 sm:p-5">

                    <h3 className="text-[14px] font-semibold leading-5 text-[#1D1D1F]">{video.title || `${product.name} - Video ${index + 1}`}</h3>

                    <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">Discover the product from every angle.</p>

                  </div>

                </article>

              ))}

            </div>

            {productVideos.length > 1 && <p className="mt-2 text-center text-[11px] text-[#86868B] sm:hidden">Swipe to explore more videos â†’</p>}

          </div>

        </section>

      )}

{/* Lifestyle gallery â€” only Lifestyle images */}

      {lifestyleImages.length > 0 && (

        <section className="bg-white">

          <div className="mx-auto max-w-[1240px] px-5 pb-14 md:px-8 md:pb-20">

            <div className="mx-auto w-full max-w-full">

              <div className="mb-6 text-center">

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#86868B]">

                  LIFESTYLE

                </p>

                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#1D1D1F] sm:text-[28px]">

                  See it in real life

                </h2>

              </div>

              <div

                className={
  lifestyleImages.length === 1
    ? "mx-auto w-full max-w-full"
    : "grid grid-cols-1 gap-6"
}

              >

                {lifestyleImages.map((image: any, index: number) => (

                  <div

                    key={`${image.id ?? index}-${image.image_url}`}

                    className="w-full min-w-0 overflow-hidden rounded-[12px] bg-[#F5F5F7] shadow-[0_8px_24px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.05] sm:rounded-[16px]"

                  >

                    <img

                      src={image.image_url}

                      alt={`${product.name} lifestyle ${index + 1}`}

                      data-lifestyle-zoom

                      className="block h-auto w-full origin-center scale-100 object-contain transform-gpu transition-transform duration-700 ease-out will-change-transform"

                      loading="lazy"

                    />

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>

      )}

{/* DESKTOP SPECS + INCLUDED IN THE BOX */}
      <section className="hidden border-y border-[#ECEEF1] bg-white py-10 lg:block lg:py-14">
        <div className="mx-auto max-w-[1600px] px-5 xl:px-[18px]">
          <h2 className="mb-8 text-[38px] font-semibold leading-none tracking-[-0.045em] text-black">
            Specs
          </h2>

          <div className="grid grid-cols-[minmax(0,2.08fr)_minmax(330px,0.96fr)] items-start gap-[60px]">
            <div className="min-w-0 bg-[#F4F4F4] px-8 py-7 xl:px-[34px]">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-[17px] font-medium tracking-[-0.02em] text-black">
                  Product Specifications
                </h3>
                <span className="text-[18px] leading-none text-black">×</span>
              </div>

              {(() => {
                const specItems = [
                  ...specs.map((spec: any) => ({
                    id: spec.id,
                    label: spec.label,
                    value: spec.value,
                  })),
                  ...(product.material ? [{ id: "material", label: "Material", value: product.material }] : []),
                  ...(product.dimensions ? [{ id: "dimensions", label: "Dimensions", value: product.dimensions }] : []),
                  ...(product.color ? [{ id: "color", label: "Color", value: product.color }] : []),
                  ...(product.light_source ? [{ id: "light_source", label: "Light source", value: product.light_source }] : []),
                  ...(product.power_source ? [{ id: "power_source", label: "Power source", value: product.power_source }] : []),
                  ...(product.warranty ? [{ id: "warranty", label: "Warranty", value: product.warranty }] : []),
                ];
                return specItems.length ? (
                  <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                    {specItems.map((item: any) => (
                      <div key={item.id} className="min-w-0">
                        <h4 className="mb-2 text-[15px] font-medium leading-6 text-black">
                          {item.label}
                        </h4>
                        <p className="whitespace-pre-line break-words text-[14px] leading-[1.65] text-[#171717]">
                          {String(item.value ?? "").split(/\\r?\\n/).map((line: string, index: number) => (
                            <span key={index} className="block">{line.trim().startsWith("-") ? line : `- ${line}`}</span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No technical specifications have been added for this product yet.</p>
                );
              })()}
            </div>

            <aside className="relative min-w-0 bg-[#F8F8F8] px-7 pb-8 pt-9">
              <div className="absolute left-1/2 top-0 h-[70px] w-[224px] -translate-x-1/2 -translate-y-full rounded-t-[18px] bg-black">
                <div className="absolute left-1/2 top-[29px] h-[18px] w-[114px] -translate-x-1/2 rounded-full bg-white" />
                <div className="absolute left-1/2 top-[19px] h-[21px] w-[21px] -translate-x-1/2 rounded-full bg-white" />
              </div>
              <h3 className="mb-9 text-center text-[27px] font-medium leading-tight tracking-[-0.04em] text-black">
                Included in the Box
              </h3>

              {includedInBox.length ? (
                <div className="mx-auto flex w-full max-w-[360px] flex-wrap justify-center gap-x-5 gap-y-8">
                  {includedInBox.map((item: any, index: number) => (
                    <div key={`${item.id ?? item.name ?? item.title}-${index}`} className="flex min-w-0 flex-col items-center text-center">
                      <div className="mb-3 flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full bg-white">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name || item.title || "Included item"} className="h-full w-full object-contain p-3" loading="lazy" />
                        ) : (
                          <Package size={32} strokeWidth={1.35} className="text-[#777]" />
                        )}
                      </div>
                      <p className="max-w-[130px] whitespace-pre-line text-[12px] leading-[1.55] text-[#222]">
                        {Number(item.quantity ?? 1)} x {item.name || item.title}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-[13px] text-neutral-400">No items have been added yet.</p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* MOBILE PRODUCT SPECIFICATIONS */}
      <section className="bg-white px-4 py-7 sm:px-6 lg:hidden">
        <div className="mx-auto w-full max-w-[560px]">
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-black">
            Specs
          </h2>

          <div className="min-w-0 bg-[#F4F4F4] px-4 py-5 sm:px-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[14px] font-medium tracking-[-0.02em] text-black">
                Product Specifications
              </h3>
              <span className="text-[15px] leading-none text-black" aria-hidden="true">×</span>
            </div>

            {(() => {
              const mobileSpecItems = [
                ...specs.map((spec: any) => ({
                  id: spec.id,
                  label: spec.label,
                  value: spec.value,
                })),
                ...(product.material ? [{ id: "material", label: "Material", value: product.material }] : []),
                ...(product.dimensions ? [{ id: "dimensions", label: "Dimensions", value: product.dimensions }] : []),
                ...(product.color ? [{ id: "color", label: "Color", value: product.color }] : []),
                ...(product.light_source ? [{ id: "light_source", label: "Light source", value: product.light_source }] : []),
                ...(product.power_source ? [{ id: "power_source", label: "Power source", value: product.power_source }] : []),
                ...(product.warranty ? [{ id: "warranty", label: "Warranty", value: product.warranty }] : []),
              ];

              return mobileSpecItems.length ? (
                <div className="grid grid-cols-1 gap-y-4">
                  {mobileSpecItems.map((item: any) => (
                    <div key={`mobile-${item.id}`} className="min-w-0 border-b border-[#E5E5E5] pb-3 last:border-b-0 last:pb-0">
                      <h4 className="mb-1 text-[12px] font-semibold leading-5 text-black">
                        {item.label}
                      </h4>
                      <p className="whitespace-pre-line break-words text-[12px] leading-[1.65] text-[#303030]">
                        {String(item.value ?? "").split(/\\r?\\n/).map((line: string, index: number) => (
                          <span key={index} className="block">
                            {line.trim().startsWith("-") ? line : `- ${line}`}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] leading-5 text-neutral-500">
                  No technical specifications have been added for this product yet.
                </p>
              );
            })()}
          </div>
        </div>
      </section>

      {/* MOBILE INCLUDED IN THE BOX — placed after product specifications */}
      {includedInBox.length > 0 && (
        <section className="bg-white px-4 py-8 sm:px-6 lg:hidden">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="relative mx-auto h-[34px] w-[176px] rounded-t-[16px] bg-black" aria-hidden="true">
              <span className="absolute left-1/2 top-[19px] h-[13px] w-[92px] -translate-x-1/2 rounded-full bg-white" />
              <span className="absolute left-1/2 top-[12px] h-[16px] w-[16px] -translate-x-1/2 rounded-full bg-white" />
            </div>
            <div className="bg-[#F7F7F8] px-5 pb-8 pt-6 sm:px-7">
              <h2 className="mb-7 text-center text-[22px] font-medium leading-tight tracking-[-0.035em] text-black">
                Included in the Box
              </h2>
              <div className="mx-auto flex w-full flex-wrap justify-center gap-x-6 gap-y-7">
                {includedInBox.map((item: any, index: number) => (
                  <div
                    key={`${item.id ?? item.name ?? item.title}-${index}`}
                    className="flex min-w-0 max-w-[150px] flex-col items-center text-center"
                  >
                    <div className="mb-3 flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full bg-white">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name || item.title || "Included item"}
                          className="h-full w-full object-contain p-3"
                          loading="lazy"
                        />
                      ) : (
                        <Package size={32} strokeWidth={1.35} className="text-[#777]" />
                      )}
                    </div>
                    <p className="max-w-[140px] whitespace-pre-line text-[12px] font-semibold leading-[1.55] text-[#222]">
                      {Number(item.quantity ?? 1)} x {item.name || item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

{/* FAQ / Product information */}

      <section className="border-y border-[#ECEEF1] bg-white">

        <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16 lg:py-[76px]">

          <div className="mx-auto grid w-full max-w-[1088px] grid-cols-1 gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-[clamp(64px,12vw,192px)]">

            <div className="min-w-0">
              <h2 className="mb-7 text-[28px] font-medium leading-tight tracking-[-0.04em] text-[#17191C] sm:text-[32px]">FAQs</h2>

            <div className="border-t border-[#E5E5E5] bg-transparent">
              {productFaqs.length > 0 ? (
                productFaqs.map((item: any, faqIndex: number) => {
                  const itemOpen = openProductFaq === item.id;
                  return (
                    <div
                      key={item.id}
                      className={faqIndex < productFaqs.length - 1 ? "border-b border-[#E5E5E5]" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const nextOpen = openProductFaq !== item.id;
                          setOpenProductFaq((value) => value === item.id ? null : item.id);
                          if (nextOpen) {
                            trackProductInteraction("faq_expand", {
                              product_id: String(product.id),
                              product_name: product.name,
                              interaction_type: "product_faq",
                              interaction_value: item.question,
                            });
                          }
                        }}
                        aria-expanded={itemOpen}
                        className="flex min-h-[68px] w-full items-center gap-4 py-4 text-left"
                      >
                        <span className="min-w-0 flex-1 text-[15px] font-medium leading-[1.4] tracking-[-0.02em] text-[#17191C] sm:text-[16px]">
                          {item.question}
                        </span>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#333]">
                          <Plus size={17} strokeWidth={1.5} className={`transition-transform duration-200 ${itemOpen ? "rotate-45" : ""}`} />
                        </span>
                      </button>
                      {itemOpen && (
                        <div className="pb-5 pr-10">
                          <p className="whitespace-pre-line text-[13px] leading-6 text-[#6E6E73]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-5 text-[13px] leading-6 text-[#6E6E73]">
                  No FAQs have been added for this product yet.
                </p>
              )}
            </div>
            </div>

            <div className="min-w-0 lg:pt-0 lg:max-w-[323px]">
              <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-[#17191C] sm:text-[22px]">Didn’t find your answer?</h3>
              <p className="mt-1 text-[11px] text-[#858585]">Don’t hesitate to contact us</p>

              <form onSubmit={handleProductContactSubmit} className="mt-8 space-y-[18px]">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Name"
                  aria-label="Name"
                  className="h-[47px] w-full border-0 bg-[#F4F4F4] px-5 text-[11px] text-[#222] outline-none transition placeholder:text-[#858585] focus:bg-[#EEEEEE] focus:ring-1 focus:ring-[#D5D5D5]"
                />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="Email"
                  aria-label="Email"
                  className="h-[47px] w-full border-0 bg-[#F4F4F4] px-5 text-[11px] text-[#222] outline-none transition placeholder:text-[#858585] focus:bg-[#EEEEEE] focus:ring-1 focus:ring-[#D5D5D5]"
                />
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  placeholder="Message"
                  aria-label="Message"
                  className="min-h-[96px] w-full resize-y border-0 bg-[#F4F4F4] px-5 py-4 text-[11px] text-[#222] outline-none transition placeholder:text-[#858585] focus:bg-[#EEEEEE] focus:ring-1 focus:ring-[#D5D5D5]"
                />
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="inline-flex h-[44px] min-w-[144px] items-center justify-center bg-[#171717] px-7 text-[10px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#777] focus-visible:ring-offset-2"
                >
                  {contactSubmitting ? "Sending..." : "Send message"}
                </button>
              </form>
            </div>

          </div>

        </div>

      </section>

      {/* Product Reviews */}

      <div id="product-reviews" className="scroll-mt-24">
        <ProductReviews productId={product.id} />
      </div>

      {/* Related */}

      {related.length > 0 && (

        <section className="border-t border-[#D2D2D7] bg-white">

          <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-8 lg:py-16">

            <div className="flex items-end justify-between gap-6">

              <div>

                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6E6E73]">

                  You may also like

                </p>

                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">

                  Complete your setup.

                </h2>

              </div>

              <Link

                to="/shop"

                className="hidden text-[13px] font-medium text-[#0071E3] sm:block"

              >

                View all â†’

              </Link>

            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">

              {related.map((item: any) => {

                const relatedPrice = Number(item.price) || 0;

                return (

                  <Link

                    key={item.id}

                    to="/products/$slug"

                    params={{ slug: item.slug }}
                    onClick={() => {
                      trackProductInteraction("related_product_click", {
                        product_id: String(product.id),
                        product_name: product.name,
                        interaction_type: "related_product",
                        interaction_value: String(item.name),
                      });
                    }}

                    className="group min-w-0"

                  >

                    <div className="aspect-square w-full overflow-hidden rounded-[18px] bg-[#F5F5F7]">

                      {item.image_url ? (

                        <img

                          src={getImageUrl(item.image_url, "card") || item.image_url}

                          alt={item.name}

                          className="h-full w-full object-contain p-0 transition-transform duration-500 group-hover:scale-[1.03]"

                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-xs text-[#86868B]">

                          No image

                        </div>

                      )}

                    </div>

                    <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-5">

                      {item.name}

                    </h3>

                    <p className="mt-1 text-[13px] text-[#424245]">

                      {formatProductPrice(relatedPrice, safeCurrency)}

                    </p>

                  </Link>

                );

              })}

            </div>

          </div>

        </section>

      )}

      {showStickyAddToCart && inStock && (
        <div className="fixed bottom-5 left-4 right-[76px] z-[90] md:hidden">
          <div className="flex h-[52px] w-full min-w-0 items-center gap-1.5 rounded-[8px] border border-white/90 bg-white/95 px-2 py-1.5 shadow-[0_6px_22px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="min-w-0 truncate text-[10px] font-bold leading-3 text-[#303846]">
                  {product.name}
                </p>
                <span className="inline-flex shrink-0 items-center gap-0.5 text-[8px] font-semibold leading-3 text-[#168653]">
                  <Truck size={10} strokeWidth={2} />
                  Free ship
                </span>
              </div>
              <div className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
                <p className={`text-[14px] font-bold leading-5 tracking-[-0.025em] ${hasDiscount ? "text-[#00B67A]" : "text-[#1D1D1F]"}`}>
                  {formatProductPrice(price, safeCurrency)}
                </p>
                {hasDiscount && (
                  <>
                    <p className="text-[9px] font-medium leading-4 text-[#969BA3] line-through">
                      {formatProductPrice(comparePrice, safeCurrency)}
                    </p>
                    <span className="rounded-[3px] bg-[#EAF7F0] px-1.5 py-0.5 text-[8px] font-bold leading-3 text-[#168653]">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              aria-label="Add to cart"
              title="Add to cart"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E8ECF1] bg-white text-[#536273] transition-colors duration-150 hover:border-[#C9D5E2] hover:bg-[#F7F9FB] active:scale-[0.96]"
            >
              <ShoppingBag size={15} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={buyNow}
              aria-label="Buy now"
              className="flex h-8 shrink-0 items-center justify-center rounded-[5px] border border-[#DCE6F1] bg-[#F3F7FC] px-3.5 text-[10px] font-semibold tracking-[-0.01em] text-[#29435F] transition-colors duration-150 hover:border-[#C7D7E8] hover:bg-[#EAF1F8] active:scale-[0.97]"
            >
              Buy now
            </button>
          </div>
        </div>
      )}

      {activeTrustInfo && (
        <div
          className="
            fixed inset-0 z-[120]
            flex items-end justify-center
            bg-[#101828]/50
            p-0 backdrop-blur-[4px]
            sm:items-center sm:p-5
          "
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveTrustInfo(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-info-title"
            className="
              relative flex max-h-[85dvh] w-full max-w-[460px]
              flex-col overflow-hidden
              rounded-t-[26px] border border-white/80
              bg-[#FFFEFC]
              shadow-[0_24px_80px_rgba(0,0,0,0.24)]
              animate-in slide-in-from-bottom-4 duration-200
              sm:max-h-[min(620px,86dvh)]
              sm:rounded-[24px]
              sm:animate-in sm:zoom-in-[0.98]
            "
          >
            <div className="shrink-0 border-b border-[#EEECE7] px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border border-[#E9EDF2] bg-gradient-to-br from-white to-[#EEF2F7] text-[#34465D] shadow-[0_2px_8px_rgba(25,40,60,0.06)]">
                    <activeTrustInfo.icon size={22} strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-[#A0A5AD]">
                      INFIBETTER Â· SHOP WITH CONFIDENCE
                    </p>
                    <h2
                      id="trust-info-title"
                      className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#1D1D1F] sm:text-[20px]"
                    >
                      {activeTrustInfo.title === "30-day returns"
                        ? "30-Day Replacement Guarantee"
                        : activeTrustInfo.title === "Customer support"
                          ? "We're Here to Help"
                          : activeTrustInfo.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTrustInfo(null)}
                  aria-label="Close information"
                  className="
                    grid h-9 w-9 shrink-0 place-items-center
                    rounded-full border border-[#ECEAE5]
                    bg-white text-[#737780]
                    transition-colors
                    hover:bg-[#F3F2EF] hover:text-[#1D1D1F]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[#0071E3] focus-visible:ring-offset-2
                  "
                >
                  <X size={17} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              {activeTrustInfo.title === "Tracked delivery" ? (
                <div className="space-y-5">
                  <div className="rounded-[14px] border border-[#ECEEF1] bg-white px-4 py-3.5">
                    <p className="text-[13px] leading-[1.85] text-[#626873]">
                      Orders are generally processed within{" "}
                      <strong className="font-semibold text-[#252A32]">1â€“2 business days</strong>{" "}
                      before dispatch. Once your order is on its way, tracking details are sent so you can follow its journey.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex min-h-[112px] flex-col rounded-[14px] border border-[#E5EAF0] bg-[#F7F8FA] p-4">
                      <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-[#9299A3]">Processing time</p>
                      <p className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#252A32]">1â€“2 days</p>
                      <p className="mt-2 text-[11px] leading-[1.5] text-[#858C96]">Before dispatch</p>
                    </div>
                    <div className="flex min-h-[112px] flex-col rounded-[14px] border border-[#E5EAF0] bg-[#F7F8FA] p-4">
                      <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-[#9299A3]">Order tracking</p>
                      <p className="mt-3 text-[18px] font-semibold leading-[1.25] tracking-[-0.015em] text-[#252A32]">Included</p>
                      <p className="mt-2 text-[11px] leading-[1.5] text-[#858C96]">After dispatch</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9299A3]">Estimated delivery</span>
                      <span className="h-px flex-1 bg-[#ECEEF1]" />
                    </div>
                    <div className="overflow-hidden rounded-[13px] border border-[#E9EDF2]">
                      {[
                        ["US, Canada, Europe, Australia & New Zealand", "5â€“9 business days"],
                        ["United Kingdom", "5â€“8 business days"],
                        ["Other destinations", "5â€“12 business days"],
                        ["Battery products", "4â€“10 business days"],
                      ].map(([region, timing], index) => (
                        <div key={region} className={`flex items-center justify-between gap-3 px-3.5 py-3.5 ${index ? "border-t border-[#ECEEF1]" : ""}`}>
                          <span className="min-w-0 flex-1 text-[11px] leading-[1.65] text-[#626873]">{region}</span>
                          <span className="max-w-[44%] shrink-0 text-right text-[11px] font-semibold leading-[1.55] text-[#303640]">{timing}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] leading-[1.6] text-[#9299A3]">
                      Battery delivery estimates apply after dispatch and may vary by destination and carrier.
                    </p>
                  </div>

                  <div className="flex gap-2.5 rounded-[12px] bg-[#F7F8FA] p-3.5">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#7B8796]" />
                    <p className="text-[11px] leading-[1.7] text-[#747C87]">
                      Delivery times are estimates, not guarantees. Customs, weather, carrier delays and other local disruptions may affect delivery.
                    </p>
                  </div>
                </div>
              ) : activeTrustInfo.title === "30-day returns" ? (
                <div className="space-y-5">
                  {/* Main guarantee */}
                  <div className="overflow-hidden rounded-[16px] border border-[#DCE8F8] bg-gradient-to-br from-[#F4F8FF] via-white to-[#F7FAFF] p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E5F0FF] text-[#1769C2]">
                        <ShieldCheck size={17} strokeWidth={2} />
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#3974B8]">
                        INFIBETTER replacement promise
                      </span>
                    </div>
                    <h3 className="mt-3 text-[21px] font-semibold leading-tight tracking-[-0.04em] text-[#1D2735] sm:text-[24px]">
                      30-Day Replacement Guarantee
                    </h3>
                    <p className="mt-2 text-[12px] font-semibold leading-5 text-[#34465D] sm:text-[13px]">
                      Shop with Confidence. We&apos;ve Got You Covered.
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.75] text-[#667386]">
                      At INFIBETTER, we stand behind the quality of our products. If your item has a verified manufacturing defect within 30 days of delivery, we&apos;ll replace it with a brand-new product at no additional cost.
                    </p>
                    <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-[#DCE8F8] bg-white/90 px-3.5 py-3">
                      <span className="text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#1769C2]">30</span>
                      <span className="text-[11px] leading-[1.5] text-[#667386]">
                        <strong className="block text-[12px] text-[#26364A]">Days from delivery</strong>
                        For verified manufacturing defects
                      </span>
                    </div>
                  </div>

                  {/* What's covered */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">What&apos;s covered</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <ul className="space-y-2.5">
                      {[
                        "Manufacturing defects",
                        "Technical faults caused by manufacturing issues",
                        "Products damaged due to manufacturing defects",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[12px] leading-[1.65] text-[#566273]">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#16845B]" strokeWidth={2.2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Customer promise */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">Our promise to you</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          title: "100% Free Replacement",
                          detail: "A brand-new replacement product.",
                          icon: PackageCheck,
                        },
                        {
                          title: "Free Return Shipping",
                          detail: "We cover return shipping for approved claims.",
                          icon: Truck,
                        },
                        {
                          title: "Free Delivery",
                          detail: "Your replacement ships at no extra charge.",
                          icon: Package,
                        },
                        {
                          title: "Zero Additional Fees",
                          detail: "No hidden or unexpected charges.",
                          icon: BadgeCheck,
                        },
                      ].map(({ title, detail, icon: Icon }) => (
                        <div key={title} className="min-w-0 rounded-[12px] border border-[#E6EBF1] bg-[#F8FAFC] p-3">
                          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-white text-[#3974B8] shadow-[0_1px_3px_rgba(20,35,55,0.07)]">
                            <Icon size={16} strokeWidth={1.8} />
                          </span>
                          <p className="mt-2 text-[11px] font-semibold leading-[1.4] text-[#2D3949]">{title}</p>
                          <p className="mt-1 text-[10px] leading-[1.55] text-[#7B8795]">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* How to request */}
                  <section className="rounded-[14px] border border-[#E6EBF1] p-3.5 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#F0F5FC] text-[#3974B8]">
                        <Mail size={16} />
                      </span>
                      <h3 className="text-[12px] font-semibold text-[#2D3949]">How to request a replacement</h3>
                    </div>
                    <p className="mt-2 text-[11px] leading-[1.7] text-[#687587]">
                      Contact our support team with your order number and clear photos or videos showing the issue. Once the manufacturing defect is verified, we&apos;ll guide you through the replacement process.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("infibetter:open-support"))}
                      className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#1769C2] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#125BA9]"
                    >
                      Contact support
                      <ArrowUpRight size={13} />
                    </button>
                  </section>

                  {/* Important limitations */}
                  <div className="rounded-[12px] border border-[#F0E5D2] bg-[#FFFBF4] p-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9A7848]">Important notes</p>
                    <p className="mt-1.5 text-[11px] leading-[1.7] text-[#786B58]">
                      This guarantee applies exclusively to verified manufacturing defects. It does not cover accidental damage, misuse, improper handling, or damage caused by the customer.
                    </p>
                    <p className="mt-2 text-[10px] font-medium leading-[1.6] text-[#786B58]">
                      Your statutory consumer rights remain unaffected.
                    </p>
                  </div>
                </div>
              ) : activeTrustInfo.title === "Secure checkout" ? (
                <div className="space-y-5">
                  <div className="rounded-[15px] border border-[#DCE8F8] bg-gradient-to-br from-[#F4F8FF] via-white to-[#F8FAFD] p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E5F0FF] text-[#1769C2]">
                        <ShieldCheck size={17} strokeWidth={2} />
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#3974B8]">
                        INFIBETTER payment protection
                      </span>
                    </div>
                    <h3 className="mt-3 text-[21px] font-semibold leading-tight tracking-[-0.04em] text-[#1D2735] sm:text-[24px]">
                      Secure &amp; Trusted Checkout
                    </h3>
                    <p className="mt-2 text-[12px] font-semibold leading-5 text-[#34465D]">
                      Your security and peace of mind are our top priorities.
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.75] text-[#667386]">
                      At INFIBETTER, we make online shopping simple, convenient, and secure through trusted payment processing with PayPal.
                    </p>
                  </div>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">Trusted payment with PayPal</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <div className="flex items-start gap-3 rounded-[13px] border border-[#E6EBF1] bg-[#F8FAFC] p-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#E9EDF2] bg-white">
                        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                          <path d="M12.1 4.2h9.1c4.1 0 6.1 2.1 5.4 5.9-.8 4.3-3.5 6.3-7.6 6.3h-3.2l-1.1 5.1H9.4l2.7-17.3Z" fill="#003087"/>
                          <path d="M8.7 6.3h9.1c4.1 0 6.1 2.1 5.4 5.9-.8 4.3-3.5 6.3-7.6 6.3h-3.2l-1.1 5.1H6l2.7-17.3Z" fill="#009CDE"/>
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#303B4A]">Trusted Payment with PayPal</p>
                        <p className="mt-1 text-[11px] leading-[1.7] text-[#748092]">
                          We partner with PayPal, a globally recognized payment platform, to process your transactions securely and reliably.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="payment-options" className="scroll-mt-24">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">Accepted payment methods</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <p className="text-[11px] leading-[1.7] text-[#687587]">
                      We accept the following payment methods through PayPal, subject to availability at checkout:
                    </p>
                    <div className="mt-3 flex w-full items-center justify-between gap-1.5 rounded-[12px] border border-[#E6EBF1] bg-white px-2 py-2 sm:gap-3 sm:px-4">
                      <span className="flex min-w-0 flex-1 items-center justify-center" aria-label="Visa">
                        <svg viewBox="0 0 64 24" className="h-5 w-full max-w-[48px]" role="img">
                          <text x="32" y="18" textAnchor="middle" fill="#1434CB" fontFamily="Arial, Helvetica, sans-serif" fontSize="21" fontWeight="900" fontStyle="italic">VISA</text>
                        </svg>
                      </span>
                      <span className="flex min-w-0 flex-1 items-center justify-center" aria-label="Mastercard">
                        <svg viewBox="0 0 64 30" className="h-6 w-full max-w-[44px]" role="img">
                          <circle cx="25" cy="15" r="10" fill="#EB001B"/>
                          <circle cx="39" cy="15" r="10" fill="#F79E1B"/>
                          <path d="M32 7.1a10 10 0 0 1 0 15.8 10 10 0 0 1 0-15.8Z" fill="#FF5F00"/>
                        </svg>
                      </span>
                      <span className="flex min-w-0 flex-1 items-center justify-center" aria-label="American Express">
                        <svg viewBox="0 0 92 28" className="h-5 w-full max-w-[54px]" role="img">
                          <rect x="1" y="2" width="90" height="24" rx="4" fill="#2E77BC"/>
                          <text x="46" y="12" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="800">AMERICAN</text>
                          <text x="46" y="21" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="900">EXPRESS</text>
                        </svg>
                      </span>
                      <span className="flex min-w-0 flex-1 items-center justify-center" aria-label="Discover">
                        <svg viewBox="0 0 92 28" className="h-5 w-full max-w-[56px]" role="img">
                          <text x="43" y="18" textAnchor="middle" fill="#252525" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800">DISCOVER</text>
                          <path d="M47 19c7 0 12-2 16-6-3 7-9 10-16 10Z" fill="#F58220"/>
                        </svg>
                      </span>
                      <span className="flex min-w-0 flex-1 items-center justify-center" aria-label="PayPal">
                        <svg viewBox="0 0 132 32" className="h-5 w-full max-w-[66px]" role="img">
                          <path d="M12 3h10c5 0 7 2.5 6 7-.8 4.5-3.6 6.5-8 6.5h-3l-1.2 6H9L12 3Z" fill="#003087"/>
                          <path d="M6 6h10c5 0 7 2.5 6 7-.8 4.5-3.6 6.5-8 6.5h-3l-1.2 6H3L6 6Z" fill="#009CDE"/>
                          <text x="36" y="22" fill="#253B80" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700">PayPal</text>
                        </svg>
                      </span>
                    </div>
                    <p className="mt-2.5 text-[10px] leading-[1.65] text-[#87919E]">
                      You can pay directly with an eligible credit or debit card without creating a PayPal account, where this option is available.
                    </p>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">Your payment security matters</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <div className="space-y-2.5">
                      {[
                        {
                          title: "Secure Payment Processing",
                          detail: "Payments are processed through PayPal's secure payment infrastructure.",
                          icon: ShieldCheck,
                        },
                        {
                          title: "Buyer Protection",
                          detail: "Eligible PayPal transactions may qualify for PayPal Buyer Protection, subject to its terms and conditions.",
                          icon: BadgeCheck,
                        },
                        {
                          title: "Card Payment Convenience",
                          detail: "Pay using a supported credit or debit card without necessarily needing a PayPal account.",
                          icon: CreditCard,
                        },
                        {
                          title: "Payment Privacy",
                          detail: "Enter your payment details only through the secure checkout payment form.",
                          icon: LockKeyhole,
                        },
                      ].map(({ title, detail, icon: Icon }) => (
                        <div key={title} className="flex items-start gap-3 rounded-[12px] border border-[#E9EDF2] bg-[#F8FAFC] p-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#3974B8] shadow-[0_1px_3px_rgba(20,35,55,0.07)]">
                            <Icon size={16} strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#303B4A]">{title}</p>
                            <p className="mt-1 text-[10px] leading-[1.65] text-[#7B8795]">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="rounded-[12px] border border-[#E6EBF1] bg-white p-3.5">
                    <p className="text-[11px] font-semibold text-[#303B4A]">Simple &amp; Transparent Checkout</p>
                    <p className="mt-1.5 text-[11px] leading-[1.7] text-[#687587]">
                      Available payment options are clearly displayed during checkout, allowing you to choose the method that works best for you. Your payment will be processed using your selected payment method.
                    </p>
                  </div>

                  <div className="rounded-[12px] bg-[#F7F8FA] p-3.5">
                    <p className="text-[11px] font-semibold text-[#303B4A]">Need Help?</p>
                    <p className="mt-1 text-[11px] leading-[1.7] text-[#687587]">
                      If you have any questions about a payment or transaction, our customer support team is always here to help.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("infibetter:open-support"))}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1769C2] hover:underline"
                    >
                      Contact support <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <p className="text-center text-[12px] font-semibold text-[#34465D]">
                    Shop with confidence. Your security matters to us.
                  </p>

                  {/* Payment logos placed at the end of the content */}
                  <div className="border-t border-[#E9EDF2] pt-4">
                    <p className="mb-3 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-[#9AA3AF]">
                      Payment methods
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="flex h-8 items-center justify-center rounded-[7px] border border-[#E8EBF0] bg-white px-2.5">
                        <svg viewBox="0 0 64 24" className="h-5 w-12" role="img" aria-label="Visa">
                          <text x="32" y="18" textAnchor="middle" fill="#1434CB" fontFamily="Arial, Helvetica, sans-serif" fontSize="21" fontWeight="900" fontStyle="italic">VISA</text>
                        </svg>
                      </span>
                      <span className="flex h-8 items-center justify-center rounded-[7px] border border-[#E8EBF0] bg-white px-2.5">
                        <svg viewBox="0 0 64 30" className="h-6 w-12" role="img" aria-label="Mastercard">
                          <circle cx="25" cy="15" r="10" fill="#EB001B"/>
                          <circle cx="39" cy="15" r="10" fill="#F79E1B"/>
                          <path d="M32 7.1a10 10 0 0 1 0 15.8 10 10 0 0 1 0-15.8Z" fill="#FF5F00"/>
                        </svg>
                      </span>
                      <span className="flex h-8 items-center justify-center rounded-[7px] border border-[#E8EBF0] bg-white px-2">
                        <svg viewBox="0 0 92 28" className="h-5 w-12" role="img" aria-label="American Express">
                          <rect x="1" y="2" width="90" height="24" rx="4" fill="#2E77BC"/>
                          <text x="46" y="12" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="800">AMERICAN</text>
                          <text x="46" y="21" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="900">EXPRESS</text>
                        </svg>
                      </span>
                      <span className="flex h-8 items-center justify-center rounded-[7px] border border-[#E8EBF0] bg-white px-2">
                        <svg viewBox="0 0 92 28" className="h-5 w-12" role="img" aria-label="Discover">
                          <text x="43" y="18" textAnchor="middle" fill="#252525" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800">DISCOVER</text>
                          <path d="M47 19c7 0 12-2 16-6-3 7-9 10-16 10Z" fill="#F58220"/>
                        </svg>
                      </span>
                      <span className="flex h-8 items-center justify-center rounded-[7px] border border-[#E8EBF0] bg-white px-2.5">
                        <svg viewBox="0 0 100 30" className="h-5 w-14" role="img" aria-label="PayPal">
                          <path d="M30 3h10c5 0 7 2.5 6 7-.8 4.5-3.6 6.5-8 6.5h-3l-1.2 6H27L30 3Z" fill="#003087"/>
                          <path d="M24 6h10c5 0 7 2.5 6 7-.8 4.5-3.6 6.5-8 6.5h-3l-1.2 6H21L24 6Z" fill="#009CDE"/>
                          <text x="65" y="20" fill="#253B80" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700">PayPal</text>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[15px] border border-[#DCE8F8] bg-gradient-to-br from-[#F4F8FF] via-white to-[#F8FAFD] p-4 sm:p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#3974B8]">
                      INFIBETTER customer care
                    </p>
                    <h3 className="mt-2 text-[19px] font-semibold leading-tight tracking-[-0.035em] text-[#1D2735] sm:text-[21px]">
                      We're Here to Help
                    </h3>
                    <p className="mt-2 text-[12px] leading-[1.75] text-[#667386]">
                      Your satisfaction matters to us. Whether you have a question about your order, shipping, delivery, returns, or product information, our support team is always happy to assist.
                    </p>
                    <p className="mt-3 text-[12px] font-semibold text-[#26364A]">
                      We're just an email away.
                    </p>
                  </div>

                  <section>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">
                      Email our support team
                    </p>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("infibetter:open-support"))}
                      className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-[13px] border border-[#DCE5F0] bg-white px-4 py-3 text-left shadow-[0_1px_3px_rgba(20,35,55,0.04)] transition hover:border-[#B8CBE2] hover:bg-[#F8FAFC]"
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] leading-5 text-[#7B8795]">
                          Have a question or need assistance? Reach out anytime.
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] font-semibold text-[#1769C2]">
                          support@infibetter.com
                        </span>
                      </span>
                      <ArrowUpRight size={17} className="shrink-0 text-[#64748B]" />
                    </button>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">How we can help</span>
                      <span className="h-px flex-1 bg-[#E9EDF2]" />
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { title: "Order Support", detail: "Questions about your order, payment, or order status.", icon: PackageCheck },
                        { title: "Shipping & Delivery", detail: "Updates and assistance with your shipment.", icon: Truck },
                        { title: "Product Assistance", detail: "Questions about product features, usage, or technical issues.", icon: Headphones },
                        { title: "Returns & Replacements", detail: "Help with eligible replacement requests and product issues.", icon: RefreshCw },
                      ].map(({ title, detail, icon: Icon }) => (
                        <div key={title} className="flex items-start gap-3 rounded-[12px] border border-[#E9EDF2] bg-[#F8FAFC] p-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#3974B8] shadow-[0_1px_3px_rgba(20,35,55,0.07)]">
                            <Icon size={16} strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#303B4A]">{title}</p>
                            <p className="mt-1 text-[10px] leading-[1.65] text-[#7B8795]">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[13px] border border-[#E6EBF1] p-3.5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D8795]">
                      To help us assist you faster
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        "Your order number.",
                        "A brief description of your question or issue.",
                        "For damaged, defective, or incorrect items, photos or a short video showing the product and its packaging.",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[11px] leading-[1.65] text-[#626D7C]">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#16845B]" strokeWidth={2.2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="rounded-[12px] bg-[#F4F7FA] p-3.5">
                    <p className="text-[11px] font-semibold text-[#303B4A]">Our Commitment to You</p>
                    <p className="mt-1.5 text-[11px] leading-[1.7] text-[#687587]">
                      Every customer matters to us. We aim to provide clear communication, helpful support, and a smooth shopping experience from checkout to delivery and beyond.
                    </p>
                  </div>

                  <p className="text-center text-[12px] font-semibold text-[#34465D]">
                    Thank you for choosing INFIBETTER. We're always here when you need us.
                  </p>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-[#EEECE7] bg-[#FFFEFC] px-5 py-3.5 sm:px-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium tracking-[0.02em] text-[#A0A5AD]">
                  We're here to help
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTrustInfo(null)}
                  className="
                    inline-flex min-h-10 items-center justify-center
                    rounded-full bg-[#17191C] px-6
                    text-[12px] font-semibold text-white
                    transition-colors hover:bg-[#34383D]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[#0071E3] focus-visible:ring-offset-2
                  "
                >
                  Got it
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

    </main>

  );

}