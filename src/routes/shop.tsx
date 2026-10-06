import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import banner04 from "@/assets/hero/banner04.png";

import {
  Battery,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Truck,
  BatteryCharging,
  ChevronDown,
  Package,
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

        if (selectedCategory) {
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
            selectedCategory.id,
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
              selectedCategory,
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
          const isLegacyDevice =
            DEVICE_FILTERS.some(
              (item) =>
                item.id === sp.category,
            );

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
            .select("id,slug,parent_id"),
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

      const getCategoryTreeIds = (slug: string) => {
        const selectedCategory = categoryList.find(
          (category: any) => category.slug === slug,
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
    };

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white text-[#1D1D1F]">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="bg-white px-5 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto max-w-[1240px]">

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#F5F5F7]
              aspect-[1273/434]
            "
          >
            {/* BANNER 04 */}
            <img
              src={banner04}
              alt="INFIBETTER accessories"
              className="
                pointer-events-none
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
                opacity-100
                [filter:saturate(1.08)_contrast(1.05)]
              "
            />

            {/* BACKGROUND LIGHT */}

            <div
              className="
                pointer-events-none
                absolute
                right-[-120px]
                top-[-140px]
                h-[420px]
                w-[420px]
                rounded-full
                bg-white
                opacity-60
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-[-180px]
                left-[30%]
                h-[360px]
                w-[360px]
                rounded-full
                bg-white
                opacity-50
                blur-3xl
              "
            />

            {/* CONTENT */}

            <div className="relative z-10 max-w-[720px] pr-0 md:max-w-[560px]">



            </div>

          </div>

        </div>
      </section>

      {/* ===================================================
          DEVICE NAVIGATION
      =================================================== */}

      <section className="border-y border-[#E5E5E7] bg-white">

        <div className="mx-auto max-w-[1240px] px-5 md:px-8">

          <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {DEVICE_FILTERS.map(
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
                      "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition",
                      active
                        ? "border-[#1D1D1F] bg-[#1D1D1F] text-white"
                        : "border-[#D2D2D7] bg-white text-[#424245] hover:bg-[#F5F5F7]",
                    ].join(
                      " ",
                    )}
                  >
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
          px-5
          py-7
          md:px-8
          md:py-9
        "
      >

        {/* CATEGORY */}
        {sp.category &&
          sp.category !== "all" && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-white px-4 py-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">
                  CATEGORY
                </p>
                <p className="mt-0.5 text-[13px] font-medium capitalize text-[#1D1D1F]">
                  {sp.category.replace(/-/g, " ")}
                </p>
              </div>

              <Link
                to="/shop"
                className="text-[12px] font-medium text-[#0071E3] hover:underline"
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

        {!isLoading &&
          filteredProducts.length >
            0 && (
            <div
              className="
                grid
                grid-cols-2
                gap-x-4
                gap-y-8
                md:grid-cols-3
                lg:grid-cols-4
              "
            >

              {filteredProducts.map(
                (
                  product: any,
                ) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    variant={
                      product.best_seller
                        ? "best-seller"
                        : "default"
                    }
                  />
                ),
              )}

            </div>
          )}

      </section>

      {/* ===================================================
          BENEFITS
      =================================================== */}

      <section className="border-t border-[#E5E5E7] bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 md:grid-cols-4">
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
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={[
                  "flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center",
                  index > 0 ? "border-l border-[#E5E5E7]" : "",
                  index > 1 ? "border-t border-[#E5E5E7] md:border-t-0" : "",
                ].join(" ")}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#424245]">
                  <Icon size={18} strokeWidth={1.7} />
                </div>

                <p className="text-[14px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                  {item.title}
                </p>

                <p className="mt-1.5 max-w-[180px] text-[12px] leading-5 text-[#6E6E73]">
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