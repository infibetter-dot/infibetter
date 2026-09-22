import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

import VoucherStats from "@/components/admin/VoucherStats";

import VoucherSearch from "@/components/admin/VoucherSearch";

import VoucherListItem, {
  type VoucherItem,
} from "@/components/admin/VoucherListItem";

import VoucherEditor, {
  type VoucherForm,
} from "@/components/admin/VoucherEditor";


/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute(
  "/_authenticated/admin/vouchers"
)({
  component: VoucherPage,
});


/* =========================================================
   EMPTY VOUCHER
========================================================= */

const emptyVoucher: VoucherForm = {
  code: "",

  title: "",

  description: "",

  type: "fixed",

  value: "" as unknown as number,

  min_order: "" as unknown as number,

  max_discount: "" as unknown as number,

  quantity: "" as unknown as number,

  used: 0,

  start_at: "",

  end_at: "",

  active: true,

  badge: "",

  badge_color: "",

  icon: "",

  apply_type: "all",

  apply_id: "",

  /* ===== Voucher Engine V2 ===== */

  manual_apply: false,

  auto_apply: false,

  usage_per_customer: 1,

  is_personal: false,

  show_home: false,
};


/* =========================================================
   PAGE
========================================================= */

function VoucherPage() {

  const [keyword, setKeyword] =
    useState("");

  const [editorOpen, setEditorOpen] =
    useState(false);

  const [voucher, setVoucher] =
    useState<VoucherForm>(
      emptyVoucher
    );

  const [vouchers, setVouchers] =
    useState<VoucherItem[]>([]);

  const [products, setProducts] =
    useState<
      {
        id: string;
        name: string;
      }[]
    >([]);

  const [categories, setCategories] =
    useState<
      {
        id: string;
        name: string;
      }[]
    >([]);


  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {

    loadVouchers();

    loadProducts();

    loadCategories();

  }, []);


  /* =======================================================
     LOAD VOUCHERS
  ======================================================= */

  async function loadVouchers() {

    console.log(
      "LOAD VOUCHERS RUN"
    );

    const {
      data,
      error,
    } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", {
        ascending: false,
      });


    console.log(
      "HOME VOUCHERS",
      data
    );

    console.log(
      "HOME ERROR",
      error
    );


    if (error) {

      toast.error(
        error.message
      );

      return;
    }


    setVouchers(
      (data ??
        []) as VoucherItem[]
    );
  }


  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  async function loadProducts() {

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(
        "id, name"
      )
      .order("name");


    console.log(
      "========== PRODUCTS =========="
    );

    console.log(
      "DATA:",
      data
    );

    console.log(
      "ERROR:",
      error
    );

    console.log(
      "=============================="
    );


    if (error) {

      console.error(
        error
      );

      return;
    }


    setProducts(
      data ?? []
    );
  }


  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  async function loadCategories() {

    const {
      data,
      error,
    } = await supabase
      .from("categories")
      .select(
        "id, name"
      )
      .order("name");


    if (error) {

      console.error(
        error
      );

      return;
    }


    setCategories(
      data ?? []
    );
  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filtered = useMemo(() => {

    const search =
      keyword
        .trim()
        .toLowerCase();


    if (!search) {

      return vouchers;
    }


    return vouchers.filter(
      (item) =>
        item.code
          .toLowerCase()
          .includes(search) ||

        item.title
          .toLowerCase()
          .includes(search)
    );

  }, [
    keyword,
    vouchers,
  ]);


  /* =======================================================
     VOUCHER STATS
  ======================================================= */

  const now =
    new Date();


  const active =
    vouchers.filter(
      (v) => {

        if (!v.active) {
          return false;
        }


        const start =
          v.start_at
            ? new Date(
                v.start_at
              )
            : null;


        const end =
          v.end_at
            ? new Date(
                v.end_at
              )
            : null;


        if (
          start &&
          start > now
        ) {
          return false;
        }


        if (
          end &&
          end < now
        ) {
          return false;
        }


        return true;
      }
    ).length;


  const scheduled =
    vouchers.filter(
      (v) => {

        if (
          !v.active ||
          !v.start_at
        ) {
          return false;
        }


        return (
          new Date(
            v.start_at
          ) > now
        );
      }
    ).length;


  const expired =
    vouchers.filter(
      (v) => {

        if (!v.end_at) {
          return false;
        }


        return (
          new Date(
            v.end_at
          ) < now
        );
      }
    ).length;


  console.log(
    "PRODUCTS STATE",
    products
  );


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      className="
        container-x
        space-y-6
        py-10
      "
    >

      {/* =================================================
          BACK TO DASHBOARD
      ================================================= */}

      <Link
        to="/account"
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-[#E6E2DA]
          bg-white
          px-4
          py-2
          text-xs
          font-medium
          text-[#555]
          shadow-sm
          transition-all
          duration-200
          hover:-translate-x-0.5
          hover:border-[#6F8B5E]
          hover:text-[#48633F]
          hover:shadow-md
        "
      >

        <ArrowLeft
          className="h-4 w-4"
          strokeWidth={1.7}
        />

        Quay lại Dashboard

      </Link>


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >

        <div>

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.22em]
              text-[#6F8B5E]
            "
          >
            Olive Living Admin
          </p>


          <h1
            className="
              mt-1
              font-display
              text-4xl
              font-medium
              text-[#252824]
            "
          >
            Quản lý Voucher
          </h1>


          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Quản lý toàn bộ voucher
            của Olive Living
          </p>

        </div>


        {/* ADD VOUCHER */}

        <button
          type="button"
          onClick={() => {

            setVoucher(
              emptyVoucher
            );

            setEditorOpen(
              true
            );

          }}
          className="
            rounded-lg
            bg-black
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition-all
            hover:bg-neutral-800
            active:scale-[0.98]
          "
        >
          + Thêm Voucher
        </button>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <VoucherStats
        total={
          vouchers.length
        }
        active={active}
        scheduled={
          scheduled
        }
        expired={expired}
      />


      {/* =================================================
          SEARCH
      ================================================= */}

      <VoucherSearch
        keyword={keyword}
        onKeywordChange={
          setKeyword
        }
      />


      {/* =================================================
          VOUCHER LIST
      ================================================= */}

      <div
        className="
          space-y-4
        "
      >

        {filtered.length ===
        0 ? (

          <div
            className="
              rounded-xl
              border
              bg-white
              p-8
              text-center
              text-muted-foreground
            "
          >
            Chưa có voucher.
          </div>

        ) : (

          filtered.map(
            (item) => (

              <VoucherListItem
                key={item.id}
                voucher={item}

                /* =========================================
                   EDIT
                ========================================= */

                onEdit={(v) => {

                  setVoucher({

                    ...v,

                    start_at:
                      v.start_at
                        ? new Date(
                            v.start_at
                          )
                            .toISOString()
                            .slice(
                              0,
                              16
                            )
                        : "",

                    end_at:
                      v.end_at
                        ? new Date(
                            v.end_at
                          )
                            .toISOString()
                            .slice(
                              0,
                              16
                            )
                        : "",


                    /* Voucher Engine V2 */

                    manual_apply:
                      v.manual_apply ??
                      false,

                    auto_apply:
                      v.auto_apply ??
                      false,

                    usage_per_customer:
                      v.usage_per_customer ??
                      1,

                    is_personal:
                      v.is_personal ??
                      false,

                    show_home:
                      v.show_home ??
                      false,

                  });


                  setEditorOpen(
                    true
                  );

                }}


                /* =========================================
                   DELETE
                ========================================= */

                onDelete={
                  async (v) => {

                    const ok =
                      window.confirm(
                        `Bạn có chắc muốn xóa voucher "${v.code}"?`
                      );


                    if (!ok) {
                      return;
                    }


                    const {
                      error,
                    } =
                      await supabase
                        .from(
                          "vouchers"
                        )
                        .delete()
                        .eq(
                          "id",
                          v.id
                        );


                    if (error) {

                      alert(
                        error.message
                      );

                      return;
                    }


                    toast.success(
                      "Đã xóa voucher"
                    );


                    await loadVouchers();

                  }
                }
              />

            )
          )

        )}

      </div>


      {/* =================================================
          VOUCHER EDITOR
      ================================================= */}

      <VoucherEditor
        open={
          editorOpen
        }

        voucher={
          voucher
        }

        products={
          products
        }

        categories={
          categories
        }

        onChange={
          setVoucher
        }

        onClose={() =>
          setEditorOpen(
            false
          )
        }


        /* ===============================================
           SAVE
        =============================================== */

        onSave={
          async () => {

            /* =============================================
               VALIDATION
            ============================================= */

            if (
              !voucher.code.trim()
            ) {

              alert(
                "Vui lòng nhập mã voucher."
              );

              return;
            }


            if (
              !voucher.title.trim()
            ) {

              alert(
                "Vui lòng nhập tên voucher."
              );

              return;
            }


            if (
              Number(
                voucher.value
              ) <= 0
            ) {

              alert(
                "Giá trị giảm phải lớn hơn 0."
              );

              return;
            }


            if (
              Number(
                voucher.quantity
              ) <= 0
            ) {

              alert(
                "Số lượng phát hành phải lớn hơn 0."
              );

              return;
            }


            if (
              voucher.start_at &&
              voucher.end_at &&
              new Date(
                voucher.end_at
              ) <
                new Date(
                  voucher.start_at
                )
            ) {

              alert(
                "Ngày kết thúc phải lớn hơn ngày bắt đầu."
              );

              return;
            }


            /* =============================================
               PAYLOAD
            ============================================= */

            const payload = {

              code:
                voucher.code,

              title:
                voucher.title,

              description:
                voucher.description,

              type:
                voucher.type,

              value:
                Number(
                  voucher.value
                ),

              min_order:
                Number(
                  voucher.min_order
                ),

              max_discount:
                Number(
                  voucher.max_discount
                ),

              quantity:
                Number(
                  voucher.quantity
                ),

              used:
                voucher.used,

              start_at:
                voucher.start_at ||
                null,

              end_at:
                voucher.end_at ||
                null,

              active:
                voucher.active,

              badge:
                voucher.badge,

              badge_color:
                voucher.badge_color,

              icon:
                voucher.icon,

              apply_type:
                voucher.apply_type,

              apply_id:
                voucher.apply_id ||
                null,


              /* =========================================
                 VOUCHER ENGINE V2
              ========================================= */

              manual_apply:
                voucher.manual_apply,

              auto_apply:
                voucher.auto_apply,

              usage_per_customer:
                Number(
                  voucher.usage_per_customer
                ),

              is_personal:
                voucher.is_personal,

              show_home:
                voucher.show_home,

            };


            /* =============================================
               SAVE TO SUPABASE
            ============================================= */

            let error:
              Error | null =
              null;


            /* =============================================
               UPDATE
            ============================================= */

            if (
              voucher.id
            ) {

              const result =
                await supabase
                  .from(
                    "vouchers"
                  )
                  .update(
                    payload
                  )
                  .eq(
                    "id",
                    voucher.id
                  );


              error =
                result.error;

            }


            /* =============================================
               INSERT
            ============================================= */

            else {

              const result =
                await supabase
                  .from(
                    "vouchers"
                  )
                  .insert(
                    payload
                  );


              error =
                result.error;

            }


            /* =============================================
               ERROR
            ============================================= */

            if (error) {

              console.error(
                error
              );

              alert(
                error.message
              );

              return;
            }


            /* =============================================
               SUCCESS
            ============================================= */

            toast.success(
              voucher.id
                ? "Đã cập nhật voucher"
                : "Đã tạo voucher"
            );


            await loadVouchers();


            setVoucher(
              emptyVoucher
            );


            setEditorOpen(
              false
            );

          }
        }
      />

    </div>
  );
}