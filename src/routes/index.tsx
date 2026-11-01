
import { createFileRoute } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import Hero from "@/components/home/Hero";
import Collections from "@/components/home/Collections";
import HomeVideoSection from "@/components/home/HomeVideoSection";

const homeData = queryOptions({
  queryKey: ["infibetter-home-data"],
  staleTime: 0,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: true,
  refetchOnMount: "always",

  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        slug,
        name,
        price,
        compare_at_price,
        stock,
        image_url,
        color_preview,
        featured,
        best_seller,
        best_choice,
        everyday_plus,
        top_seller,
        is_active,
        category_id,
        category:categories (
          slug,
          name
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("INFIBETTER HOME PRODUCTS ERROR:", error);
      throw error;
    }

    const allProducts = (data ?? []).map((product) => {
      const price = Number(product.price);
      const compareAtPrice = Number(product.compare_at_price);

      return {
        ...product,

        price: Number.isFinite(price) ? price : 0,

        compare_at_price: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        priceOld: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        old_price: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        featured: product.featured === true,
        best_seller: product.best_seller === true,
        best_choice: product.best_choice === true,
        everyday_plus: product.everyday_plus === true,
        top_seller: product.top_seller === true,
        is_active: product.is_active === true,

        category_slug: product.category?.slug ?? null,
        category_name: product.category?.name ?? null,
      };
    });

    // NEW ARRIVALS
    const newArrivals = allProducts
      .filter((product) => product.featured)
      .slice(0, 12);

    // BEST SELLERS
    const bestSellers = allProducts
      .filter((product) => product.best_seller)
      .slice(0, 12);

    // BEST CHOICE: Admin-selected products only.
    const bestChoiceProducts = allProducts
      .filter((product) => product.best_choice)
      .slice(0, 4);

    // EVERYDAY PLUS: Admin-selected products only.
    // Exclude Best Choice products to prevent duplication.
    const bestChoiceIds = new Set(
      bestChoiceProducts.map((product) => product.id)
    );

    const everydayPlusProducts = allProducts
      .filter((product) => product.everyday_plus)
      .filter((product) => !bestChoiceIds.has(product.id))
      .slice(0, 4);

    // TOP SELLERS
    const topSellers = allProducts
      .filter((product) => product.top_seller)
      .slice(0, 12);

    console.log("INFIBETTER HOME PRODUCTS:", {
      total: allProducts.length,
      newArrivals: newArrivals.length,
      bestSellers: bestSellers.length,
      bestChoiceProducts: bestChoiceProducts.map((product) => product.name),
      everydayPlusProducts: everydayPlusProducts.map(
        (product) => product.name
      ),
      topSellers: topSellers.length,
    });

    return {
      products: allProducts,
      newArrivals,
      featured: newArrivals,
      bestSellers,
      bestChoiceProducts,
      everydayPlusProducts,
      topSellers,
    };
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "INFIBETTER — Charge smarter. Stay connected.",
      },
      {
        name: "description",
        content:
          "Discover smart tech accessories designed for everyday life. Charge, carry and connect with INFIBETTER.",
      },
    ],
  }),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homeData),

  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homeData);

  return (
    <main className="min-h-screen w-full bg-[#F7F8FA]">
      <div className="mx-auto w-full max-w-[1440px]">
        <Hero />

        <div className="px-4 sm:px-6 lg:px-8">
          <Collections
            products={data.products}
            newArrivals={data.newArrivals}
            bestChoiceProducts={data.bestChoiceProducts}
            everydayPlusProducts={data.everydayPlusProducts}
          />
        </div>

        <div className="mt-8">
          <HomeVideoSection />
        </div>
      </div>
    </main>
  );
}
