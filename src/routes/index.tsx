
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
        top_seller,
        is_active
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);

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
        featured: Boolean(product.featured),
        best_seller: Boolean(product.best_seller),
        top_seller: Boolean(product.top_seller),
        is_active: product.is_active === true,
      };
    });

    const newArrivals = allProducts
      .filter((product) => product.featured)
      .slice(0, 12);

    const bestSellers = allProducts
      .filter((product) => product.best_seller)
      .slice(0, 12);

    const topSellers = allProducts
      .filter((product) => product.top_seller)
      .slice(0, 12);

    console.log("INFIBETTER HOME PRODUCTS:", {
      total: allProducts.length,
      newArrivals,
      bestSellers,
      topSellers,
    });

    return {
      products: bestSellers,
      newArrivals,
      featured: newArrivals,
      bestSellers,
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
    <main className="min-h-screen bg-[#F7F8FA]">
      <Hero />

      <Collections
        products={data.products}
        newArrivals={data.newArrivals}
      />

      <HomeVideoSection />

      {/* Designed for real life đã được ẩn khỏi trang chủ */}
    </main>
  );
}

