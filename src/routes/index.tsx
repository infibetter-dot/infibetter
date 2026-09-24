import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import Hero from "@/components/home/Hero";
import Collections from "@/components/home/Collections";
import DesignedForRealLife from "@/components/home/DesignedForRealLife";

const homeData = queryOptions({
  queryKey: ["infibetter-home-data"],

  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,

  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
      )
      .eq("featured", true)
      .limit(12);

    if (error) {
      console.error("INFIBETTER HOME PRODUCTS ERROR:", error);
    }

    const products = (data ?? []).map((product) => ({
      ...product,
      old_price: product.compare_at_price,
    }));

    return {
      featured: products,
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

  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeData);
  },

  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homeData);

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      {/* =====================================================
          HERO
      ====================================================== */}

      <Hero />

      {/* =====================================================
          SHOP BY CATEGORY
          FIND YOUR NEXT UPGRADE
      ====================================================== */}

      <Collections products={data.featured} />

      {/* =====================================================
          DESIGNED FOR REAL LIFE
      ====================================================== */}

      <DesignedForRealLife products={data.featured} />
    </main>
  );
}
