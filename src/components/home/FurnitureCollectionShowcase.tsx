import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

interface Props {
  products: any[];
}

const getFurnitureDisplayName = (product: any) => {
  const text = `${product.name || ""} ${product.slug || ""}`.toLowerCase();

  if (text.includes("montara") || text.includes("panton wire")) {
    return "KỆ MONTARA PANTON WIRE";
  }

  if (text.includes("aero") || text.includes("side table")) {
    return "AERO SIDE TABLE";
  }

  if (text.includes("curva")) {
    return "BÀN CURVA";
  }

  return product.name;
};

const getFurnitureSocialProof = (product: any) => {
  const seed = String(product.id || product.slug || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    rating: (4.7 + (seed % 4) * 0.1).toFixed(1),
    reviews: 16 + (seed % 87),
    sold: 38 + ((seed * 7) % 280),
  };
};

const formatFurniturePrice = (price: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(price)}₫`;
};
export default function FurnitureCollectionShowcase({
  products,
}: Props) {

  // Lấy tối đa 3 sản phẩm nội thất

const furnitureProducts = [
  products.find((p) =>
    `${p.name} ${p.slug}`.toLowerCase().includes("montara")
  ),

  products.find((p) =>
    `${p.name} ${p.slug}`.toLowerCase().includes("aero")
  ),

  products.find((p) =>
    `${p.name} ${p.slug}`.toLowerCase().includes("curva")
  ),
].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes olivePulseFurniture {
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

        {/* MAIN CARD */}

        <div
          className="
            overflow-hidden
            rounded-[26px]
            border border-[#E7DED3]
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
              src="/images/furniture-showcase.jpg"
              alt="Olive Living Furniture Collection"
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

              lg:px-8
              lg:py-10

              xl:px-10
              xl:py-12
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
              FORM & FUNCTION
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
              Nội thất cho
              <br />
              một không gian có gu.
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
              Từ những đường nét tối giản đến chất liệu tinh tế,
              mỗi thiết kế được chọn để không gian sống trở nên
              tiện dụng, hài hòa và có dấu ấn riêng.
            </p>


            {/* ================================================= */}
            {/* PRODUCTS */}
            {/* ================================================= */}

            <div
              className="
                mt-7

                grid
                grid-cols-2
                gap-2.5

                sm:mt-8
                sm:gap-3

                lg:grid-cols-3
                lg:gap-3

                xl:gap-4
              "
            >

              {furnitureProducts.map((product) => (

                <div
                  key={product.id}
                  className="
                    min-w-0
                    overflow-hidden

                    rounded-[14px]

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
                        alt={getFurnitureDisplayName(product)}
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
                      min-w-0
                      flex-col
                      p-2.5
                      sm:p-3.5
                    "
                  >
                    {/* PRODUCT NAME */}

                    <Link
                      to="/products/$slug"
                      params={{
                        slug: product.slug,
                      }}
                      className="
                        block
                        min-h-[42px]
                        line-clamp-2
                        overflow-hidden
                        text-[11px]
                        font-bold
                        leading-[1.55]
                        text-[#202820]
                        transition-colors
                        hover:text-[#4F8063]
                        sm:min-h-[46px]
                        sm:text-[13px]
                      "
                    >
                      {getFurnitureDisplayName(product)}
                    </Link>

                    {/* RATING / REVIEWS / SOLD */}

                    {(() => {
                      const socialProof = getFurnitureSocialProof(product);

                      return (
                        <div
                          className="
                            mt-1.5
                            flex
                            min-w-0
                            flex-wrap
                            items-center
                            gap-x-1.5
                            gap-y-0.5
                            text-[8.5px]
                            leading-4
                            text-[#77736D]
                            sm:text-[9.5px]
                          "
                        >
                          <span className="font-semibold text-[#C8922E]">
                            ★ {socialProof.rating}
                          </span>

                          <span className="text-[#B8B2AA]">·</span>

                          <span>{socialProof.reviews} đánh giá</span>

                          <span className="text-[#B8B2AA]">·</span>

                          <span>Đã bán {socialProof.sold}</span>
                        </div>
                      );
                    })()}

                    {/* PRICE */}

                    <div className="mt-1.5 min-h-[42px]">
                      {product.price ? (
                        <>
                          <div className="text-[8.5px] leading-4 text-gray-400 line-through sm:text-[9.5px]">
                            {new Intl.NumberFormat("vi-VN").format(
                              product.compare_at_price &&
                              product.compare_at_price > product.price
                                ? product.compare_at_price
                                : Math.ceil(
                                    (product.price * 1.1) / 10000
                                  ) * 10000
                            )}₫
                          </div>

                          <div className="mt-0.5 text-[14px] font-bold leading-5 text-[#4F8063] sm:text-[15px]">
                            {new Intl.NumberFormat("vi-VN").format(
                              product.price
                            )}₫
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-red-500">
                          Chưa có giá
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        mt-2.5
                        flex
                        items-center
                        gap-1.5
                      "
                    >
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
                          rounded-[10px]
                          bg-[#DDF1E6]
                          px-2
                          text-[9px]
                          font-semibold
                          text-[#4F8063]
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-[#CDE8D9]
                          active:scale-[0.98]
                          sm:h-9
                          sm:rounded-xl
                          sm:text-[10px]
                        "
                      >
                        Mua ngay
                      </Link>

                      <Link
                        to="/products/$slug"
                        params={{
                          slug: product.slug,
                        }}
                        aria-label={`Xem ${getFurnitureDisplayName(product)}`}
                        className="
                          flex
                          h-8
                          w-[34px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-[10px]
                          border
                          border-[#D7E9DD]
                          bg-[#F7FBF8]
                          text-[#4F8063]
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-[#DDF1E6]
                          active:scale-[0.96]
                          sm:h-9
                          sm:w-9
                          sm:rounded-xl
                        "
                      >
                        <ShoppingCart size={14} strokeWidth={1.7} />
                      </Link>
                    </div>
                  </div>

                </div>

              ))}

            </div>


            {/* ================================================= */}
            {/* CTA */}
            {/* ================================================= */}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">

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

                  active:scale-[0.98]
                "
              >
                Xem trọn bộ nội thất

                <span>
                  →
                </span>

              </Link>
              {/* SHOPPING BENEFITS */}

              <div
                className="
                  mt-0
                  flex
                  flex-wrap
                  items-center
                  gap-x-5
                  gap-y-2

                  lg:ml-2
                  lg:mt-0

                  text-[9px]
                  text-[#6B756A]
                  sm:text-[10px]
                "
              >

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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h11v10H3z" />
                      <path d="M14 9h4l3 3v4h-7z" />
                      <circle cx="7" cy="19" r="1.5" />
                      <circle cx="18" cy="19" r="1.5" />
                    </svg>
                  </span>

                  <span>
                    <strong className="font-semibold text-[#3F493F]">
                      Freeship
                    </strong>
                    <br />
                    toàn quốc
                  </span>
                </div>


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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 14 4 9l5-5" />
                      <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                      <path d="M15 20h5v-5" />
                    </svg>
                  </span>

                  <span>
                    <strong className="font-semibold text-[#3F493F]">
                      Đổi trả
                    </strong>
                    <br />
                    trong 15 ngày
                  </span>
                </div>


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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
                      <path d="M2 7h20v5H2z" />
                      <path d="M12 7v14" />
                      <path d="M12 7H8.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z" />
                      <path d="M12 7h3.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
                    </svg>
                  </span>

                  <span>
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