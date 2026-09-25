import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatUSDFromVND } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { getImageUrl } from "@/lib/storage";

const productOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          short_description,
          id,
          slug,
          name,
          description,
          price,
          compare_at_price,
          stock,
          image_url,
          dimensions,
          material,
          color,
          light_source,
          power_source,
          warranty,
          seo_title,
          seo_description,
          category_id,
          product_images(
            id,
            image_url,
            sort_order,
            color_id,
            is_lifestyle
          ),
          product_colors(
            id,
            name,
            hex
          ),
          product_specifications(
            id,
            label,
            value,
            sort_order
          ),
          product_usps(
            id,
            title,
            icon,
            sort_order
          )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("PRODUCT QUERY ERROR:", error);
        throw new Error(error.message);
      }

      if (!data) {
        throw notFound();
      }

      const relatedResult = await supabase
        .from("products")
        .select(
          "id, slug, name, price, compare_at_price, image_url, stock",
        )
        .eq("category_id", data.category_id!)
        .neq("id", data.id)
        .limit(4);

      return {
        product: data,
        related: relatedResult.data ?? [],
      };
    },
  });

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productOptions(params.slug)),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const cart = useCart();

  const { data } = useSuspenseQuery(productOptions(slug));
  const { product, related } = data;

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(
    product.product_colors?.[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [openSpecs, setOpenSpecs] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const productImages = useMemo(() => {
    const images = (product.product_images ?? [])
      .filter((item: any) => item?.image_url)
      .sort(
        (a: any, b: any) =>
          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
      );

    if (images.length > 0) return images;

    if (product.image_url) {
      return [
        {
          id: "main",
          image_url: product.image_url,
          color_id: null,
          is_lifestyle: false,
        },
      ];
    }

    return [];
  }, [product]);

  useEffect(() => {
    setSelectedImage(
      product.image_url ||
        product.product_images?.[0]?.image_url ||
        "",
    );

    setSelectedColor(product.product_colors?.[0] ?? null);
    setQuantity(1);
  }, [product.id]);

  const activeImage =
    selectedImage ||
    product.image_url ||
    productImages[0]?.image_url ||
    "";

  const price = Number(product.price) || 0;
  const comparePrice = Number(product.compare_at_price) || 0;

  const hasDiscount = comparePrice > price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((comparePrice - price) / comparePrice) * 100,
      )
    : 0;

  const inStock = Number(product.stock ?? 0) > 0;

  const specs = (product.product_specifications ?? [])
    .slice()
    .sort(
      (a: any, b: any) =>
        Number(a.sort_order ?? 0) -
        Number(b.sort_order ?? 0),
    );

  const usps = (product.product_usps ?? [])
    .slice()
    .sort(
      (a: any, b: any) =>
        Number(a.sort_order ?? 0) -
        Number(b.sort_order ?? 0),
    )
    .slice(0, 4);

  const faqItems = [
    {
      question: "Sản phẩm có bảo hành và đổi trả không?",
      answer:
        "Sản phẩm được hỗ trợ theo chính sách bảo hành và đổi trả của INFIBETTER.",
    },
    {
      question: "Bao lâu tôi nhận được hàng?",
      answer:
        "Thời gian giao hàng phụ thuộc vào khu vực nhận hàng và đơn vị vận chuyển.",
    },
    {
      question: "Sản phẩm có được kiểm tra khi nhận hàng không?",
      answer:
        "Bạn có thể kiểm tra ngoại quan kiện hàng theo chính sách của đơn vị vận chuyển.",
    },
    {
      question: "Nếu sản phẩm có vấn đề thì sao?",
      answer:
        "Hãy liên hệ INFIBETTER để được hỗ trợ kiểm tra và xử lý.",
    },
  ];

  /*
   * ============================================================
   * ADD PRODUCT TO CART
   * ============================================================
   *
   * Hàm này CHỈ thêm sản phẩm.
   *
   * Không toast.
   * Không redirect.
   *
   * Dùng cho PayPal / Buy Now.
   */
  function addProductToCart() {
    const image =
      activeImage ||
      product.image_url ||
      productImages[0]?.image_url ||
      null;

    cart.add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price,
        image,
        productColorId: selectedColor?.id,
        colorName: selectedColor?.name,
        colorHex: selectedColor?.hex,
      },
      quantity,
    );
  }

  /*
   * ============================================================
   * NORMAL ADD TO CART
   * ============================================================
   *
   * Nút "Thêm vào giỏ":
   * thêm sản phẩm + hiện thông báo.
   */
  function addToCart() {
    if (!inStock) {
      toast.error("Sản phẩm hiện đã hết hàng");
      return;
    }

    addProductToCart();

    toast.success("Đã thêm vào giỏ");
  }

  /*
   * ============================================================
   * PAYPAL / BUY NOW
   * ============================================================
   *
   * Không redirect sang /cart.
   * Không hiện toast "Đã thêm vào giỏ".
   *
   * Sau khi thêm sản phẩm:
   * gửi event để SiteHeader mở CartDrawer.
   */
  function buyNow() {
    if (!inStock) {
      toast.error("Sản phẩm hiện đã hết hàng");
      return;
    }

    addProductToCart();

    window.dispatchEvent(
      new Event("infibetter:open-cart"),
    );
  }

  function changeImage(direction: "next" | "prev") {
    if (productImages.length < 2) return;

    const currentIndex = Math.max(
      0,
      productImages.findIndex(
        (item: any) =>
          item.image_url === activeImage,
      ),
    );

    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % productImages.length
        : (currentIndex - 1 + productImages.length) %
          productImages.length;

    setSelectedImage(
      productImages[nextIndex].image_url,
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1D1D1F]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1240px] px-5 pb-4 pt-5 md:px-8 lg:pt-7">
        <nav className="flex items-center gap-2 overflow-hidden text-[12px] text-[#6E6E73]">
          <Link
            to="/"
            className="shrink-0 hover:text-[#1D1D1F]"
          >
            Trang chủ
          </Link>

          <span>/</span>

          <Link
            to="/shop"
            className="shrink-0 hover:text-[#1D1D1F]"
          >
            Shop
          </Link>

          <span>/</span>

          <span className="truncate text-[#1D1D1F]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product hero */}
      <section className="mx-auto max-w-[1240px] px-5 pb-12 md:px-8 lg:pb-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-12 xl:gap-16">
          {/* Gallery */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[26px] bg-[#F5F5F7]">
              <div className="aspect-square w-full">
                {activeImage ? (
                  <img
                    src={
                      getImageUrl(
                        activeImage,
                        "large",
                      ) || activeImage
                    }
                    alt={product.name}
                    className="h-full w-full object-contain p-8 sm:p-12 lg:p-14"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#86868B]">
                    Chưa có hình ảnh
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      changeImage("prev")
                    }
                    aria-label="Ảnh trước"
                    className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm backdrop-blur transition hover:bg-white"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeImage("next")
                    }
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm backdrop-blur transition hover:bg-white"
                  >
                    <ChevronRight size={17} />
                  </button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {productImages.map(
                  (image: any, index: number) => (
                    <button
                      key={`${image.id ?? index}-${image.image_url}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image.image_url,
                        )
                      }
                      className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[12px] bg-[#F5F5F7] transition ${
                        activeImage ===
                        image.image_url
                          ? "ring-2 ring-[#1D1D1F] ring-offset-1"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Xem ảnh ${index + 1}`}
                    >
                      <img
                        src={
                          getImageUrl(
                            image.image_url,
                            "thumb",
                          ) || image.image_url
                        }
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-contain p-1.5"
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Product information */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="max-w-[520px]">
              {/* Stock */}
              <div className="mb-4 flex items-center gap-2 text-[11px] text-[#6E6E73]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    inStock
                      ? "bg-[#34C759]"
                      : "bg-[#FF3B30]"
                  }`}
                />

                {inStock
                  ? "Có sẵn"
                  : "Hết hàng"}
              </div>

              {/* Product name */}
              <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[38px] lg:text-[42px]">
                {product.name}
              </h1>

              {/* Short description */}
              {product.short_description && (
                <p className="mt-4 max-w-[480px] text-[15px] leading-6 text-[#6E6E73]">
                  {product.short_description}
                </p>
              )}

              {/* Price */}
              <div className="mt-6">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-[28px] font-semibold tracking-[-0.025em]">
                    {formatUSDFromVND(price)}
                  </span>

                  {hasDiscount && (
                    <>
                      <span className="text-[14px] text-[#86868B] line-through">
                        {formatUSDFromVND(
                          comparePrice,
                        )}
                      </span>

                      <span className="text-[12px] font-medium text-[#6E6E73]">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-1 text-[12px] text-[#86868B]">
                  Giá đã bao gồm VAT nếu áp dụng.
                </p>
              </div>

              {/* Color */}
              {product.product_colors?.length >
                0 && (
                <div className="mt-7 border-t border-[#D2D2D7] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold">
                      Màu sắc
                    </span>

                    <span className="text-[12px] text-[#6E6E73]">
                      {selectedColor?.name ||
                        "Chọn màu"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {product.product_colors.map(
                      (color: any) => (
                        <button
                          key={color.id}
                          type="button"
                          title={color.name}
                          onClick={() =>
                            setSelectedColor(
                              color,
                            )
                          }
                          className={`h-9 w-9 rounded-full border-2 p-[2px] transition ${
                            selectedColor?.id ===
                            color.id
                              ? "border-[#1D1D1F]"
                              : "border-transparent"
                          }`}
                        >
                          <span
                            className="block h-full w-full rounded-full border border-black/10"
                            style={{
                              backgroundColor:
                                color.hex ||
                                "#D2D2D7",
                            }}
                          />
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Quantity + CTA */}
              <div className="mt-7 border-t border-[#D2D2D7] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold">
                    Số lượng
                  </span>

                  <div className="flex h-10 items-center rounded-full border border-[#D2D2D7]">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1,
                            ),
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F]"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-8 text-center text-[13px] font-medium">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (value) =>
                            Math.min(
                              Math.max(
                                1,
                                Number(
                                  product.stock ??
                                    1,
                                ),
                              ),
                              value + 1,
                            ),
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!inStock}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 text-[14px] font-semibold text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:bg-[#D2D2D7]"
                >
                  <ShoppingBag size={16} />
                  Thêm vào giỏ
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={buyNow}
                  disabled={!inStock}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFC439] px-6 text-[14px] font-semibold text-[#003087] transition hover:bg-[#F7B928] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Thanh toán với PayPal"
                >
                  <span className="font-bold tracking-[-0.04em]">
                    PayPal
                  </span>
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-7 grid grid-cols-2 border-y border-[#D2D2D7]">
                {[
                  {
                    icon: Truck,
                    text: "Giao hàng có tracking",
                  },
                  {
                    icon: RotateCcw,
                    text: "Đổi trả 30 ngày",
                  },
                  {
                    icon: ShieldCheck,
                    text: "Thanh toán an toàn",
                  },
                  {
                    icon: Check,
                    text: "Hỗ trợ sản phẩm",
                  },
                ].map(
                  ({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 border-b border-[#E5E5EA] px-1 py-3 last:border-b-0 odd:border-r"
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.7}
                        className="shrink-0"
                      />

                      <span className="text-[11px] leading-4 text-[#424245]">
                        {text}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-7 border-b border-[#D2D2D7] pb-5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSpecs(
                        (value) => !value,
                      )
                    }
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-[14px] font-semibold">
                      Mô tả sản phẩm
                    </span>

                    <ChevronDown
                      size={17}
                      className={`transition-transform ${
                        openSpecs
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {openSpecs && (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-[13px] leading-6 text-[#6E6E73]"
                      dangerouslySetInnerHTML={{
                        __html:
                          product.description,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Specifications */}
              {specs.length > 0 && (
                <div className="border-b border-[#D2D2D7]">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSpecs(
                        (value) => !value,
                      )
                    }
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="text-[14px] font-semibold">
                      Thông số kỹ thuật
                    </span>

                    <ChevronDown
                      size={17}
                      className={`transition-transform ${
                        openSpecs
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {openSpecs && (
                    <div className="divide-y divide-[#E5E5EA] pb-3">
                      {specs.map(
                        (spec: any) => (
                          <div
                            key={spec.id}
                            className="flex gap-5 py-3 text-[12px]"
                          >
                            <span className="w-1/3 shrink-0 text-[#6E6E73]">
                              {spec.label}
                            </span>

                            <span className="flex-1 text-[#1D1D1F]">
                              {spec.value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Product USPs */}
      {usps.length > 0 && (
        <section className="border-y border-[#D2D2D7] bg-[#F5F5F7]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 md:grid-cols-4 md:px-8">
            {usps.map((item: any) => (
              <div
                key={item.id}
                className="border-b border-[#D2D2D7] px-4 py-6 text-center md:border-b-0 md:border-r md:last:border-r-0"
              >
                <p className="text-[13px] font-semibold text-[#1D1D1F]">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-[1000px] px-5 py-14 md:px-8 lg:py-20">
        <h2 className="text-center text-[26px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          Cần biết thêm?
        </h2>

        <div className="mt-8 border-t border-[#D2D2D7]">
          {faqItems.map(
            (faq, index) => (
              <div
                key={faq.question}
                className="border-b border-[#D2D2D7]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(
                      (value) =>
                        value === index
                          ? null
                          : index,
                    )
                  }
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[14px] font-medium">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={17}
                    className={`shrink-0 transition-transform ${
                      openFaq === index
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <p className="max-w-[760px] pb-5 pr-8 text-[13px] leading-6 text-[#6E6E73]">
                    {faq.answer}
                  </p>
                )}
              </div>
            ),
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-[#D2D2D7] bg-white">
          <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-8 lg:py-16">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6E6E73]">
                  Bạn cũng có thể thích
                </p>

                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
                  Hoàn thiện setup của bạn.
                </h2>
              </div>

              <Link
                to="/shop"
                className="hidden text-[13px] font-medium text-[#0071E3] sm:block"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {related.map((item: any) => {
                const relatedPrice =
                  Number(item.price) || 0;

                return (
                  <Link
                    key={item.id}
                    to="/products/$slug"
                    params={{
                      slug: item.slug,
                    }}
                    className="group min-w-0"
                  >
                    <div className="aspect-square overflow-hidden rounded-[18px] bg-[#F5F5F7]">
                      {item.image_url ? (
                        <img
                          src={
                            getImageUrl(
                              item.image_url,
                              "card",
                            ) ||
                            item.image_url
                          }
                          alt={item.name}
                          className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#86868B]">
                          No image
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-5">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-[13px] text-[#424245]">
                      {formatUSDFromVND(
                        relatedPrice,
                      )}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}