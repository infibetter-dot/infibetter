import { ShoppingCart, Truck, RotateCcw, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  products: any[];
}

const getFeaturedDisplayName = (product: any) => {
  const text = `${product.name || ""} ${product.slug || ""}`.toLowerCase();

  if (text.includes("cordless")) {
    return "ĐÈN BÀN CORDLESS";
  }

  if (text.includes("montara") || text.includes("panton wire")) {
    return "KỆ MONTARA PANTON WIRE";
  }

  return product.name;
};

const formatFeaturedPrice = (price: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(price)}₫`;
};

export default function FeaturedCollectionShowcase({
  products,
}: Props) {

const [pantonProduct, setPantonProduct] = useState<any | null>(null);
const [cordlessProduct, setCordlessProduct] = useState<any | null>(null);

useEffect(() => {
  async function loadCollectionProducts() {
    const [panton, cordless] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
        )
        .ilike("name", "%Panton%")
        .limit(1)
        .maybeSingle(),

      supabase
        .from("products")
        .select(
          "id,slug,name,price,compare_at_price,stock,image_url,color_preview"
        )
        .ilike("name", "%Cordless%")
        .limit(1)
        .maybeSingle(),
    ]);

    if (panton.error) {
      console.error("PANTON PRODUCT ERROR:", panton.error);
    }

    if (cordless.error) {
      console.error("CORDLESS PRODUCT ERROR:", cordless.error);
    }

    setPantonProduct(panton.data);
    setCordlessProduct(cordless.data);
  }

  loadCollectionProducts();
}, []);

const collectionProducts = [
  cordlessProduct,
  pantonProduct,
].filter(Boolean);

function getProductSocialProof(product: any) {
  const seed = String(product.id || product.slug || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const rating = (4.7 + (seed % 4) * 0.1).toFixed(1);

  const reviews = 12 + (seed % 76);

  const sold = 35 + ((seed * 7) % 210);

  return {
    rating,
    reviews,
    sold,
  };
}

  return (
    <>
      <style>{`
        @keyframes olivePulse {
          0%, 100% {
            box-shadow: 0 6px 18px rgba(46, 53, 40, 0.12);
            transform: translateY(0);
          }
          50% {
            box-shadow:
              0 8px 24px rgba(46, 53, 40, 0.22),
              0 0 14px rgba(221, 241, 230, 0.55);
            transform: translateY(-2px);
          }
        }
      `}</style>

      <section className="bg-[#F7F4EF] py-10 sm:py-14 lg:py-20">
      <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">

        {/* MAIN COLLECTION */}
        <div
          className="
            overflow-hidden
            rounded-[26px]
            border
            border-[#E7DED3]
            bg-white
            shadow-[0_20px_70px_rgba(60,45,30,0.06)]

            lg:grid
            lg:grid-cols-[1.02fr_0.98fr]

            xl:rounded-[34px]
          "
        >

          {/* ================================================= */}
          {/* LEFT IMAGE */}
          {/* ================================================= */}

          <div
            className="
              relative
              min-h-[420px]
              overflow-hidden

              sm:min-h-[520px]

              lg:min-h-[680px]
            "
          >
            <img
              src="/images/collection-showcase.jpg"
              alt="Olive Living Collection"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center

                transition-transform
                duration-700
              "
            />

            {/* subtle overlay */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-black/[0.03]
                via-transparent
                to-black/[0.04]
              "
            />
          </div>


          {/* ================================================= */}
          {/* RIGHT CONTENT */}
          {/* ================================================= */}

          <div
            className="
              flex
              flex-col
              justify-center

              px-6
              py-9

              sm:px-8
              sm:py-10

              lg:px-10
              lg:py-12

              xl:px-14
              xl:py-14
            "
          >

            {/* EYEBROW */}

            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.34em]
                text-[#6F8B5E]

                sm:text-[10px]
              "
            >
              FEATURED COLLECTION
            </p>


            {/* TITLE */}

            <h2
              className="
                mt-4
                max-w-[540px]

                font-display
                text-[34px]
                leading-[1.05]
                tracking-[-0.025em]
                text-[#292725]

                sm:text-[42px]

                lg:text-[46px]

                xl:text-[52px]
              "
            >
              Đẹp Từ Những 
              <br />
              Điều Đơn Giản
            </h2>


            {/* DESCRIPTION */}

            <p
              className="
                mt-5
                max-w-[560px]

                text-[13px]
                leading-6
                text-neutral-500

                sm:text-sm
                sm:leading-7
              "
            >
              Thiết kế tinh giản cho một không gian sống đầy cảm hứng.
            </p>


            {/* ================================================= */}
{/* COLLECTION PRODUCTS */}
{/* ================================================= */}

<div
  className="
    mt-8
    grid
    grid-cols-2
    gap-3

    sm:mt-9
    sm:gap-5

    lg:mt-8
    lg:gap-4

    xl:gap-5
  "
>
  {collectionProducts.map((product) => (
    <div
      key={product.id}
      className="
        min-w-0
        overflow-hidden
        rounded-[18px]
        border
        border-[#E5DDD3]
        bg-white
      "
    >

      {/* PRODUCT IMAGE */}

      <Link
        to="/products/$slug"
        params={{
          slug: product.slug,
        }}
        className="block"
      >
        <div
          className="
            aspect-square
            w-full
            overflow-hidden
            bg-[#F5F2ED]
          "
        >
          <img
            src={product.image_url}
            alt={getFeaturedDisplayName(product)}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              hover:scale-[1.03]
            "
          />
        </div>
      </Link>


     {/* PRODUCT CONTENT */}

<div
  className="
    flex
    min-h-[128px]
    flex-col
    p-3
    sm:min-h-[140px]
    sm:p-4
  "
>

  {/* NAME */}

  <Link
    to="/products/$slug"
    params={{
      slug: product.slug,
    }}
    className="
      block
      line-clamp-2
      min-h-[40px]
      overflow-hidden
      text-[13px]
      font-bold
      leading-5
      text-[#403C37]

      sm:min-h-[44px]
      sm:text-[14px]
    "
  >
    {getFeaturedDisplayName(product)}
  </Link>


  {/* RATING + REVIEWS + SOLD */}
  {(() => {
    const socialProof = getProductSocialProof(product);

    return (
      <div className="mt-1 flex flex-col gap-0.5 text-[9px] leading-4 sm:text-[10px]">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[#77736D]">
          <span className="font-semibold text-[#D39A2F]">
            ★ {socialProof.rating}
          </span>
          <span>{socialProof.reviews} đánh giá</span>
        </div>

        <div className="text-[#77736D]">
          Đã bán {socialProof.sold}
        </div>
      </div>
    );
  })()}

  {/* PRICE */}

  <div className="mt-2 flex min-h-[36px] flex-col justify-center">

    {product.compare_at_price &&
     product.compare_at_price > product.price && (
      <span
        className="
          text-[9px]
          leading-4
          text-neutral-400
          line-through
          sm:text-[10px]
        "
      >
        {formatFeaturedPrice(product.compare_at_price)}
      </span>
    )}

    <span
      className="
        text-[14px]
        font-bold
        leading-5
        text-[#4F8063]
        sm:text-[15px]
      "
    >
      {formatFeaturedPrice(product.price)}
    </span>

  </div>


  {/* ACTION */}

  <div
    className="
      mt-auto
      flex
      items-center
      gap-2
      pt-3
    "
  >

    {/* MUA NGAY */}

    <Link
      to="/products/$slug"
      params={{
        slug: product.slug,
      }}
      className="
        flex
        h-9
        min-w-0
        flex-1
        items-center
        justify-center
        rounded-xl
        bg-[#DDF1E6]
        px-2
        text-[10px]
        font-semibold
        text-[#4F8063]
        transition-all
        duration-300
        hover:bg-[#CDE8D9]

        sm:text-[11px]
      "
    >
      Mua ngay
    </Link>


    {/* CART */}

    <Link
      to="/products/$slug"
      params={{
        slug: product.slug,
      }}
      aria-label={`Xem ${getFeaturedDisplayName(product)}`}
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-[#D7E9DD]
        bg-[#F7FBF8]
        text-[#4F8063]
        transition-all
        duration-300
        hover:bg-[#DDF1E6]
      "
    >
      <ShoppingCart size={15} strokeWidth={1.6} />
    </Link>

  </div>

</div>

    </div>
  ))}
</div>

            {/* ================================================= */}
            {/* CTA */}
            {/* ================================================= */}

            <div
              className="
                mt-8
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-3

                sm:mt-10
              "
            >

              {/* CTA */}

              <Link
                to="/shop"
                className="
                  group
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#2E3528]
                  px-5
                  py-3
                  text-[12px]
                  font-semibold
                  tracking-[0.01em]
                  text-white
                  shadow-[0_6px_18px_rgba(46,53,40,0.12)]
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-1
                  hover:bg-[#3A4433]
                  hover:shadow-[0_10px_24px_rgba(46,53,40,0.20)]
                  active:scale-[0.97]
                  motion-safe:animate-[olivePulse_3s_ease-in-out_infinite]
                "
              >
                <span>Khám phá bộ sưu tập</span>
                <span
                  className="
                    inline-block
                    text-[14px]
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </Link>


              {/* BENEFITS */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-5
                  gap-y-2
                "
              >

                {/* FREESHIP */}

                <div className="flex items-center gap-1.5 whitespace-nowrap">

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F1F7F2]
                      text-[#4F8063]
                    "
                  >
                    <Truck size={14} strokeWidth={1.5} />
                  </span>

                  <span
                    className="
                      text-[9px]
                      leading-4
                      text-[#6B756A]
                    "
                  >
                    <strong className="font-semibold text-[#3F493F]">
                      Freeship
                    </strong>
                    <br />
                    toàn quốc
                  </span>

                </div>


                {/* RETURN */}

                <div className="flex items-center gap-1.5 whitespace-nowrap">

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F1F7F2]
                      text-[#4F8063]
                    "
                  >
                    <RotateCcw size={14} strokeWidth={1.5} />
                  </span>

                  <span
                    className="
                      text-[9px]
                      leading-4
                      text-[#6B756A]
                    "
                  >
                    <strong className="font-semibold text-[#3F493F]">
                      Đổi trả
                    </strong>
                    <br />
                    trong 15 ngày
                  </span>

                </div>


                {/* VOUCHER */}

                <div className="flex items-center gap-1.5 whitespace-nowrap">

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F1F7F2]
                      text-[#4F8063]
                    "
                  >
                    <Gift size={14} strokeWidth={1.5} />
                  </span>

                  <span
                    className="
                      text-[9px]
                      leading-4
                      text-[#6B756A]
                    "
                  >
                    <strong className="font-semibold text-[#3F493F]">
                      Voucher 50K
                    </strong>
                    <br />
                    cho đơn hàng
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
    </>
  );
}


