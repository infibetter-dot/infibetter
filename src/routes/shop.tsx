import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useRef } from "react";
import { trackViewItemList } from "@/lib/analytics";

import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import banner02 from "@/assets/hero/banner in 01.png";
import bannerMobile from "@/assets/hero/banner in mobile 01.png";

import {
  ArrowRight,
  Battery,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Truck,
  BatteryCharging,
  ChevronDown,
  Package,
  Plane,
  Search,
  Smartphone,
  Watch,
} from "lucide-react";

import { z } from "zod";

/* =========================================================
   SEARCH
========================================================= */

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z
    .enum([
      "newest",
      "best",
      "price-low",
      "price-high",
    ])
    .optional(),
  max: z.coerce.number().optional(),
});

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/shop")({
  validateSearch: search,

  head: () => ({
    meta: [
      {
        title: "Shop — INFIBETTER",
      },
      {
        name: "description",
        content:
          "Cases, chargers, cables and everyday accessories for your setup.",
      },
    ],
  }),

  component: ShopPage,
});

/* =========================================================
   DEVICE FILTERS
========================================================= */

const DEVICE_FILTERS = [
  {
    id: "all",
    label: "All",
    icon: Package,
  },
  {
    id: "iphone",
    label: "iPhone",
    categorySlug: "iphone-cases",
    icon: Smartphone,
  },
  {
    id: "watch",
    label: "Apple Watch",
    categorySlug: "watch-bands",
    icon: Watch,
  },
  {
    id: "charging",
    label: "Charging",
    categorySlug: "wireless-charging",
    icon: BatteryCharging,
  },
  {
    id: "power-banks",
    label: "Power Banks",
    categorySlug: "power-banks",
    icon: Battery,
  },
  {
    id: "travel-power",
    label: "Travel Power",
    categorySlug: "travel-power",
    icon: Plane,
  },
];

/* =========================================================
   IPHONE MODELS
========================================================= */

const IPHONE_MODELS = [
  "iPhone 18 Pro Max",
  "iPhone 18 Pro",
  "iPhone 18",
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone 17 Air",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
];

/* =========================================================
   CATEGORY KEYWORDS
========================================================= */

const CATEGORY_KEYWORDS: Record<
  string,
  string[]
