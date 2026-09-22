import HomeProductCard from "./HomeProductCard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  products?: any[];
}

export default function Under399({
  products = [],
}: Props) {

  console.log("UNDER399 PRODUCTS", products);

  return (

    <section className="py-12 lg:py-16">

      <div className="container-x">

        <div
          className="
            rounded-[32px]

            border
            border-[#E6DDD2]

            bg-gradient-to-b
            from-white
            to-[#F8F5F1]

            p-6

            shadow-[0_18px_60px_rgba(0,0,0,.05)]

            lg:p-10
          "
        >

          {/* Header */}

          <div className="mb-8">

            <div>

              <span
                className="
                  inline-flex
                  rounded-full
                  bg-[#FFF5EC]
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-[#C77B55]
                "
              >
                💰 DƯỚI 399K
              </span>

              <h2 className="mt-3 text-3xl font-semibold text-[#2F2F2F]">
                Đèn dưới 399K
              </h2>

              <p className="mt-2 text-neutral-500">
                Những thiết kế tối giản với mức giá dễ tiếp cận.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  ⚡ Giao hỏa tốc 4H
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  🎁 UNDER399 giảm 10K
                </span>

                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700">
                  ↩ Đổi trả 15 ngày
                </span>

                

              </div>

              

            </div>

            

          </div>


            

         {/* PRODUCTS */}

<Carousel
  className="mt-10 w-full"
  opts={{
    align: "start",
    loop: false,
  }}
>
  <CarouselContent className="-ml-4">

    {products.map((product: any, index: number) => (

    <CarouselItem
  key={product.id}
  className="
    pl-4

    basis-[90%]

    sm:basis-[60%]

    lg:basis-[32%]

    xl:basis-[26%]
  "
>
        <HomeProductCard
          product={product}
          badge={index === 0 ? "UNDER399" : undefined}
        />
      </CarouselItem>

    ))}

  </CarouselContent>

  <CarouselPrevious />
  <CarouselNext />

</Carousel>

        </div>

      </div>

    </section>
  );
}