import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/home/Hero";
import NewArrival from "@/components/home/NewArrival";
import Collections from "@/components/home/Collections";
import Lookbook from "@/components/home/Lookbook";
import FlashSale from "@/components/home/FlashSale";
import Newsletter from "@/components/home/Newsletter";
import Vouchers from "@/components/home/Vouchers";
import BedsideCollection from "@/components/home/BedsideCollection";
import BestSeller from "@/components/home/BestSeller";
import Under399 from "@/components/home/Under399";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import FeaturedCollectionShowcase from "@/components/home/FeaturedCollectionShowcase";
import FeaturedCollectionShowcaseReverse from "@/components/home/FeaturedCollectionShowcaseReverse";
import FurnitureCollectionShowcase from "@/components/home/FurnitureCollectionShowcase";
import FloorLampCollectionShowcase from "@/components/home/FloorLampCollectionShowcase";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import FlashSalePopup from "@/components/home/FlashSalePopup";
import CustomerFeedbackGallery from "@/components/home/CustomerFeedbackGallery";
import BF08VoucherPopup from "@/components/BF08VoucherPopup";
import OliveTrustSection from "@/components/home/OliveTrustSection";
import ScrollToTopBottom from "@/components/home/ScrollToTopBottom";


const homeData = queryOptions({
  queryKey: ["home-data"],

  staleTime: 1000 * 60 * 10, // Cache 10 phÃºt
  gcTime: 1000 * 60 * 30, // Giá»¯ cache 30 phÃºt
  refetchOnWindowFocus: false, // KhÃ´ng gá»i láº¡i khi quay láº¡i tab

  queryFn: async () => {
  
const [
  featured,
  bedside,
  bestSellers,
  under399,
  memphisProducts,
  furnitureProducts,
  floorLampProducts,
] = await Promise.all([

  // FEATURED
  supabase
    .from("products")
    .select(
      "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
    )
    .eq("featured", true)
    .limit(9),

  // BEDSIDE
  supabase
    .from("products")
    .select(
      "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
    )
    .eq(
      "category_id",
      "8c71807e-4a94-4304-bff7-a4d5208cd5b8"
    )
    .limit(4),

  // BEST SELLERS
  supabase
    .from("products")
    .select(
      "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
    )
    .eq("top_seller", true),

  // UNDER 399
  supabase
    .from("products")
    .select(
      "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
    )
    .lte("price", 399000)
    .order("price")
    .limit(20),

  // MEMPHIS 32 + MEMPHIS 20
  supabase
    .from("products")
    .select(
      "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
    )
    .or(
      "name.ilike.%Memphis 32%,name.ilike.%Memphis 20%"
    ),

  // FURNITURE
  supabase
  .from("products")
  .select(
    "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
  )
  .or(
    "name.ilike.%Montara%,name.ilike.%AERO%,name.ilike.%Curva%"
  )
,
  // FLOOR LAMPS — BAUHAUS + MEMPHIS 20 + HALF ROUND
  supabase
    .from("products")
    .select("id,slug,name,price,compare_at_price,stock"
    )
    .or(
      "name.ilike.%HALF ROUND%,name.ilike.%MEMPHIS 20%,name.ilike.%BAUHAUS%,name.ilike.%FISHING%"
    )
    .limit(4)


]);


console.log("TOP SELLER DATA", bestSellers.data);
console.log("TOP SELLER ERROR", bestSellers.error);

const mapProducts = (list: any[]) =>
  (list ?? []).map((p) => ({
    ...p,
    old_price: p.compare_at_price,
  }));
console.log("UNDER399 DATA:", under399.data);
console.log("UNDER399 ERROR:", under399.error);
return {
  featured: mapProducts(featured.data),

  bedside: mapProducts(bedside.data),

  bestSellers: mapProducts(bestSellers.data),

  under399: mapProducts(under399.data),

  memphisProducts: mapProducts(memphisProducts.data),

  furnitureProducts: mapProducts(furnitureProducts.data),
  floorLampProducts: mapProducts(floorLampProducts.data),

  categories: [

        {
          id: "1",
          slug: "den-ban",
          name: "ÄÃ¨n bÃ n",
          description: "ÄÃ¨n ngá»§, Ä‘Ã¨n decor",
        },
        {
          id: "2",
          slug: "den-dung",
          name: "ÄÃ¨n Ä‘á»©ng",
          description: "Floor lamp phÃ²ng khÃ¡ch",
        },
        {
          id: "3",
          slug: "den-tha",
          name: "ÄÃ¨n tháº£",
          description: "ÄÃ¨n tháº£ tráº§n hiá»‡n Ä‘áº¡i",
        },
        {
          id: "4",
          slug: "den-tuong",
          name: "ÄÃ¨n tÆ°á»ng",
          description: "Wall lamp trang trÃ­",
        },
        {
          id: "5",
          slug: "den-khong-day",
          name: "ÄÃ¨n khÃ´ng dÃ¢y",
          description: "Cordless lamp collection",
        },
      ],
    };
  },
});