> = {
  iphone: [
    "iphone",
    "case",
    "ốp",
    "op",
    "magsafe",
    "magnetic",
  ],

  watch: [
    "watch",
    "apple watch",
    "strap",
    "band",
    "dây đeo",
    "day deo",
  ],

  airpods: [
    "airpods",
    "airpod",
    "earbuds",
    "tai nghe",
  ],

  charging: [
    "charger",
    "charging",
    "sạc",
    "sac",
    "wireless",
    "power bank",
    "adapter",
  ],

  cables: [
    "cable",
    "cáp",
    "cap",
    "usb",
    "lightning",
    "type-c",
    "type c",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(
  value: unknown,
) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}

function matchesDevice(
  product: any,
  device: string,
) {
  if (
    !device ||
    device === "all"
  ) {
    return true;
  }

  const text = normalizeText(
    `${product.name} ${product.slug}`,
  );

  const keywords =
    CATEGORY_KEYWORDS[
      device
    ] ?? [];

  return keywords.some(
    (keyword) =>
      text.includes(
        normalizeText(keyword),
      ),
  );
}

function matchesIphoneModel(
  product: any,
  model: string,
) {
  if (!model) {
    return true;
  }

  const text = normalizeText(
    `${product.name} ${product.slug}`,
  );

  return text.includes(
    normalizeText(model),
  );
}

/* =========================================================
   PAGE
========================================================= */

function ShopPage() {
  const sp = Route.useSearch();

  const activeDevice =
    sp.category ?? "all";

  const selectedModel =
    sp.q ?? "";

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const productsQ = useQuery({
    queryKey: [
      "infibetter-shop-products",
      sp.category,
      sp.q,
      sp.sort,
      sp.max,
    ],

    staleTime:
      1000 * 60 * 5,

    gcTime:
      1000 * 60 * 30,

    refetchOnWindowFocus:
      false,

    queryFn: async () => {
      /*
       * REAL CATEGORY FILTER
       * --------------------
       * The URL uses a category slug:
       * /shop?category=iphone-cases
       *
       * We resolve that slug to the real category ID(s), then
       * filter products by products.category_id.
       *
       * Parent category:
       *   include the parent + its direct children.
       *
       * Child category:
       *   include only that exact category.
       */
      let categoryIds: string[] | null = null;

      if (sp.category && sp.category !== "all") {
        /*
         * CATEGORY SLUG ALIASES
         * ---------------------
         * Some existing Mega Menu links use "wireless-chargers",
         * while the actual DB slug is "wireless-charging".
         * Normalize these aliases before querying Supabase.
         */
        const CATEGORY_SLUG_ALIASES: Record<string, string> = {
          "wireless-chargers": "wireless-charging",
          "travel-chargers": "travel-power",
          "travel-charging": "travel-power",
          "travel-adapters": "travel-power",
        };

        const resolvedCategorySlug =
          CATEGORY_SLUG_ALIASES[sp.category] ??
          sp.category;

        /*
         * REAL CATEGORY TREE FILTER
         * --------------------------
         * Every category selected from the Mega Menu represents a
         * collection, not necessarily a leaf product category.
         *
         * Therefore we always include:
         *   1. The selected category itself
         *   2. Every descendant category below it
         *
         * Example:
         *   Wireless Charging
         *   ├── MagFold Qi2
         *   ├── MagBank Qi2
         *   └── 3-in-1 Chargers
         *
         * Clicking Wireless Charging must show all products assigned
         * to Wireless Charging OR any of its child categories.
         *
         * We intentionally load the category tree instead of assuming
         * that only parent categories are aggregate collections. This
         * also keeps the logic working if a child later gets its own
         * children.
         */
        // Resolve the slug to the real category first.
        const { data: selectedCategory, error: categoryError } =
          await supabase
            .from("categories")
            .select("id,name,slug,parent_id")
            .eq("slug", resolvedCategorySlug)
            .maybeSingle();

        if (categoryError) {
          console.error(
            "INFIBETTER CATEGORY LOOKUP ERROR:",
            categoryError,
          );
          throw categoryError;
        }

        // Travel Power may be stored under a slightly different slug.
        // Resolve by its category name as a safe fallback; do not broaden
        // the product query if no matching category exists.
        let resolvedSelectedCategory = selectedCategory;

        if (
          !resolvedSelectedCategory &&
          resolvedCategorySlug === "travel-power"
        ) {
          const { data: travelCategories, error: travelCategoryError } =
            await supabase
              .from("categories")
              .select("id,name,slug,parent_id")
              .ilike("name", "%travel%");

          if (travelCategoryError) {
            console.error(
              "INFIBETTER TRAVEL POWER CATEGORY FALLBACK ERROR:",
              travelCategoryError,
            );
            throw travelCategoryError;
          }

          const normalizeCategoryName = (value: unknown) =>
            String(value ?? "")
              .trim()
              .toLowerCase()
              .replace(/[_-]+/g, " ")
              .replace(/\\s+/g, " ");

          const acceptedTravelNames = [
            "travel power",
            "travel chargers",
            "travel charging",
            "travel adapters",
            "travel adapter",
          ];

          resolvedSelectedCategory =
            (travelCategories ?? []).find((category: any) =>
              acceptedTravelNames.includes(
                normalizeCategoryName(category.name),
              ),
            ) ?? null;
        }

        if (resolvedSelectedCategory) {
          /*
           * Do the tree expansion directly from the categories table.
           *
           * This intentionally does NOT depend on a Supabase RPC.
           * It avoids failures caused by RPC permissions, PostgREST
           * schema cache, or function exposure.
           */
          const { data: allCategories, error: treeError } =
            await supabase
              .from("categories")
              .select("id,parent_id");

          if (treeError) {
            console.error(
              "INFIBETTER CATEGORY TREE ERROR:",
              treeError,
            );
            throw treeError;
          }

          const ids = new Set<string>([
            resolvedSelectedCategory.id,
          ]);

          let changed = true;

          while (changed) {
            changed = false;

            for (const category of allCategories ?? []) {
              if (
                category.parent_id &&
                ids.has(category.parent_id) &&
                !ids.has(category.id)
              ) {
                ids.add(category.id);
                changed = true;
              }
            }
          }

          categoryIds = Array.from(ids);

          console.log(
            "INFIBETTER SHOP CATEGORY:",
            {
              slug: sp.category,
              resolvedCategorySlug,
              selectedCategory: resolvedSelectedCategory,
              categoryIds,
            },
          );
        } else {
          console.warn(
            "INFIBETTER SHOP: category slug not found:",
            {
              requestedSlug: sp.category,
              resolvedCategorySlug,
            },
          );
        }
      }

      let query = supabase
        .from("products")
        .select(`
          id,
          slug,
          name,
          price,
          compare_at_price,
          stock,
          category_id,
          best_seller,
          created_at,
          image_url,
          is_active
        `)
        .eq("is_active", true);

      // Only use real category_id filtering when the URL contains
      // an actual category slug from the categories table.
      if (sp.category && sp.category !== "all") {
        if (categoryIds && categoryIds.length > 0) {
          query = query.in(
            "category_id",
            categoryIds,
          );
        } else {
          // A requested real category that cannot be resolved must not
          // accidentally show every product.
          return [];
        }
      }

      /* -----------------------------------------------
         SORT
      ------------------------------------------------ */

      if (
        sp.sort === "best"
      ) {
        query = query
          .order(
            "best_seller",
            {
              ascending: false,
            },
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          );
      } else if (
        sp.sort ===
        "price-low"
      ) {
        query = query.order(
          "price",
          {
            ascending: true,
          },
        );
      } else if (
        sp.sort ===
        "price-high"
      ) {
        query = query.order(
          "price",
          {
            ascending: false,
          },
        );
      } else {
        query = query.order(
          "created_at",
          {
            ascending: false,
          },
        );
      }

      const {
        data,
        error,
      } = await query.range(
        0,
        99,
      );

      if (error) {
        console.error(
          "INFIBETTER SHOP PRODUCTS ERROR:",
          error,
        );
        throw error;
      }

      console.log(
        "INFIBETTER SHOP RESULT:",
        {
          category: sp.category,
          categoryIds,
          count: data?.length ?? 0,
          products: data ?? [],
        },
      );

      return (
        data?.map(
          (item: any) => ({
            ...item,

            /*
             * ProductCard expects
             * old_price.
             */
            old_price:
              item.compare_at_price,

            image_url:
              item.image_url,
          }),
        ) ?? []
      );
    },
  });

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const products =
        productsQ.data ?? [];

      return products.filter(
        (product: any) => {
          /*
           * DEVICE
           *
           * Legacy device filters (iphone/watch/charging/etc.)
           * remain available when they are used directly.
           *
           * Real category slugs such as:
           * iphone-cases
           * wireless-charging
           * magfold-qi2
           * power-banks
           * ...
           * are already filtered at Supabase level by category_id.
           */
          // Real category slugs are already filtered by Supabase
          // using category_id + the complete descendant tree.
          //
          // Only apply the legacy device keyword filter when the URL
          // is actually one of the legacy device filters.
          // Only apply legacy keyword filters to legacy device IDs.
          // "power-banks" is a real category slug and must be filtered
          // by category_id above, not by product-name keywords.
          const isLegacyDevice =
            Boolean(sp.category && CATEGORY_KEYWORDS[sp.category]);

          if (
            isLegacyDevice &&
            activeDevice !== "all" &&
            !matchesDevice(
              product,
              activeDevice,
            )
          ) {
            return false;
          }

          /* IPHONE MODEL */

          if (
            activeDevice ===
              "iphone" &&
            selectedModel &&
            !matchesIphoneModel(
              product,
              selectedModel,
            )
          ) {
            return false;
          }

          /* MAX PRICE */

          if (
            sp.max !==
              undefined &&
            Number(
              product.price,
            ) >
              Number(sp.max)
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      productsQ.data,
      activeDevice,
      selectedModel,
      sp.max,
    ]);

      // Track view_item_list for Shop
  const trackedListRef = useRef("");

  useEffect(() => {
    if (productsQ.isLoading || filteredProducts.length === 0) {
      return;
    }

    const listKey = [
      sp.category ?? "all",
      sp.q ?? "",
      sp.sort ?? "newest",
      sp.max ?? "",
      ...filteredProducts.map((product: any) => product.id),
    ].join("|");

    if (trackedListRef.current === listKey) {
      return;
    }

    trackedListRef.current = listKey;

    const listName = sp.category
      ? `Shop - ${sp.category}`
      : "Shop - All Products";

    trackViewItemList(
      listName,
      filteredProducts.map((product: any, index: number) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        index: index + 1,
      })),
    );
  }, [
    productsQ.isLoading,
    filteredProducts,
    sp.category,
    sp.q,
    sp.sort,
    sp.max,
  ]);

  /* =======================================================
     DEVICE COUNTS
  ======================================================= */

  const deviceCountsQ = useQuery({
    queryKey: ["infibetter-shop-device-counts"],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
        await Promise.all([
          supabase
            .from("products")
            .select("id,category_id")
            .eq("is_active", true),

          supabase
            .from("categories")
            .select("id,name,slug,parent_id"),
        ]);

      if (productsError) {
        console.error(
          "INFIBETTER DEVICE COUNTS PRODUCTS ERROR:",
          productsError,
        );
        throw productsError;
      }

      if (categoriesError) {
        console.error(
          "INFIBETTER DEVICE COUNTS CATEGORY ERROR:",
          categoriesError,
        );
        throw categoriesError;
      }

      const categoryList = categories ?? [];
      const productList = products ?? [];

      const categoryIdsBySlug: Record<string, string[]> = {};

      const categoryNameFallbacks: Record<string, string[]> = {
        "travel-power": [
          "travel power",
          "travel chargers",
          "travel charging",
          "travel adapters",
          "travel adapter",
        ],
      };

      const normalizeCategoryName = (value: unknown) =>
        String(value ?? "")
          .trim()
          .toLowerCase()
          .replace(/[_-]+/g, " ")
          .replace(/\\s+/g, " ");

      const getCategoryTreeIds = (slug: string) => {
        const selectedCategory =
          categoryList.find((category: any) => category.slug === slug) ??
          categoryList.find((category: any) =>
            (categoryNameFallbacks[slug] ?? []).includes(
              normalizeCategoryName(category.name),
            ),
          );

        if (!selectedCategory) {
          return [];
        }

        const ids = new Set<string>([
          selectedCategory.id,
        ]);

        let changed = true;

        while (changed) {
          changed = false;

          for (const category of categoryList) {
            if (
              category.parent_id &&
              ids.has(category.parent_id) &&
              !ids.has(category.id)
            ) {
              ids.add(category.id);
              changed = true;
            }
          }
        }

        return Array.from(ids);
      };

      const categorySlugs = [
        "iphone-cases",
        "watch-bands",
        "wireless-charging",
        "power-banks",
        "travel-power",
      ];

      categorySlugs.forEach((slug) => {
        categoryIdsBySlug[slug] =
          getCategoryTreeIds(slug);
      });

      const countProductsForCategory = (
        categoryIds: string[],
      ) => {
        if (categoryIds.length === 0) {
          return 0;
        }

        const ids = new Set(categoryIds);

        return productList.filter(
          (product: any) =>
            product.category_id &&
            ids.has(product.category_id),
        ).length;
      };

      return {
        all: productList.length,
        categoryIdsBySlug,

        iphone: countProductsForCategory(
          categoryIdsBySlug["iphone-cases"] ?? [],
        ),

        watch: countProductsForCategory(
          categoryIdsBySlug["watch-bands"] ?? [],
        ),

        charging: countProductsForCategory(
          categoryIdsBySlug["wireless-charging"] ?? [],
        ),

        "power-banks": countProductsForCategory(
          categoryIdsBySlug["power-banks"] ?? [],
        ),

        "travel-power": countProductsForCategory(
          categoryIdsBySlug["travel-power"] ?? [],
        ),
      };
    },
  });

  const deviceCounts =
    deviceCountsQ.data ?? {
      all: 0,
      iphone: 0,
      watch: 0,
      charging: 0,
      "power-banks": 0,
      "travel-power": 0,
      categoryIdsBySlug: {},
    };

  const shopCategorySections = useMemo(() => {
    const categoryConfig = [
      {
        slug: "iphone-cases",
        title: "iPhone Cases",
        subtitle: "Everyday protection, made personal.",
      },
      {
        slug: "watch-bands",
        title: "Apple Watch",
        subtitle: "Comfort and style for every day.",
      },
      {
        slug: "wireless-charging",
        title: "Wireless Charging",
        subtitle: "A cleaner way to power your devices.",
      },
      {
        slug: "power-banks",
        title: "Power Banks",
        subtitle: "Portable power, wherever you go.",
      },
      {
        slug: "travel-power",
        title: "Travel Power",
        subtitle: "Charging essentials for life on the move.",
      },
    ];

    const categoryIdsBySlug = deviceCountsQ.data?.categoryIdsBySlug ?? {};

    return categoryConfig
      .map((category) => {
        const ids = new Set<string>(
          categoryIdsBySlug[category.slug] ?? [],
        );

        const items = filteredProducts.filter(
          (product: any) =>
            product.category_id && ids.has(product.category_id),
        );

        return { ...category, items };
      })
      .filter((category) => category.items.length > 0);
  }, [deviceCountsQ.data, filteredProducts]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function changeDevice(
    device: string,
  ) {
    if (
      device === "all"
    ) {
      window.location.href =
        "/shop";

      return;
    }

    const selectedFilter = DEVICE_FILTERS.find(
      (item) => item.id === device,
    );

    const categorySlug =
      selectedFilter?.categorySlug ?? device;

    window.location.href =
      `/shop?category=${categorySlug}`;
  }

  function changeModel(
    model: string,
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "category",
      "iphone",
    );

    if (model) {
      params.set(
        "q",
        model,
      );
    }

    window.location.href =
      `/shop?${params.toString()}`;
  }

  function changeSort(
    value: string,
  ) {
    const params =
      new URLSearchParams();

    if (
      activeDevice !==
      "all"
    ) {
      params.set(
        "category",
        activeDevice,
      );
    }

    if (selectedModel) {
      params.set(
        "q",
        selectedModel,
      );
    }

    if (
      value !== "newest"
    ) {
      params.set(
        "sort",
        value,
      );
    }

    if (
      sp.max !==
      undefined
    ) {
      params.set(
        "max",
        String(sp.max),
      );
    }

    const query =
      params.toString();

    window.location.href =
      query
        ? `/shop?${query}`
        : "/shop";
  }

  const isLoading =
    productsQ.isLoading;

  const categoryBannerTitle: Record<string, string> = {
    "iphone-cases": "iPhone Cases",
    iphone: "iPhone Cases",
    "power-banks": "Power Banks",
    "wireless-charging": "Wireless Charging",
    "wireless-chargers": "Wireless Charging",
    "watch-bands": "Apple Watch Bands",
    "travel-power": "Travel Power",
  };

  const currentCategoryTitle = sp.category
    ? categoryBannerTitle[sp.category] ?? sp.category.replace(/-/g, " ")
    : "Power More. Carry Less.";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="relative block min-h-screen w-full min-w-0 bg-white text-[#1D1D1F]">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-white px-0 py-0">
        <div className="w-full max-w-none">
          <div className="relative isolate w-full overflow-hidden bg-[#F4F5F7]">
            {/* Separate artwork: mobile composition has dedicated top-safe space for copy. */}
            <img
              src={bannerMobile}
              alt={`${currentCategoryTitle} mobile banner`}
              className="relative z-0 block h-auto w-full object-contain object-center sm:hidden"
            />
            <img
              src={banner02}
              alt={`${currentCategoryTitle} banner`}
              className="relative z-0 hidden h-auto w-full object-contain object-center sm:block"
            />

            {/* Mobile copy stays in the clear upper area of the dedicated mobile artwork. */}
            <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center px-5 pt-[11%] text-center sm:hidden">
              <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#667085]">
                INFIBETTER · SHOP BY CATEGORY
              </p>
              <h1 className="max-w-[340px] text-[clamp(22px,6.2vw,30px)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#17191D]">
                {currentCategoryTitle}
              </h1>
              <p className="mt-2 max-w-[320px] text-[10px] leading-[1.45] text-[#566174]">
                {sp.category === "power-banks"
                  ? "Reliable power, wherever your day takes you."
                  : sp.category === "wireless-charging" || sp.category === "wireless-chargers"
                    ? "A simpler way to power your everyday setup."
                    : sp.category === "watch-bands"
                      ? "Comfort and style for every day."
                      : sp.category === "travel-power"
                        ? "Compact charging essentials for life on the move."
                        : sp.category
                          ? "Thoughtful protection and everyday functionality."
                          : "Discover smarter Qi2 charging essentials, designed for everyday power."}
              </p>
            </div>

            {/* Desktop copy remains left-aligned over the desktop banner. */}
            <div className="absolute inset-y-0 left-0 z-20 hidden w-full max-w-[600px] flex-col items-start justify-center px-6 py-6 sm:flex sm:px-9 md:px-12 lg:ml-[max(4vw,calc((100vw-1240px)/2))]">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#667085] sm:text-[10px]">
                INFIBETTER · SHOP BY CATEGORY
              </p>
              <h1 className="max-w-[460px] text-[30px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#17191D] sm:text-[38px] md:text-[44px]">
                {currentCategoryTitle}
              </h1>
              <p className="mt-3 max-w-[390px] text-[12px] leading-5 text-[#566174] sm:text-[13px] sm:leading-6">
                {sp.category === "power-banks"
                  ? "Reliable power, wherever your day takes you. Discover compact charging essentials made to keep you connected."
                  : sp.category === "wireless-charging" || sp.category === "wireless-chargers"
                    ? "A simpler way to power your everyday setup, with effortless wireless charging and thoughtfully designed accessories."
                    : sp.category === "watch-bands"
                      ? "Refresh your everyday look with comfortable, considered accessories designed to fit your routine."
                      : sp.category === "travel-power"
                        ? "Stay powered on the move with compact charging essentials designed for work, travel, and everything between."
                        : sp.category
                          ? "Thoughtful protection, refined details, and everyday functionality — find the case that fits your style."
                          : "Discover smarter Qi2 charging essentials, designed for everyday power."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          BEST SELLERS — directly below the hero banner
      =================================================== */}

      {!sp.category && !isLoading && (
        <section className="bg-white py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A94A3]">
                  CUSTOMER FAVORITES
                </p>
                <h2 className="text-[21px] font-semibold leading-tight tracking-[-0.04em] text-[#17191D] sm:text-[26px]">
                  Best Sellers
                </h2>
              </div>
              <Link
                to="/shop"
                search={{ sort: "best" } as never}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 text-[10px] font-semibold text-[#263445] shadow-sm transition hover:border-[#FF4D00] hover:text-[#FF4D00] sm:h-10 sm:px-4 sm:text-[11px]"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {(() => {
              const bestSellers = (productsQ.data ?? [])
                .filter((product: any) => product.best_seller)
                .slice(0, 8);

              if (bestSellers.length === 0) return null;

              return (
                <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-4 sm:px-0">
                  {bestSellers.map((product: any, index: number) => {
                    const currentPrice = Number(product.price) || 0;
                    const comparePrice = Number(
                      product.compare_at_price ?? product.old_price ?? 0,
                    );
                    const hasDiscount = comparePrice > currentPrice && currentPrice > 0;
                    const discountPercent = hasDiscount
                      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
                      : 0;
                    const ratingValue = Number(
                      product.rating ?? product.average_rating ?? product.rating_average ?? 0,
                    );
                    const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;

                    return (
                      <div
                        key={product.id}
                        className="w-[72vw] max-w-[280px] min-w-0 flex-none snap-start sm:w-[calc((100%_-_1rem)/2)] sm:max-w-none md:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)]"
                      >
                        <Link
                          to="/products/$slug"
                          params={{ slug: product.slug }}
                          className="group block h-full overflow-hidden rounded-[18px] border border-[#ECEEF1] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                          aria-label={`View ${product.name}`}
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-white">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                loading="lazy"
                                draggable={false}
                                className="absolute inset-0 block h-full w-full bg-white object-contain object-center px-1 pb-1 pt-7 sm:px-2 sm:pb-2 sm:pt-8"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[#98A2B3]">
                                Product image
                              </div>
                            )}

                            <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-3.5rem)] items-center gap-1.5">
                              {hasDiscount && (
                                <span className="inline-flex items-center bg-[#FF4D00] px-2.5 py-1.5 text-[10px] font-bold leading-none text-white shadow-sm sm:px-3 sm:py-1.5 sm:text-[11px]">
                                  Save {discountPercent}%
                                </span>
                              )}
                              {hasRating && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#ECEEF1] bg-white/95 px-2 py-1 text-[9px] font-semibold leading-none text-[#344054] shadow-sm sm:text-[10px]">
                                  <span className="text-[#F59E0B]">★</span>
                                  {ratingValue.toFixed(1)}
                                </span>
                              )}
                            </div>

                            <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#24364B] shadow-sm transition-transform group-hover:translate-x-0.5">
                              <ArrowRight size={15} />
                            </span>
                          </div>

                          <div className="px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
                            <h3 className="min-h-[38px] text-[13px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#20242B] sm:text-[15px]">
                              {product.name}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="text-[14px] font-bold tracking-[-0.02em] text-[#0877F9] sm:text-[16px]">
                                ${currentPrice.toFixed(2)} USD
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] font-medium text-[#98A2B3] line-through sm:text-[11px]">
                                  ${comparePrice.toFixed(2)} USD
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ===================================================
          DEVICE NAVIGATION
      =================================================== */}

      <section className="border-y border-[#E5E5E7] bg-white">

        <div className="mx-auto max-w-[1240px] px-5 md:px-8">

          <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {DEVICE_FILTERS.filter(
              (item) =>
                item.id === "all" ||
                (deviceCounts[item.id] ?? 0) > 0,
            ).map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  activeDevice ===
                  item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      changeDevice(
                        item.id,
                      )
                    }
                    className={[
                      "relative isolate flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-[13px] font-medium backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-200",
                      active
                        ? "border-white/20 bg-gradient-to-b from-[#30323A] to-[#15171D] text-white shadow-[0_5px_12px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.22)]"
                        : "border-white/90 bg-white/55 text-[#424245] shadow-[0_3px_10px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] hover:border-white hover:bg-white/80 hover:shadow-[0_5px_14px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,1)]",
                    ].join(
                      " ",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={
                        active
                          ? "pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white/15 to-transparent"
                          : "pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-full bg-gradient-to-b from-white/90 to-transparent"
                      }
                    />
                    <Icon
                      size={15}
                      strokeWidth={
                        1.8
                      }
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>

                    <span
                      className={
                        active
                          ? "text-white/60"
                          : "text-[#86868B]"
                      }
                    >
                      {deviceCounts[
                        item.id
                      ] ?? 0}
                    </span>
                  </button>
                );
              },
            )}

          </div>

        </div>

      </section>

      {/* ===================================================
          IPHONE COMPATIBILITY
      =================================================== */}

      {activeDevice ===
        "iphone" && (
        <section className="border-b border-[#E5E5E7] bg-white">

          <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              <div>

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#86868B]
                  "
                >
                  COMPATIBILITY
                </p>

                <h2
                  className="
                    mt-2
                    text-[28px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[#1D1D1F]
                  "
                >
                  Start with your iPhone.
                </h2>

                <p className="mt-2 text-[14px] text-[#6E6E73]">
                  Find accessories made
                  for your iPhone.
                </p>

              </div>

              {/* SELECT */}

              <div className="relative z-10 min-w-[260px]" px-7 pt-12 md:px-12 md:pt-16 lg:px-16 lg:pt-20>

                <select
                  value={
                    selectedModel
                  }
                  onChange={(
                    event,
                  ) =>
                    changeModel(
                      event.target
                        .value,
                    )
                  }
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-[#D2D2D7]
                    bg-white
                    px-4
                    pr-10
                    text-[14px]
                    font-medium
                    text-[#1D1D1F]
                    outline-none
                    transition
                    focus:border-[#0071E3]
                    focus:ring-2
                    focus:ring-[#0071E3]/10
                  "
                >

                  <option value="">
                    All iPhone models
                  </option>

                  {IPHONE_MODELS.map(
                    (model) => (
                      <option
                        key={model}
                        value={model}
                      >
                        {model}
                      </option>
                    ),
                  )}

                </select>

                <ChevronDown
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#6E6E73]
                  "
                />

              </div>

            </div>

            {/* ACTIVE MODEL */}

            {selectedModel && (
              <div className="mt-5 flex items-center gap-2">

                <span className="rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[12px] font-medium text-[#424245]">
                  {selectedModel}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    changeModel(
                      "",
                    )
                  }
                  className="text-[12px] font-medium text-[#0071E3] hover:underline"
                >
                  Clear
                </button>

              </div>
            )}

          </div>

        </section>
      )}

      {/* ===================================================
          PRODUCT AREA
      =================================================== */}

      <section
        id="products"
        className="
          mx-auto
          max-w-[1240px]
          px-4
          py-7
          md:px-8
          md:py-9
        "
      >

        {/* CATEGORY */}
        {sp.category &&
          sp.category !== "all" && (
            <div className="relative isolate mb-5 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 via-white/70 to-[#EEF2F7]/75 px-4 py-3 shadow-[0_5px_16px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl">
              {/* Subtle mirror-glass reflection */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-3 top-px h-1/2 rounded-full bg-gradient-to-b from-white/90 via-white/35 to-transparent"
              />
              <div className="relative z-10 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">
                  CATEGORY
                </p>
                <p className="mt-0.5 break-words text-[13px] font-medium capitalize text-[#1D1D1F]">
                  {sp.category.replace(/-/g, " ")}
                </p>
              </div>

              <Link
                to="/shop"
                className="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border border-white/90 bg-gradient-to-b from-white/95 to-white/65 px-3.5 py-2 text-[12px] font-semibold text-[#0071E3] shadow-[0_2px_7px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-xl transition-all duration-200 hover:from-white hover:to-white/85 hover:shadow-[0_4px_10px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                View all
              </Link>
            </div>
          )}

        {/* SEARCH */}

        {sp.q &&
          activeDevice !==
            "iphone" && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#F5F5F7] px-4 py-3">

              <Search
                size={15}
                className="text-[#6E6E73]"
              />

              <span className="text-[13px] text-[#424245]">
                Showing results for

                <strong className="ml-1 font-semibold text-[#1D1D1F]">
                  {sp.q}
                </strong>
              </span>

            </div>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {isLoading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">

            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={
                    index
                  }
                  className="overflow-hidden rounded-2xl"
                >

                  <div className="aspect-square animate-pulse rounded-2xl bg-[#F5F5F7]" />

                  <div className="space-y-3 px-1 pt-3">

                    <div className="h-3 w-3/4 animate-pulse rounded bg-[#F5F5F7]" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#F5F5F7]" />

                    <div className="h-4 w-1/3 animate-pulse rounded bg-[#F5F5F7]" />

                  </div>

                </div>
              ),
            )}

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!isLoading &&
          filteredProducts.length ===
            0 && (
            <div
              className="
                flex
                min-h-[380px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-[#E5E5E7]
                bg-[#F5F5F7]
                px-6
                text-center
              "
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">

                <Search
                  size={20}
                  className="text-[#86868B]"
                />

              </div>

              <h3 className="text-[20px] font-semibold tracking-[-0.025em]">
                No accessories found.
              </h3>

              <p className="mt-2 max-w-md text-[14px] leading-6 text-[#6E6E73]">
                Try another device,
                iPhone model or
                remove some filters.
              </p>

              <Link
                to="/shop"
                className="mt-5 text-[14px] font-medium text-[#0071E3] hover:underline"
              >
                View all accessories
              </Link>

            </div>
          )}

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        {!isLoading && filteredProducts.length > 0 && (
          sp.category ? (
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product: any, index: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={product.best_seller ? "best-seller" : "default"}
                  itemListName={`Shop - ${sp.category}`}
                  itemIndex={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-14 lg:space-y-16">
              {shopCategorySections.map((category) => (
                <section
                  key={category.slug}
                  aria-labelledby={`shop-category-${category.slug}`}
                  className="border-b border-[#ECEEF2] pb-9 last:border-b-0 last:pb-0 sm:pb-11"
                >
                  <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
                    <div className="min-w-0">
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A94A3] sm:text-[10px]">
                        INFIBETTER COLLECTION
                      </p>
                      <h2
                        id={`shop-category-${category.slug}`}
                        className="text-[21px] font-semibold leading-tight tracking-[-0.04em] text-[#17191D] sm:text-[26px] lg:text-[30px]"
                      >
                        {category.title}
                      </h2>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#737B87] sm:text-[13px]">
                        {category.subtitle}
                      </p>
                    </div>

                    <Link
                      to="/shop"
                      search={{ category: category.slug } as never}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 text-[10px] font-semibold text-[#263445] shadow-sm transition hover:border-[#FF4D00] hover:text-[#FF4D00] sm:h-10 sm:px-4 sm:text-[11px]"
                    >
                      View all <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="grid w-full grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                    {category.items.slice(0, 4).map((product: any, index: number) => {
                      const currentPrice = Number(product.price) || 0;
                      const comparePrice = Number(
                        product.old_price ?? product.compare_at_price ?? 0,
                      );
                      const hasDiscount =
                        comparePrice > currentPrice && currentPrice > 0;
                      const discountPercent = hasDiscount
                        ? Math.round(
                            ((comparePrice - currentPrice) / comparePrice) * 100,
                          )
                        : 0;

                      return (
                        <div key={product.id} className="relative min-w-0">
                          {hasDiscount && (
                            <span className="absolute left-3 top-3 z-20 inline-flex items-center bg-[#FF4D00] px-2.5 py-1.5 text-[10px] font-bold leading-none text-white shadow-sm sm:px-3 sm:py-1.5 sm:text-[11px]">
                              Save {discountPercent}%
                            </span>
                          )}
                          <ProductCard
                            product={product}
                            variant="default"
                            itemListName={`Shop - ${category.title}`}
                            itemIndex={index + 1}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )
        )}

      </section>

      {/* ===================================================
          BENEFITS
      =================================================== */}

      <section className="border-t border-[#E5E5E7] bg-white px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
          {[
            {
              icon: ShieldCheck,
              title: "Secure checkout",
              description: "Safe and protected payments.",
            },
            {
              icon: Truck,
              title: "Tracked shipping",
              description: "Follow your order every step.",
            },
            {
              icon: RotateCcw,
              title: "Easy returns",
              description: "Simple support when you need it.",
            },
            {
              icon: CheckCircle2,
              title: "Built for everyday",
              description: "Accessories that fit your setup.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="relative isolate flex min-h-[86px] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 via-white/65 to-[#EEF2F7]/80 px-2.5 py-3 text-center shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl md:min-h-[96px] md:px-4 md:py-4"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-2 top-px h-1/2 rounded-full bg-gradient-to-b from-white/95 via-white/35 to-transparent"
                />
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/65 text-[#424245] shadow-[inset_0_1px_0_rgba(255,255,255,1)] md:h-8 md:w-8">
                  <Icon size={15} strokeWidth={1.7} />
                </div>

                <p className="relative z-10 text-[11px] font-semibold leading-4 tracking-[-0.01em] text-[#1D1D1F] md:text-[13px]">
                  {item.title}
                </p>

                <p className="relative z-10 hidden max-w-[170px] text-[10px] leading-4 text-[#6E6E73] sm:block md:text-[11px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}