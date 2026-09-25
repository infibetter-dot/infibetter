import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

import {
  BatteryCharging,
  Cable,
  ChevronDown,
  Headphones,
  Package,
  Search,
  SlidersHorizontal,
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
    icon: Smartphone,
  },
  {
    id: "watch",
    label: "Apple Watch",
    icon: Watch,
  },
  {
    id: "airpods",
    label: "AirPods",
    icon: Headphones,
  },
  {
    id: "charging",
    label: "Charging",
    icon: BatteryCharging,
  },
  {
    id: "cables",
    label: "Cables",
    icon: Cable,
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
        const { data: selectedCategory, error: categoryError } =
          await supabase
            .from("categories")
            .select("id,name,slug,parent_id")
            .eq("slug", sp.category)
            .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (selectedCategory) {
          if (selectedCategory.parent_id) {
            // Subcategory: exact match only.
            categoryIds = [selectedCategory.id];
          } else {
            // Parent category: parent + direct children.
            const { data: children, error: childrenError } =
              await supabase
                .from("categories")
                .select("id")
                .eq("parent_id", selectedCategory.id);

            if (childrenError) {
              throw childrenError;
            }

            categoryIds = [
              selectedCategory.id,
              ...(children ?? []).map((item: any) => item.id),
            ];
          }
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
          image_url
        `);

      // Only use real category_id filtering when the URL contains
      // an actual category slug from the categories table.
      if (categoryIds && categoryIds.length > 0) {
        query = query.in("category_id", categoryIds);
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
        throw error;
      }

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
          const isRealCategorySlug =
            Boolean(sp.category) &&
            sp.category !== "all" &&
            sp.category.includes("-");

          if (
            !isRealCategorySlug &&
            activeDevice !== "all" &&
            !matchesDevice(product, activeDevice)
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

  const deviceCounts =
    useMemo(() => {
      const products =
        productsQ.data ?? [];

      const counts: Record<
        string,
        number
      > = {
        all: products.length,
        iphone: 0,
        watch: 0,
        airpods: 0,
        charging: 0,
        cables: 0,
      };

      products.forEach(
        (product: any) => {
          Object.keys(
            CATEGORY_KEYWORDS,
          ).forEach(
            (device) => {
              if (
                matchesDevice(
                  product,
                  device,
                )
              ) {
                counts[
                  device
                ] += 1;
              }
            },
          );
        },
      );

      return counts;
    }, [productsQ.data]);

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

    window.location.href =
      `/shop?category=${device}`;
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
              px-7
              py-12
              md:px-12
              md:py-16
              lg:px-16
              lg:py-20
            "
          >

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

            <div className="relative max-w-[720px]">

              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#6E6E73]
                  md:text-[11px]
                "
              >
                INFIBETTER ACCESSORIES
              </p>

              <h1
                className="
                  text-[42px]
                  font-semibold
                  leading-[1.04]
                  tracking-[-0.045em]
                  text-[#1D1D1F]
                  md:text-[54px]
                  lg:text-[62px]
                "
              >
                Accessories
                <br />
                that fit.
              </h1>

              <p
                className="
                  mt-5
                  max-w-[590px]
                  text-[16px]
                  leading-7
                  text-[#6E6E73]
                  md:text-[18px]
                "
              >
                Cases, chargers,
                cables and everyday
                accessories designed
                to complete your
                setup.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  to="/shop"
                  className="
                    inline-flex
                    h-10
                    items-center
                    rounded-full
                    bg-[#0071E3]
                    px-5
                    text-[13px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#0077ED]
                  "
                >
                  Shop accessories
                </Link>

                <a
                  href="#products"
                  className="
                    inline-flex
                    h-10
                    items-center
                    rounded-full
                    border
                    border-[#D2D2D7]
                    bg-white
                    px-5
                    text-[13px]
                    font-medium
                    text-[#1D1D1F]
                    transition
                    hover:bg-[#FAFAFA]
                  "
                >
                  Browse products
                </a>

              </div>

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

              <div className="relative min-w-[260px]">

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
          py-10
          md:px-8
          md:py-12
        "
      >

        {/* TOOLBAR */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-4
            border-b
            border-[#E5E5E7]
            pb-5
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div className="flex items-center gap-3">

            <h2
              className="
                text-[22px]
                font-semibold
                tracking-[-0.025em]
                text-[#1D1D1F]
              "
            >
              {sp.category && sp.category !== "all"
                ? sp.category
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase(),
                    )
                : "All accessories"}
            </h2>

            <span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[11px] font-medium text-[#6E6E73]">
              {
                filteredProducts.length
              }
            </span>

          </div>

          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 text-[13px] text-[#6E6E73] sm:flex">

              <SlidersHorizontal
                size={15}
              />

              <span>
                Filter & sort
              </span>

            </div>

            {/* SORT */}

            <div className="relative">

              <select
                value={
                  sp.sort ??
                  "newest"
                }
                onChange={(
                  event,
                ) =>
                  changeSort(
                    event.target
                      .value,
                  )
                }
                className="
                  h-9
                  appearance-none
                  rounded-full
                  border
                  border-[#D2D2D7]
                  bg-white
                  px-4
                  pr-9
                  text-[12px]
                  font-medium
                  text-[#1D1D1F]
                  outline-none
                  hover:bg-[#F5F5F7]
                "
              >

                <option value="newest">
                  Newest
                </option>

                <option value="best">
                  Best sellers
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

              </select>

              <ChevronDown
                size={14}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[#6E6E73]
                "
              />

            </div>

          </div>

        </div>

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

      <section className="border-t border-[#E5E5E7] bg-[#F5F5F7]">

        <div
          className="
            mx-auto
            grid
            max-w-[1240px]
            grid-cols-2
            divide-x
            divide-[#D2D2D7]
            px-5
            md:grid-cols-4
            md:px-8
          "
        >

          <div className="px-4 py-8 text-center md:px-8">

            <p className="text-[14px] font-semibold">
              Secure checkout
            </p>

            <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">
              Safe and protected
              payments.
            </p>

          </div>

          <div className="px-4 py-8 text-center md:px-8">

            <p className="text-[14px] font-semibold">
              Tracked shipping
            </p>

            <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">
              Follow your order
              every step.
            </p>

          </div>

          <div className="border-t border-[#D2D2D7] px-4 py-8 text-center md:border-t-0 md:px-8">

            <p className="text-[14px] font-semibold">
              Easy returns
            </p>

            <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">
              Simple support when
              you need it.
            </p>

          </div>

          <div className="border-t border-[#D2D2D7] px-4 py-8 text-center md:border-t-0 md:px-8">

            <p className="text-[14px] font-semibold">
              Built for everyday
            </p>

            <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">
              Accessories that fit
              your setup.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}