import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Check,
  Ticket,
} from "lucide-react";

import { z } from "zod";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "best"]).optional(),
  max: z.coerce.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,

  head: () => ({
    meta: [
      {
        title: "Cửa hàng — NHÀ",
      },
      {
        name: "description",
        content:
          "Toàn bộ sản phẩm nội thất: sofa, bàn, ghế, giường, tủ kệ.",
      },
    ],
  }),

  component: ShopPage,
});

function ShopPage() {
  const sp = Route.useSearch();

  const [copiedVoucher, setCopiedVoucher] =
    useState<string | null>(null);

  const [showAllVouchers, setShowAllVouchers] =
    useState(false);

  /* =================================================
     PRODUCTS
  ================================================== */

  const productsQ = useQuery({
    queryKey: [
      "shop-products",
      sp.category,
      sp.q,
      sp.sort,
      sp.max,
    ],

    staleTime: 1000 * 60 * 10,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    queryFn: async () => {
      let q = supabase
        .from("products")
        .select(`
          id,
          slug,
          name,
          price,
          compare_at_price,
          stock,
          category_id,
          best_seller,
          created_at,
          image_url
        `);

      if (sp.sort === "best") {
        q = q
          .order("best_seller", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });
      } else {
        q = q.order("created_at", {
          ascending: false,
        });
      }

      const { data } = await q.range(0, 39);

      return (
        data?.map((item: any) => ({
          ...item,
          image_url: item.image_url,
        })) ?? []
      );
    },
  });

  /* =================================================
     CATEGORIES
  ================================================== */

  const categoriesQ = useQuery({
    queryKey: ["shop-categories"],

    queryFn: async () =>
      (
        await supabase
          .from("categories")
          .select("id,slug,name")
          .order("name")
      ).data ?? [],
  });

  /* =================================================
     HOME VOUCHERS
  ================================================== */

  const vouchersQ = useQuery({
    queryKey: ["shop-home-vouchers"],

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 15,

    refetchOnWindowFocus: false,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("active", true)
        .eq("show_home", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "SHOP HOME VOUCHER ERROR:",
          error
        );

        return [];
      }

      const now = new Date();

      return (data ?? []).filter((voucher: any) => {
        /* Chưa bắt đầu */

        if (
          voucher.start_at &&
          now < new Date(voucher.start_at)
        ) {
          return false;
        }

        /* Đã hết hạn */

        if (
          voucher.end_at &&
          now > new Date(voucher.end_at)
        ) {
          return false;
        }

        /* Hết lượt */

        if (
          voucher.quantity !== null &&
          voucher.quantity !== undefined
        ) {
          const quantity = Number(
            voucher.quantity
          );

          const used = Number(
            voucher.used ?? 0
          );

          if (used >= quantity) {
            return false;
          }
        }

        /* Không cho nhập mã thủ công */

        if (voucher.manual_apply === false) {
          return false;
        }

        return true;
      });
    },
  });

  /* =================================================
     COPY VOUCHER
  ================================================== */

  const copyVoucher = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedVoucher(code);

      setTimeout(() => {
        setCopiedVoucher(null);
      }, 1800);
    } catch (error) {
      console.error(
        "COPY VOUCHER ERROR:",
        error
      );
    }
  };

  /* =================================================
     MAX PRICE
  ================================================== */

  const maxPrice = useMemo(() => {
    const m = Math.max(
      0,
      ...(productsQ.data?.map((p) =>
        Number(p.price)
      ) ?? [0])
    );

    return (
      Math.ceil(m / 1_000_000) *
        1_000_000 ||
      30_000_000
    );
  }, [productsQ.data]);

  /* =================================================
     CATEGORY ALIAS
  ================================================== */

  const CATEGORY_ALIASES: Record<string, string> = {
    "do-decor": "noi-that-decor",
  };

  const normalizedCategory = sp.category
    ? CATEGORY_ALIASES[sp.category] ??
      sp.category
    : undefined;

  /* =================================================
     ACTIVE CATEGORY
  ================================================== */

  const activeCatId = categoriesQ.data?.find(
    (c) => c.slug === normalizedCategory
  )?.id;

  const priceCap = sp.max ?? maxPrice;

  /* =================================================
     FILTER PRODUCTS
  ================================================== */

  const filtered = useMemo(() => {
    const list = productsQ.data ?? [];

    if (sp.category && !activeCatId) {
      return [];
    }

    return list.filter((p) => {
      if (
        activeCatId &&
        p.category_id !== activeCatId
      ) {
        return false;
      }

      if (
        sp.q &&
        !p.name
          .toLowerCase()
          .includes(sp.q.toLowerCase())
      ) {
        return false;
      }

      if (Number(p.price) > priceCap) {
        return false;
      }

      return true;
    });
  }, [
    productsQ.data,
    activeCatId,
    sp.q,
    priceCap,
    sp.category,
  ]);

  /* =================================================
     SCROLL
  ================================================== */

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  /* =================================================
     RENDER
  ================================================== */

  return (
    <div className="container-x py-12">

      {/* =================================================
          BANNER
      ================================================== */}

      <section className="mb-8 w-full">
        <div
          className="
            relative
            aspect-[1.8/1]
            w-full
            overflow-hidden
            rounded-[10px]
            bg-[#F7F5F2]
            sm:aspect-[2.4/1]
            lg:aspect-[2.8/1]
          "
        >
          <img
            src="/images/banner03.png"
            alt="Olive Living — Bộ sưu tập đèn decor"
            loading="eager"
            fetchPriority="high"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />

          {/* LEFT CONTENT */}

          <div
            className="
              absolute
              inset-y-0
              left-0
              flex
              w-[55%]
              items-center
              bg-gradient-to-r
              from-[#F7F1E8]/95
              via-[#F7F1E8]/80
              to-transparent
              px-5
              sm:w-[50%]
              sm:px-8
              md:px-10
              lg:w-[46%]
              lg:px-12
            "
          >
            <div
              className="
                max-w-[300px]
                sm:max-w-[360px]
              "
            >
              <p
                className="
                  mb-1.5
                  text-[7px]
                  font-medium
                  uppercase
                  tracking-[0.28em]
                  text-[#5C5954]
                  sm:text-[8px]
                  md:text-[9px]
                "
                style={{
                  fontFamily:
                    '"Times New Roman", Times, serif',
                }}
              >
                OLIVE LIVING
              </p>

              <h1
                className="
                  text-[22px]
                  leading-[1.05]
                  tracking-[-0.02em]
                  text-[#1E1E1E]
                  sm:text-[28px]
                  md:text-[34px]
                  lg:text-[40px]
                "
                style={{
                  fontFamily:
                    '"Times New Roman", Times, serif',
                }}
              >
                Bộ sưu tập
                <br />
                đèn decor
              </h1>

              <p
                className="
                  mt-2
                  max-w-[220px]
                  text-[9px]
                  leading-[1.5]
                  text-[#55514C]
                  sm:mt-3
                  sm:max-w-[270px]
                  sm:text-[10px]
                  md:text-[12px]
                "
                style={{
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                }}
              >
                Ánh sáng tinh tế cho không gian
                sống hiện đại và ấm áp.
              </p>

              
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          HOME VOUCHERS
      ================================================== */}

      {vouchersQ.data &&
        vouchersQ.data.length > 0 && (
          <section className="mb-8 w-full">

            {/* TITLE */}

            <div className="mb-3 flex items-end justify-between">
              <div>
                <p
                  className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.22em]
                    text-neutral-400
                  "
                >
                  ƯU ĐÃI HÔM NAY
                </p>

                <h2
                  className="
                    mt-0.5
                    text-[17px]
                    leading-tight
                    text-[#252525]
                    sm:text-[20px]
                  "
                  style={{
                    fontFamily:
                      '"Times New Roman", Times, serif',
                  }}
                >
                  Voucher dành cho bạn
                </h2>
              </div>

              <span
                className="
                  text-[8px]
                  text-neutral-400
                "
              >
                {vouchersQ.data.length} ưu đãi
              </span>
            </div>

            {/* =================================================
                VOUCHER GRID
            ================================================== */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {(
                showAllVouchers
                  ? vouchersQ.data
                  : vouchersQ.data.slice(0, 2)
              ).map((voucher: any) => {

                const code = String(
                  voucher.code ?? ""
                );

                const type = String(
                  voucher.type ?? ""
                ).toLowerCase();

                const value = Number(
                  voucher.value ?? 0
                );

                const minOrder = Number(
                  voucher.min_order ?? 0
                );

                const maxDiscount =
                  voucher.max_discount !== null &&
                  voucher.max_discount !== undefined
                    ? Number(
                        voucher.max_discount
                      )
                    : null;

                const isShipping =
                  type === "shipping";

                let discountText = "";

                if (isShipping) {
                  discountText =
                    "MIỄN PHÍ SHIP";
                } else if (
                  type === "percent"
                ) {
                  discountText =
                    `${value}% OFF`;
                } else {
                  discountText =
                    `GIẢM ${value.toLocaleString(
                      "vi-VN"
                    )}đ`;
                }

                return (
                  <div
                    key={voucher.id}
                    className="
                      group
                      relative
                      min-w-0
                      overflow-hidden
                      rounded-[8px]
                      border
                      border-[#E7E2DA]
                      bg-[#FAF8F4]
                      p-2
                      sm:p-2.5
                    "
                  >
                    {/* DECORATION */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-6
                        -top-6
                        h-14
                        w-14
                        rounded-full
                        bg-white/70
                      "
                    />

                    <div
                      className="
                        relative
                        flex
                        min-w-0
                        flex-col
                      "
                    >

                      {/* TOP */}

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                        "
                      >

                        {/* ICON */}

                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-[7px]
                            bg-white
                            text-[#8A765D]
                            shadow-sm
                            sm:h-9
                            sm:w-9
                          "
                        >
                          <Ticket
                            size={14}
                            strokeWidth={1.5}
                          />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate
                              text-[12px]
                              font-semibold
                              leading-4
                              tracking-tight
                              text-[#292929]
                              sm:text-[13px]
                            "
                          >
                            {discountText}
                          </p>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[8px]
                              leading-3
                              text-neutral-500
                              sm:text-[9px]
                            "
                          >
                            {voucher.description ||
                              (minOrder > 0
                                ? `Đơn từ ${minOrder.toLocaleString(
                                    "vi-VN"
                                  )}đ`
                                : "Áp dụng đơn hàng")}
                          </p>
                        </div>
                      </div>

                      {/* INFO */}

                      <div
                        className="
                          mt-1.5
                          min-h-[12px]
                          truncate
                          text-[7px]
                          leading-3
                          text-neutral-400
                        "
                      >
                        {type === "percent" &&
                        maxDiscount !== null
                          ? `Tối đa ${maxDiscount.toLocaleString(
                              "vi-VN"
                            )}đ`
                          : minOrder > 0
                            ? `Đơn từ ${minOrder.toLocaleString(
                                "vi-VN"
                              )}đ`
                            : "Áp dụng toàn shop"}
                      </div>

                      {/* COPY BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          copyVoucher(code)
                        }
                        className="
                          mt-1.5
                          flex
                          h-6
                          w-full
                          items-center
                          justify-center
                          gap-1
                          rounded-full
                          border
                          border-[#D9D2C8]
                          bg-white
                          px-2
                          text-[7px]
                          font-semibold
                          uppercase
                          tracking-[0.06em]
                          text-[#4A4742]
                          transition
                          hover:bg-[#F5F1EA]
                          sm:h-7
                          sm:text-[8px]
                        "
                      >
                        {copiedVoucher ===
                        code ? (
                          <>
                            <Check size={9} />
                            Đã sao chép
                          </>
                        ) : (
                          <>
                            <Copy size={9} />
                            {code}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                EXPAND / COLLAPSE
            ================================================== */}

            {vouchersQ.data.length > 2 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllVouchers(
                    (prev) => !prev
                  )
                }
                className="
                  mx-auto
                  mt-4
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#DDD6CC]
                  bg-white/70
                  px-4
                  py-2
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#55514C]
                  backdrop-blur-sm
                  transition-all
                  duration-300
                  hover:bg-[#F7F3ED]
                "
              >
                {showAllVouchers ? (
                  <>
                    Thu gọn
                    <ArrowUp size={11} />
                  </>
                ) : (
                  <>
                    Xem thêm voucher
                    <ArrowDown size={11} />
                  </>
                )}
              </button>
            )}
          </section>
        )}

      {/* =================================================
          PRODUCTS
      ================================================== */}

      <div className="w-full">
        <div>

          {/* LOADING */}

          {productsQ.isLoading ? (
            <div
              className="
                grid
                grid-cols-2
                gap-4
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-4
                2xl:grid-cols-4
              "
            >
              {Array.from({
                length: 6,
              }).map((_, i) => (
                <div
                  key={i}
                  className="
                    aspect-[4/5]
                    animate-pulse
                    rounded-md
                    bg-muted
                  "
                />
              ))}
            </div>

          ) : filtered.length === 0 ? (

            /* EMPTY */

            <div
              className="
                rounded-lg
                border
                border-dashed
                border-border
                p-16
                text-center
                text-muted-foreground
              "
            >
              Không tìm thấy sản phẩm phù hợp.
            </div>

          ) : (
            <>
              {/* =================================================
                  PRODUCT GRID
              ================================================== */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                  md:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-4
                  2xl:grid-cols-4
                "
              >
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      ...p,
                      old_price:
                        p.compare_at_price,
                    }}
                  />
                ))}
              </div>

              {/* =================================================
                  LIFESTYLE VIDEO
              ================================================== */}

              <section className="mt-10 w-full">
                <div
                  className="
                    relative
                    w-full
                    overflow-hidden
                    rounded-[10px]
                    bg-[#F7F5F2]
                  "
                >
                  <video
                    src="/videos/0825%20(9).mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="
                      block
                      h-auto
                      max-h-[720px]
                      w-full
                      object-cover
                    "
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* =================================================
          FLOATING SCROLL BUTTONS
      ================================================== */}

      <div
        className="
          fixed
          right-3
          top-1/2
          z-[100]
          flex
          -translate-y-1/2
          flex-col
          gap-1.5
        "
      >

        {/* UP */}

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          className="
            group
            relative
            flex
            h-8
            w-8
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-white/45
            bg-white/25
            text-black/50
            shadow-[0_3px_14px_rgba(0,0,0,0.06)]
            backdrop-blur-xl
            backdrop-saturate-125
            transition-all
            duration-300
            hover:bg-white/45
            hover:text-black/65
            hover:shadow-[0_5px_18px_rgba(0,0,0,0.09)]
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              -left-8
              top-0
              h-full
              w-3
              rotate-[25deg]
              bg-white/40
              blur-sm
              transition-all
              duration-700
              group-hover:left-[120%]
            "
          />

          <span
            className="
              pointer-events-none
              absolute
              inset-[1px]
              rounded-full
              border
              border-white/35
            "
          />

          <ArrowUp
            size={12}
            strokeWidth={1.7}
            className="
              relative
              z-10
              opacity-70
              transition-transform
              duration-300
              group-hover:-translate-y-0.5
            "
          />
        </button>

        {/* DOWN */}

        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Xuống cuối trang"
          className="
            group
            relative
            flex
            h-8
            w-8
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-white/45
            bg-white/25
            text-black/50
            shadow-[0_3px_14px_rgba(0,0,0,0.06)]
            backdrop-blur-xl
            backdrop-saturate-125
            transition-all
            duration-300
            hover:bg-white/45
            hover:text-black/65
            hover:shadow-[0_5px_18px_rgba(0,0,0,0.09)]
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              -left-8
              top-0
              h-full
              w-3
              rotate-[25deg]
              bg-white/40
              blur-sm
              transition-all
              duration-700
              group-hover:left-[120%]
            "
          />

          <span
            className="
              pointer-events-none
              absolute
              inset-[1px]
              rounded-full
              border
              border-white/35
            "
          />

          <ArrowDown
            size={12}
            strokeWidth={1.7}
            className="
              relative
              z-10
              opacity-70
              transition-transform
              duration-300
              group-hover:translate-y-0.5
            "
          />
        </button>

      </div>
    </div>
  );
}