export const Route = createFileRoute("/")({

head: () => ({
  meta: [
    {
      title: "OLIVE LIVING — Nội thất tinh tế cho ngôi nhà bạn",
    },
    {
      name: "description",
      content: "Khám phá bộ sưu tập nội thất tối giản và tinh tế.",
    },
  ],
}),

  loader: ({ context }) => { context.queryClient.ensureQueryData(homeData); },
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(homeData);

  return (
    <div>
     {/* <WelcomeVoucherModal /> */}
      <BF08VoucherPopup />
<Hero />
{/*<Services />*/}
<Collections />

{/* BRAND STORY / VIDEO */}
<section className="bg-white py-8 sm:py-10 lg:py-16">
  <div className="container-x">
    <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 xl:gap-16">

      {/* VIDEO */}
      <div className="flex w-full justify-center lg:justify-start">
        <div
          className="
            relative
            aspect-square
            w-full
            max-w-[460px]
            overflow-hidden
            rounded-[28px]
            shadow-[0_18px_50px_rgba(47,53,40,0.10)]
            lg:max-w-none
            lg:rounded-[32px]
            xl:rounded-[36px]
          "
        >
          <video
            src="/videos/olive-living.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block h-full w-full object-cover"
          />

          {/* CTA overlay — centered horizontally, near the bottom of the video */}
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center">
            <Link
              to="/shop"
              className="
                group
                flex
                h-[42px]
                min-w-[155px]
                items-center
                justify-between
                rounded-full
                border
                border-white/50
                bg-black/45
                px-4
                text-[13px]
                font-medium
                text-white
                shadow-[0_4px_18px_rgba(0,0,0,0.18)]
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-white/70
                hover:bg-black/60
                active:scale-[0.97]
              "
            >
              <span>Khám phá ngay</span>

              <span
                className="
                  ml-2
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  text-white/90
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
          max-w-xl
          lg:flex
          lg:min-h-[430px]
          lg:flex-col
          lg:justify-center
          lg:pl-2
          xl:pl-6
        "
      >

        <p
          className="
            text-xs
            font-medium
            uppercase
            tracking-[0.3em]
            text-[#6F8B5E]
          "
        >
          OLIVE LIVING
        </p>

        <h2
          className="
            mt-4
            font-display
            text-4xl
            leading-tight
            text-[#2F2F2F]
            sm:text-5xl
            lg:text-6xl
          "
        >
          Ánh sáng làm nên không gian.
        </h2>

      </div>

    </div>
  </div>
</section>

{/*
<FeaturedCollection />
*/}

<Vouchers />

<BestSeller
  products={data.bestSellers}
/>

<FeaturedCollectionShowcase
  products={data.featured}
/>

{/* VIDEO NGANG */}
<section className="bg-[#F7F4EF] py-4 sm:py-6 lg:py-8">
  <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
    <div
      className="
        relative
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-[#E7DED3]
        bg-black
        shadow-[0_20px_70px_rgba(60,45,30,0.08)]

        aspect-[16/7]

        sm:aspect-[16/7]

        lg:aspect-[16/7]
      "
    >
      <video
        src="/videos/0825 (4)(1).mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
      />
    </div>
  </div>
</section>

<FeaturedCollectionShowcaseReverse
  products={data.memphisProducts}
/>

<OliveTrustSection />

<ScrollToTopBottom />

<FurnitureCollectionShowcase
  products={data.furnitureProducts}
/>

<BeforeAfterSlider
  beforeImage="/images/floor-lamp-before.jpg"
  afterImage="/images/floor-lamp-after.jpg"
  products={data.floorLampProducts}
/>

<FlashSale />

{/*
<FavoriteProducts
  products={data.bestSellers.slice(0, 4)}
/>
*/}



{/*
<Under399
  products={data.under399}
/>
*/}




{/*
<NewArrival
  products={data.featured}
/>
*/}

{/*
<Lookbook />
*/}

{/*<BedsideCollection
  products={data.bedside}
/>*/}

{/* Popup */}

{/*<FlashSalePopup />

{/* VIDEO NGANG */}
<section className="bg-[#F7F4EF] py-4 sm:py-6 lg:py-8">
  <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
    <div
      className="
        relative
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-[#E7DED3]
        bg-black
        shadow-[0_20px_70px_rgba(60,45,30,0.08)]

        aspect-[16/7]

        sm:aspect-[16/7]

        lg:aspect-[16/7]
      "
    >
      <video
        src="/videos/0825 (9).mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
      />
    </div>
  </div>
</section>


  
      {/* BEST SELLERS */}
      {/*<section className="container-x py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">BÃ¡n cháº¡y</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">ÄÆ°á»£c yÃªu thÃ­ch nháº¥t</h2>
          </div>
          <Link to="/shop" className="text-sm text-primary hover:underline">Xem táº¥t cáº£ â†’</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {data.bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section> */}
      
      


<CustomerFeedbackGallery />

      {/* REVIEWS */}
<section className="bg-[var(--color-sand)]">
  <div className="container-x py-20">

    <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      KHÁCH HÀNG NÓI GÌ
    </p>

    <h2 className="mt-2 text-center font-display text-3xl md:text-4xl">
      Niềm tin được xây dựng từng món đồ
    </h2>

    <div className="mt-12 grid gap-6 md:grid-cols-3">

      {[
        {
          q: "Một chiếc đèn nhỏ nhưng làm thay đổi cả góc phòng. Ánh sáng ấm và rất dễ chịu.",
          n: "Ngọc Anh",
          c: "TP.HCM",
        },
        {
          q: "Thiết kế đẹp, tối giản đúng như mong đợi. Sản phẩm được đóng gói kỹ và giao đúng hẹn.",
          n: "Quang Minh",
          c: "Hà Nội",
        },
        {
          q: "Mình mua để trang trí góc đọc sách và rất hài lòng. Chất liệu và độ hoàn thiện vượt mong đợi trong tầm giá.",
          n: "Thanh Hà",
          c: "Đà Nẵng",
        },
      ].map((r) => (
        <figure
          key={r.n}
          className="
            rounded-lg
            border
            border-border
            bg-background
            p-7
          "
        >

          <blockquote className="font-display text-xl leading-snug">
            "{r.q}"
          </blockquote>

          <figcaption className="mt-5 text-sm">
            <span className="font-medium">
              {r.n}
            </span>

            {" · "}

            <span className="text-muted-foreground">
              {r.c}
            </span>
          </figcaption>

        </figure>
      ))}

    </div>

  </div>
</section>

      {/* STORY */}


      {/* NEWSLETTER */}
{/* <Newsletter /> */}    </div>
  );
}
