import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";

import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

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

} from "lucide-react";

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

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [openProductFaq, setOpenProductFaq] = useState<string | null>(null);

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

  const specs = (product.product_specifications ?? [])

    .slice()

    .sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

  const usps = (product.product_usps ?? [])

    .slice()

    .sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))

    .slice(0, 4);

  const faqItems = [

    {

      question: "Tech specs",

      type: "specs",

    },

    {

      question: "FAQs",

      type: "faq",

    },

    {

      question: "How to use",

      type: "howto",

      answer:

        "Please follow the instructions included with the product. If instructions are not provided, contact our support team before use.",

    },

  ];

  const productFaqs = (product.product_faqs ?? [])

    .filter((faq: any) => faq?.is_visible !== false)

    .slice()

    .sort(

      (a: any, b: any) =>

        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),

    );

  function addToCart(options: { openCart?: boolean; showToast?: boolean } = {}) {

    if (!inStock) {

      toast.error("This product is currently out of stock");

      return;

    }

    const image =

      activeImage ||

      product.image_url ||

      productImages[0]?.image_url ||

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

    if (options.showToast !== false) {
      toast.success("Added to cart");
    }
    if (options.openCart !== false) {
      window.dispatchEvent(new Event("infibetter:open-cart"));
    }

  }

  function expressCheckout() {
    if (!inStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    // Add the selected product configuration, then proceed directly to checkout.
    addToCart({ openCart: false, showToast: false });
    navigate({ to: "/checkout" });
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
  <span className="tracking-[1px] text-[#00B67A]" aria-hidden="true">★★★★★</span>
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

                      <span className="inline-flex h-[22px] items-center rounded-full bg-[#E8F8EE] px-2 text-[11px] font-bold leading-none text-[#168447]">

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
                    {usps.slice(0, 3).map((item: any) => {
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
                            <span
                              className="h-[15px] w-[15px] shrink-0"
                              aria-hidden="true"
                            />
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
                    <span className="min-w-0 truncate text-[11px] font-medium text-[#6E6E73]">
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
                          className={`group flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border border-[#252525] bg-white p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,1)]"
                              : "border border-transparent bg-transparent p-[3px] hover:bg-[#F3F3F4]"
                          }`}
                        >
                          <span
                            className={`block h-full w-full rounded-full border ${
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
                    <span className="text-[11px] font-medium text-[#6E6E73]">
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
                          className={`inline-flex min-h-[38px] w-full min-w-0 items-center justify-center rounded-full border px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border-[#1D1D1F] bg-[#1D1D1F] text-white"
                              : "border-[#E5E5E7] bg-white text-[#45454B] hover:border-[#99999F]"
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

              {/* Quantity + CTA */}

              <div className="mt-3 pt-0">

                <div className="flex items-center justify-between">

                  <span className="text-[13px] font-semibold">Quantity</span>

                  <div className="flex h-9 items-center rounded-[10px] border border-[#D2D2D7] bg-white">

                    <button

                      type="button"

                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}

                      className="flex h-9 w-9 items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F]"

                    >

                      <Minus size={14} />

                    </button>

                    <span className="w-8 text-center text-[13px] font-medium">

                      {quantity}

                    </span>

                    <button

                      type="button"

                      onClick={() =>

                        setQuantity((value) =>

                          Math.min(

                            Math.max(1, Number(selectedVariant?.stock ?? product.stock ?? 1)),

                            value + 1,

                          ),

                        )

                      }

                      className="flex h-9 w-9 items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F]"

                    >

                      <Plus size={14} />

                    </button>

                  </div>

                </div>

                <button

                  ref={primaryAddToCartRef}

                  type="button"

                  onClick={addToCart}

                  disabled={!inStock}

                  className="mt-2.5 flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#0071E3] px-6 text-[14px] font-semibold text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:bg-[#D2D2D7]"

                >

                  <ShoppingBag size={16} />

                  Add to cart

                </button>

                <button

                  type="button"

                  onClick={buyNow}

                  disabled={!inStock}

                  className="mt-1.5 flex h-[40px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#FFC439] px-6 text-[14px] font-semibold text-[#003087] transition hover:bg-[#F7B928] disabled:cursor-not-allowed disabled:opacity-50"

                  aria-label="Pay with PayPal"

                >

                  <span className="font-bold tracking-[-0.04em]">PayPal</span>

                </button>

                <button
                  type="button"
                  onClick={expressCheckout}
                  disabled={!inStock}
                  className="mt-3 inline-flex min-h-8 w-full items-center justify-center gap-1.5 bg-transparent p-0 text-[12px] font-medium text-[#5F6875] underline decoration-[#B8C0CA] underline-offset-4 transition-colors hover:text-[#17212F] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Express checkout"
                >
                  <span>Express Checkout</span>
                  <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
                </button>

              </div>



              {/* Benefits / Trust Features — aligned with INFIBETTER policies */}
              <section className="mt-4 w-full min-w-0" aria-label="Shopping benefits">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777F89]">
                    Shop with confidence
                  </p>
                  <span className="h-px flex-1 bg-[#ECEEF1]" aria-hidden="true" />
                </div>

                <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    {
                      icon: Truck,
                      text: "Tracked delivery",
                      hint: "Tracking after dispatch",
                      description:
                        "Orders are generally processed within 1–2 business days before dispatch. After dispatch, tracking details are sent so you can follow your delivery. Estimated transit times are 5–9 business days for the US, Canada, Europe, and Australia/New Zealand; 5–8 business days for the UK; and 5–12 business days for other destinations. Battery products may take approximately 4–10 business days after dispatch, depending on destination and carrier. These are estimates, not guarantees. Customs, weather, carrier delays, and other local disruptions may affect delivery. For help, email infibetter@gmail.com.",
                    },
                    {
                      icon: RotateCcw,
                      text: "30-day returns",
                      hint: "Clear return policy",
                      description:
                        "You may request a standard return within 30 days of delivery. Items must be unused, unopened, complete, and in their original packaging. For standard non-defective returns, customers are responsible for tracked return shipping unless applicable law says otherwise. We charge no restocking fee (0%). Please contact infibetter@gmail.com and receive return approval and instructions before sending anything back. Defective, damaged, or incorrect items are handled under the Refund Policy, and mandatory consumer rights remain unaffected.",
                    },
                    {
                      icon: ShieldCheck,
                      text: "Secure checkout",
                      hint: "Payment options at checkout",
                      description:
                        "Available payment methods are shown at checkout. Your payment is processed through the method you select during checkout. Please enter payment information only through the checkout payment form. For questions about a payment or transaction, contact infibetter@gmail.com.",
                    },
                    {
                      icon: Check,
                      text: "Customer support",
                      hint: "We're here to help",
                      description:
                        "Need help with an order, delivery, return, refund, or product? Contact INFIBETTER at infibetter@gmail.com. For order-related requests, include your order number and a clear description of the issue. For damaged, defective, or incorrect items, please contact us as soon as possible and include photos or video of the item and its packaging.",
                    },
                  ].map(({ icon: Icon, text, hint, description }) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setActiveTrustInfo({ title: text, description, icon: Icon })}
                      aria-haspopup="dialog"
                      className="group flex min-h-[60px] min-w-0 items-center gap-2 rounded-[10px] border border-[#E9EBEF] bg-[#F7F8FA] p-2 text-left outline-none transition-all duration-200 hover:border-[#D8DDE5] hover:bg-[#F2F4F7] hover:shadow-[0_4px_12px_rgba(20,30,45,0.06)] focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 active:translate-y-0 sm:min-h-[64px] sm:gap-2.5 sm:rounded-[11px] sm:p-2.5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-white bg-white text-[#34465D] shadow-[0_1px_3px_rgba(20,30,45,0.05)] sm:h-8 sm:w-8">
                        <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block whitespace-normal break-words text-[11px] font-semibold leading-4 text-[#303640] sm:text-[12px]">
                          {text}
                        </span>
                        <span className="mt-0.5 block whitespace-normal break-words text-[9px] leading-3.5 text-[#858C96] sm:text-[10px]">
                          {hint}
                        </span>
                      </span>

                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="shrink-0 text-[#9299A3] transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#34465D]"
                      />
                    </button>
                  ))}
                </div>
              </section>

              {/* Description */}
              {product.description && (

                <div className="mt-5 mb-4 rounded-xl border border-[#E5E8ED] bg-[#F8FAFC] px-4 py-3.5 shadow-[0_2px_8px_rgba(16,24,40,0.04)]">

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

                    className="flex min-h-8 w-full items-center justify-between gap-3 text-left"

                  >

                    <span className="text-[14px] font-bold tracking-[-0.01em] text-[#202833]">

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

                      className="prose prose-sm mt-4 max-w-none whitespace-pre-line break-words text-[13px] leading-6 text-[#6E6E73] [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"

                      dangerouslySetInnerHTML={{ __html: product.description }}

                    />

                  )}

                </div>

              )}




            </div>

          </aside>

        </div>

      </section>

            {/* Product video carousel — displayed above Lifestyle */}

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

            {productVideos.length > 1 && <p className="mt-2 text-center text-[11px] text-[#86868B] sm:hidden">Swipe to explore more videos →</p>}

          </div>

        </section>

      )}

