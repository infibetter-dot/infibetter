import { createFileRoute } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import Hero from "@/components/home/Hero";
import FeaturedCaseSection from "@/components/home/FeaturedCaseSection";
import Collections from "@/components/home/Collections";
import HomeVideoSection from "@/components/home/HomeVideoSection";
import PowerStationSection from "@/components/home/PowerStationSection";
import MagGoSection from "@/components/home/MagGoSection";

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
        created_at
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
      };
    });

    const newArrivals = allProducts
      .filter((product) => product.featured)
      .slice(0, 12);

    const bestSellers = allProducts
      .filter((product) => product.best_seller)
      .slice(0, 12);

    const bestChoiceProducts = allProducts
      .filter((product) => product.best_choice)
      .slice(0, 4);

    const everydayPlusProducts = allProducts
      .filter((product) => product.everyday_plus)
      .filter((product) => !product.best_choice)
      .slice(0, 4);

    const topSellers = allProducts
      .filter((product) => product.top_seller)
      .slice(0, 12);

    console.log("INFIBETTER HOME COLLECTIONS:", {
      bestChoiceProducts: bestChoiceProducts.map((p) => p.name),
      everydayPlusProducts: everydayPlusProducts.map((p) => p.name),
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
      { title: "INFIBETTER — Charge smarter. Stay connected." },
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
    <main className="min-h-screen w-full overflow-x-clip bg-[#F7F8FA]">
      {/* Main full-width homepage banner */}
      <Hero />

      {/* Featured product banner: single image, full-width */}
      <FeaturedCaseSection />
      <PowerStationSection />
      <MagGoSection />


      {/* Keep product collections aligned to the existing content width */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Collections
          products={data.products}
          newArrivals={data.newArrivals}
        />
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1440px]">
        <HomeVideoSection />
      </div>
    </main>
  );
}
