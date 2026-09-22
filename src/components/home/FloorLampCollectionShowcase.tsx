import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

interface Props {
  products: any[];
}

export default function FloorLampCollectionShowcase({
  products,
}: Props) {

  const floorLampProducts = products.slice(0, 3);

  return (
    <section className="bg-[#F7F4EF] py-6 sm:py-8 lg:py-7">

      <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">

        <div
          className="
            overflow-hidden
            rounded-[26px]
            border border-[#E7DED3]
            bg-white
            shadow-[0_20px_70px_rgba(60,45,30,0.06)]
            lg:grid
            lg:grid-cols-[1.05fr_0.95fr]
            xl:rounded-[34px]
          "
        >{/* RIGHT CONTENT */}

          <div
            className="
              flex
              flex-col
              justify-center
              px-5
              py-6
              sm:px-7
              sm:py-7
              lg:px-8
              lg:py-6
              xl:px-9
              xl:py-6
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
              LIGHTING COLLECTION
            </p>


            {/* TITLE */}

            <h2
              className="
                mt-4
                max-w-[520px]
                font-display
                text-[32px]
                leading-[1.05]
                tracking-[-0.025em]
                text-[#292725]
                sm:text-[38px]
                lg:text-[40px]
                xl:text-[46px]
              "
            >
              Ánh sáng định hình
              <br />
              không gian.
            </h2>


            {/* DESCRIPTION */}

            <p
              className="
                mt-5
                max-w-[540px]
                text-[12px]
                leading-5
                text-neutral-500
                sm:text-[13px]
                sm:leading-6
              "
            >
              Những thiết kế đèn đứng được chọn lọc để mang đến
              ánh sáng ấm áp, tạo chiều sâu và điểm nhấn tinh tế
              cho từng góc sống.
            </p>


            {/* PRODUCTS */}

            <div
              className="
                mt-5
                grid
                grid-cols-3
                gap-2
                sm:mt-6
                sm:gap-3
                xl:gap-3
              "
            >

              {floorLampProducts.map((product, index) => (

                <div
                  key={product.id}
                  className={`
                    min-w-0
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#E5DDD3]
                    bg-white
                    
                  `}
                >

                  {/* IMAGE */}

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
                        alt={product.name}
                        className="
                          h-full
                          w-full
                          object-contain
                          transition-transform
                          duration-500
                          hover:scale-[1.03]
                        "
                      />

                    </div>

                  </Link>


                  {/* PRODUCT INFO */}

                  <div
                    className="
                      flex
                      min-h-[105px]
                      flex-col
                      p-2
                      sm:min-h-[115px]
                      sm:p-3
                    "
                  >

                    <Link
                      to="/products/$slug"
                      params={{
                        slug: product.slug,
                      }}
                      className="
                        block
                        min-h-[36px]
                        overflow-hidden
                        text-[9px]
                        leading-4
                        text-[#403C37]
                        sm:text-[11px]
                        sm:leading-4
                      "
                    >
                      {product.name}
                    </Link>


                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        gap-1
                        pt-2
                      "
                    >

                      {/* BUY */}

                      <Link
                        to="/products/$slug"
                        params={{
                          slug: product.slug,
                        }}
                        className="
                          flex
                          h-8
                          min-w-0
                          flex-1
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#DDF1E6]
                          px-1
                          text-[9px]
                          font-semibold
                          text-[#4F8063]
                          transition-all
                          duration-300
                          hover:bg-[#CDE8D9]
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
                        aria-label={`Xem ${product.name}`}
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-[#D7E9DD]
                          bg-[#F7FBF8]
                          text-[#4F8063]
                          transition-all
                          duration-300
                          hover:bg-[#DDF1E6]
                        "
                      >
                        <ShoppingCart size={12} />
                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>


            {/* CTA */}

            <div className="mt-7 sm:mt-8">

              <Link
                to="/shop"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#2E3528]
                  px-5
                  py-3
                  text-[11px]
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#6F8B5E]
                  hover:shadow-lg
                "
              >
                Khám phá đèn
                <span>→</span>
              </Link>

            </div>

          </div>



          {/* LEFT IMAGE */}

          <div
            className="
              relative
              min-h-[340px]
              overflow-hidden
              sm:min-h-[400px]
              lg:min-h-[520px]
            "
          >

            <img
              src="/images/floor-lamp-showcase.jpg"
              alt="Olive Living Floor Lamp Collection"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
                transition-transform
                duration-700
                hover:scale-[1.02]
              "
            />

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


          

        </div>

      </div>

    </section>
  );
}