{/* Lifestyle gallery — only Lifestyle images */}

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

{/* FAQ / Product information */}

      <section className="border-y border-[#ECEEF1] bg-[#F7F8FA]">

        <div className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-14 lg:py-16">

          <div className="mx-auto w-full max-w-[920px]">

            <div className="mb-5 text-left sm:mb-6">

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#858991]">

                Product details

              </p>

              <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.04em] text-[#17191C] sm:text-[28px]">

                Need to know more?

              </h2>

              <p className="mt-1.5 text-[13px] leading-5 text-[#737780] sm:text-[14px]">

                The details that help you choose with confidence.

              </p>

            </div>

            <div className="overflow-hidden rounded-[16px] border border-[#E4E6EA] bg-white shadow-[0_2px_10px_rgba(20,24,32,0.035)]">

              {faqItems.map((faq, index) => (

                <div

                  key={faq.question}

                  className={index < faqItems.length - 1 ? "border-b border-[#E5E5EA]" : ""}

                >

                  <button

                    type="button"

                    onClick={() => {
                      const nextOpen = openFaq !== index;
                      setOpenFaq((value) => (value === index ? null : index));

                      if (nextOpen) {
                        trackProductInteraction("faq_expand", {
                          product_id: String(product.id),
                          product_name: product.name,
                          interaction_type: "main_faq",
                          interaction_value: faq.question,
                        });
                      }
                    }}

                    aria-expanded={openFaq === index}
                    className={`group flex min-h-[58px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8F9FB] sm:min-h-[62px] sm:gap-3.5 sm:px-5 ${
                      openFaq === index ? "bg-[#FAFBFC]" : "bg-white"
                    }`}

                  >

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-[#555D68]">

                      {index === 0 && (

                        <SlidersHorizontal size={19} strokeWidth={1.5} />

                      )}

                      {index === 1 && (

                        <Smartphone size={19} strokeWidth={1.5} />

                      )}

                      {index === 2 && (

                        <CircleHelp size={19} strokeWidth={1.5} />

                      )}

                      {index === 3 && (

                        <BookOpen size={19} strokeWidth={1.5} />

                      )}

                    </span>

                    <span className="flex-1 text-[13px] font-semibold tracking-[-0.01em] text-[#25282D] sm:text-[14px]">

                      {faq.question}

                    </span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E7E9ED] text-[#656B75] transition-colors group-hover:border-[#D5D9DF]">

                      <Plus

                        size={18}

                        strokeWidth={1.6}

                        className={`transition-transform duration-200 ${

                          openFaq === index ? "rotate-45" : ""

                        }`}

                      />

                    </span>

                  </button>

                  {openFaq === index && (

                    <div

                      className={`px-4 pb-5 pt-1 sm:px-5 sm:pb-6 ${

                        faq.type === "specs" || faq.type === "faq"

                          ? ""

                          : "pl-[60px] sm:pl-[68px]"

                      }`}

                    >

                      {faq.type === "specs" ? (

                        specs.length > 0 ||

                        product.material ||

                        product.dimensions ||

                        product.color ||

                        product.light_source ||

                        product.power_source ||

                        product.warranty ? (

                          <div className="overflow-hidden rounded-[10px] border border-[#ECECF0]">

                            {[

                              ...specs.map((spec: any) => ({

                                id: spec.id,

                                label: spec.label,

                                value: spec.value,

                              })),

                              ...(product.material

                                ? [{ id: "material", label: "Material", value: product.material }]

                                : []),

                              ...(product.dimensions

                                ? [{ id: "dimensions", label: "Dimensions", value: product.dimensions }]

                                : []),

                              ...(product.color

                                ? [{ id: "color", label: "Color", value: product.color }]

                                : []),

                              ...(product.light_source

                                ? [{ id: "light_source", label: "Light source", value: product.light_source }]

                                : []),

                              ...(product.power_source

                                ? [{ id: "power_source", label: "Power source", value: product.power_source }]

                                : []),

                              ...(product.warranty

                                ? [{ id: "warranty", label: "Warranty", value: product.warranty }]

                                : []),

                            ].map((item: any, index: number, items: any[]) => (

                              <div

                                key={item.id}

                                className={`grid grid-cols-[43%_57%] items-start text-[13px] sm:grid-cols-[38%_62%] ${

                                  index < items.length - 1

                                    ? "border-b border-[#ECECF0]"

                                    : ""

                                } ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFB]"}`}

                              >

                                <span className="min-w-0 px-3 py-3.5 text-[#77777C] sm:px-4">

                                  {item.label}

                                </span>

                                <span className="min-w-0 border-l border-[#F0F0F2] px-3 py-3.5 text-left font-medium leading-5 text-[#1D1D1F] sm:px-4">

                                  {item.value}

                                </span>

                              </div>

                            ))}

                          </div>

                        ) : (

                          <p className="text-[13px] leading-6 text-[#6E6E73]">

                            No technical specifications have been added for this product yet.

                          </p>

                        )

                      ) : faq.type === "faq" ? (

                        productFaqs.length > 0 ? (

                          <div className="overflow-hidden rounded-[10px] border border-[#ECECF0]">

                            {productFaqs.map((item: any, faqIndex: number) => {

                              const itemOpen = openProductFaq === item.id;

                              return (

                                <div

                                  key={item.id}

                                  className={

                                    faqIndex < productFaqs.length - 1

                                      ? "border-b border-[#ECECF0]"

                                      : ""

                                  }

                                >

                                  <button

                                    type="button"

                                    onClick={() => {
                                      const nextOpen = openProductFaq !== item.id;
                                      setOpenProductFaq((value) =>
                                        value === item.id ? null : item.id,
                                      );

                                      if (nextOpen) {
                                        trackProductInteraction("faq_expand", {
                                          product_id: String(product.id),
                                          product_name: product.name,
                                          interaction_type: "product_faq",
                                          interaction_value: item.question,
                                        });
                                      }
                                    }}

                                    className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FAFAFA]"

                                  >

                                    <span className="flex-1 text-[13px] font-medium text-[#1D1D1F]">

                                      {item.question}

                                    </span>

                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#6E6E73]">

                                      <Plus

                                        size={16}

                                        strokeWidth={1.6}

                                        className={`transition-transform duration-200 ${

                                          itemOpen ? "rotate-45" : ""

                                        }`}

                                      />

                                    </span>

                                  </button>

                                  {itemOpen && (

                                    <div className="px-4 pb-5 pr-10">

                                      <p className="whitespace-pre-line text-[13px] leading-6 text-[#6E6E73]">

                                        {item.answer}

                                      </p>

                                    </div>

                                  )}

                                </div>

                              );

                            })}

                          </div>

                        ) : (

                          <p className="text-[13px] leading-6 text-[#6E6E73]">

                            No FAQs have been added for this product yet.

                          </p>

                        )

                      ) : (

                        <p className="max-w-[760px] whitespace-pre-line text-[13px] leading-6 text-[#6E6E73]">

                          {faq.answer}

                        </p>

                      )}

                    </div>

                  )}

                </div>

              ))}

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

                View all →

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
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5px)] left-3 right-[76px] z-[90] md:hidden">
          <div className="flex min-h-[80px] w-full min-w-0 items-center gap-2 rounded-[18px] border border-[#E9EBEF] bg-white/95 px-3 py-2 shadow-[0_6px_24px_rgba(16,24,40,0.13)] backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium leading-4 text-[#737780]">
                {product.name}
              </p>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className={`text-[16px] font-bold leading-5 tracking-[-0.035em] ${hasDiscount ? "text-[#00A878]" : "text-[#1D1D1F]"}`}>
                  {formatProductPrice(price, safeCurrency)}
                </p>
                {hasDiscount && (
                  <>
                    <p className="text-[10px] font-medium leading-4 text-[#969BA3] line-through">
                      {formatProductPrice(comparePrice, safeCurrency)}
                    </p>
                    <span className="inline-flex h-[18px] items-center rounded-full bg-[#E8F7EF] px-1.5 text-[9px] font-bold leading-none text-[#138653]">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#E7E9ED] bg-[#F7F8FA] text-[#303640] transition-colors hover:bg-[#EEF0F3] active:scale-[0.97]"
            >
              <ShoppingBag size={17} strokeWidth={1.9} />
            </button>

            <button
              type="button"
              onClick={buyNow}
              aria-label="Buy now"
              className="flex h-10 shrink-0 items-center justify-center rounded-[12px] bg-[#17212F] px-3.5 text-[12px] font-semibold text-white shadow-[0_2px_5px_rgba(16,24,40,0.12)] transition-colors hover:bg-[#26364A] active:scale-[0.97]"
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
                      INFIBETTER · SHOP WITH CONFIDENCE
                    </p>
                    <h2
                      id="trust-info-title"
                      className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#1D1D1F] sm:text-[20px]"
                    >
                      {activeTrustInfo.title}
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
                      <strong className="font-semibold text-[#252A32]">1–2 business days</strong>{" "}
                      before dispatch. Once your order is on its way, tracking details are sent so you can follow its journey.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex min-h-[112px] flex-col rounded-[14px] border border-[#E5EAF0] bg-[#F7F8FA] p-4">
                      <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-[#9299A3]">Processing time</p>
                      <p className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#252A32]">1–2 days</p>
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
                        ["US, Canada, Europe, Australia & New Zealand", "5–9 business days"],
                        ["United Kingdom", "5–8 business days"],
                        ["Other destinations", "5–12 business days"],
                        ["Battery products", "4–10 business days"],
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
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-[#E9EDF2] bg-[#F7F8FA] p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9299A3]">Return window</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#252A32]">30</span>
                      <span className="text-[12px] font-medium text-[#626873]">days from delivery</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-[#747C87]">You may request a standard return within 30 days of delivery.</p>
                  </div>

                  <div>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9299A3]">Return conditions</p>
                    <ul className="space-y-2.5">
                      {[
                        "Items must be unused and unopened.",
                        "Items must be complete and in their original packaging.",
                        "Contact us and receive return approval and instructions before sending anything back.",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-[#626873]">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#5F806D]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-[12px] border border-[#E9EDF2] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9299A3]">Restocking fee</p>
                      <p className="mt-1 text-[17px] font-semibold text-[#252A32]">0%</p>
                      <p className="text-[10px] text-[#858C96]">No restocking fee</p>
                    </div>
                    <div className="rounded-[12px] border border-[#E9EDF2] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9299A3]">Return shipping</p>
                      <p className="mt-1 text-[12px] font-semibold leading-5 text-[#252A32]">Customer-paid</p>
                      <p className="text-[10px] leading-4 text-[#858C96]">Tracked shipping for standard returns</p>
                    </div>
                  </div>

                  <p className="text-[10px] leading-[1.7] text-[#9299A3]">
                    For standard non-defective returns, customers are responsible for tracked return shipping unless applicable law says otherwise. Defective, damaged or incorrect items are handled under the Refund Policy. Mandatory consumer rights remain unaffected.
                  </p>
                </div>
              ) : activeTrustInfo.title === "Secure checkout" ? (
                <div className="space-y-3.5">
                  <p className="text-[13px] leading-6 text-[#626873]">
                    We make checkout straightforward. Your available payment methods are displayed clearly when you place your order.
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 rounded-[13px] border border-[#E9EDF2] bg-[#F7F8FA] p-3.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#53657A] shadow-sm">
                        <ShoppingBag size={16} />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-[#303640]">Choose your payment method</p>
                        <p className="mt-1 text-[11px] leading-5 text-[#7B838E]">Available payment options are shown at checkout.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[13px] border border-[#E9EDF2] bg-[#F7F8FA] p-3.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#53657A] shadow-sm">
                        <ShieldCheck size={16} />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-[#303640]">Payment processing</p>
                        <p className="mt-1 text-[11px] leading-5 text-[#7B838E]">Your payment is processed through the method you select during checkout.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-[#E9EDF2] px-3.5 py-3">
                    <p className="text-[11px] leading-[1.7] text-[#747C87]">
                      For your security, enter payment information only through the checkout payment form. For questions about a payment or transaction, contact our support team.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[13px] leading-6 text-[#626873]">
                    Need help with an order, delivery, return, refund or product? Our support team is here to help.
                  </p>

                  <a
                    href="mailto:infibetter@gmail.com"
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-[#E5EAF0] bg-[#F7F8FA] p-4 transition hover:border-[#CAD3DE] hover:bg-[#F2F5F8]"
                  >
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9299A3]">Email our team</p>
                      <p className="mt-1 truncate text-[13px] font-semibold text-[#273444]">infibetter@gmail.com</p>
                    </div>
                    <ArrowUpRight size={17} className="shrink-0 text-[#64748B]" />
                  </a>

                  <div>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9299A3]">To help us assist you faster</p>
                    <ul className="space-y-2.5">
                      {[
                        "Include your order number.",
                        "Describe the issue clearly.",
                        "For damaged, defective or incorrect items, include photos or a video of the item and its packaging.",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-[#626873]">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#5F806D]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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

