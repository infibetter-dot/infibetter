import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/best-seller")({
  head: () => ({
    meta: [
      {
        title: "Sản phẩm được yêu thích | Olive Living",
      },
      {
        name: "description",
        content:
          "Khám phá những sản phẩm được khách hàng yêu thích nhất tại Olive Living.",
      },
    ],
  }),
  component: BestSellerPage,
});

function BestSellerPage() {

  const productsQ = useQuery({
  queryKey: ["best-seller-products"],

  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,

  queryFn: async () => {

      const { data } = await supabase
        .from("products")
        .select(`
  id,
  slug,
  name,
  price,
  stock,
  best_seller,
  image_url
`)
        .eq("best_seller", true)
        .order("created_at", {
          ascending: false,
          
        });
        

      return (
        data?.map((item: any) => ({
          ...item,
         
            image_url: item.image_url,
        })) ?? []
      );
    },
  });

  return (
    <div className="container-x py-14">

      <header className="mb-12 text-center">

        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
          Olive Living
        </p>

        <h1 className="mt-4 font-display text-4xl md:text-5xl">
          Được yêu thích nhất
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-neutral-600">
          Những sản phẩm được nhiều khách hàng lựa chọn và đánh giá cao.
        </p>

      </header>

            {productsQ.isLoading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-3xl bg-neutral-100"
            />
          ))}
        </div>
      ) : productsQ.data?.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Chưa có sản phẩm nổi bật
          </h2>

          <p className="mt-3 text-neutral-500">
            Vui lòng đánh dấu Best Seller trong trang quản trị.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {productsQ.data.length} sản phẩm được yêu thích
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {productsQ.data.map((product) => (

            <ProductCard
  key={product.id}
  product={{
    ...product,
    rating: 4.9,
    old_price: Number(product.price) * 1.35,
    discount_percent: 26,
    likes: Math.floor(Math.random() * 400) + 300,
  }}
  variant="best-seller"
/>
            ))}
          </div>
        </>
      )}

          </div>
  );
}