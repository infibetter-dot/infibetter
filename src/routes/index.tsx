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
    /*
     * =====================================================
     * LOAD HOME PRODUCTS
     * =====================================================
     *
     * INFIBETTER:
     *
     * featured    = New Arrivals
     * best_seller = Best Sellers
     * top_seller  = Top Seller
     *
     * Load a larger pool first, then split the products
     * into the correct sections.
     */

    const { data, error } = await supabase
      .from("products")
      .select(
        `
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
          top_seller
        `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(
        "INFIBETTER HOME PRODUCTS ERROR:",
        error
      );

      throw error;
    }

    /*
     * =====================================================
     * NORMALIZE PRODUCTS
     * =====================================================
     */

    const allProducts = (data ?? []).map((product) => {
      const price = Number(product.price);
      const compareAtPrice = Number(
        product.compare_at_price
      );

      return {
        ...product,

        // Giá chính
        price: Number.isFinite(price) ? price : 0,

        // Giá cũ
        compare_at_price: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        // Legacy aliases
        priceOld: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        old_price: Number.isFinite(compareAtPrice)
          ? compareAtPrice
          : 0,

        // Boolean flags
        featured: Boolean(product.featured),
        best_seller: Boolean(product.best_seller),
        top_seller: Boolean(product.top_seller),
      };
    });

    /*
     * =====================================================
     * NEW ARRIVALS
     * =====================================================
     *
     * Admin:
     * "Sản phẩm mới" → featured = true
     */

    const newArrivals = allProducts
      .filter((product) => product.featured === true)
      .slice(0, 12);

    /*
     * =====================================================
     * BEST SELLERS
     * =====================================================
     *
     * Admin:
     * "Được yêu thích" → best_seller = true
     */

    const bestSellers = allProducts
      .filter((product) => product.best_seller === true)
      .slice(0, 12);

    /*
     * =====================================================
     * TOP SELLERS
     * =====================================================
     *
     * Dùng cho các section khác nếu cần sau này.
     */

    const topSellers = allProducts
      .filter((product) => product.top_seller === true)
      .slice(0, 12);

    console.log(
      "INFIBETTER HOME PRODUCTS:",
      {
        total: allProducts.length,
        newArrivals,
        bestSellers,
        topSellers,
      }
    );

    return {
      /*
       * Collections:
       *
       * products    → Best Sellers
       * newArrivals → New Arrivals
       */
      products: bestSellers,
      newArrivals,

      /*
       * Giữ featured để các component cũ
       * vẫn có thể sử dụng nếu cần.
       */
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
        title:
          "INFIBETTER — Charge smarter. Stay connected.",
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
      {/* HERO */}
      <Hero />

      {/* =================================================
          FIND YOUR NEXT UPGRADE
          
          Best Sellers:
          products = best_seller === true

          New Arrivals:
          newArrivals = featured === true
      ================================================== */}

      <Collections
        products={data.products}
        newArrivals={data.newArrivals}
      />

      {/* =================================================
          DESIGNED FOR REAL LIFE
          
          Keep using New Arrivals here because this
          section is based on the products currently
          marked as new in Admin.
      ================================================== */}

      <DesignedForRealLife
        products={data.newArrivals}
      />
    </main>
  );
}