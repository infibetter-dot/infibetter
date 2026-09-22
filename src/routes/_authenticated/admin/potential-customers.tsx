import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  Users,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/admin/potential-customers",
)({
  component: PotentialCustomersPage,
});

type PotentialCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  created_at: string;
  updated_at?: string;
  voucher_code?: string | null;
  voucher_discount?: number | null;
  voucher_discount_type?: string | null;
  voucher_max_discount?: number | null;
};

function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function maskPhone(phone: string) {
  if (!phone) return "-";

  if (phone.length < 7) {
    return phone;
  }

  return (
    phone.slice(0, 3) +
    "****" +
    phone.slice(-3)
  );
}

function PotentialCustomersPage() {
  const [customers, setCustomers] = useState<
    PotentialCustomer[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [keyword, setKeyword] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadCustomers(
    isRefresh = false,
  ) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const {
        data,
        error: queryError,
      } = await supabase
        .from("potential_customers")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        console.error(
          "LOAD POTENTIAL CUSTOMERS ERROR:",
          queryError,
        );

        setError(
          "Không thể tải danh sách khách tiềm năng.",
        );

        return;
      }

      const potentialCustomers =
        (data ?? []) as PotentialCustomer[];

      /*
       * Lấy voucher cá nhân đã cấp cho khách.
       * Voucher được liên kết với khách thông qua số điện thoại.
       */
      const phones = potentialCustomers
        .map((customer) => customer.phone)
        .filter(Boolean);

      let voucherMap = new Map<
        string,
        {
          voucher_code: string;
          discount: number;
          discount_type: string | null;
          max_discount: number | null;
        }
      >();

      if (phones.length > 0) {
        const {
          data: voucherData,
          error: voucherError,
        } = await supabase
          .from("customer_vouchers")
          .select(
            "phone, voucher_code, discount, discount_type, max_discount, created_at",
          )
          .in("phone", phones)
          .order("created_at", {
            ascending: false,
          });

        if (voucherError) {
          console.error(
            "LOAD CUSTOMER VOUCHERS ERROR:",
            voucherError,
          );
        } else {
          /*
           * Mỗi khách chỉ hiển thị voucher mới nhất.
           */
          for (const voucher of voucherData ?? []) {
            const phone = String(voucher.phone ?? "").trim();

            if (
              phone &&
              !voucherMap.has(phone)
            ) {
              const discountType =
                voucher.discount_type
                  ? String(
                      voucher.discount_type,
                    ).toLowerCase()
                  : null;

              /*
               * Voucher khách hàng mới hiện tại:
               * - Giảm 5%
               * - Tối đa 35.000đ
               *
               * Với voucher loại percent, admin sử dụng
               * đúng cấu hình welcome voucher hiện tại.
               */
              const discount =
                discountType === "percent"
                  ? 5
                  : Number(
                      voucher.discount ?? 0,
                    );

              const maxDiscount =
                discountType === "percent"
                  ? 35000
                  : voucher.max_discount !== null &&
                      voucher.max_discount !== undefined
                    ? Number(
                        voucher.max_discount,
                      )
                    : null;

              voucherMap.set(phone, {
                voucher_code: String(
                  voucher.voucher_code ?? "",
                ),
                discount,
                discount_type:
                  discountType,
                max_discount:
                  maxDiscount,
              });
            }
          }
        }
      }

      const customersWithVouchers =
        potentialCustomers.map((customer) => {
          const voucher = voucherMap.get(
            String(customer.phone ?? "").trim(),
          );

          return {
            ...customer,
            voucher_code:
              voucher?.voucher_code ?? null,
            voucher_discount:
              voucher?.discount ?? null,
            voucher_discount_type:
              voucher?.discount_type ?? null,
            voucher_max_discount:
              voucher?.max_discount ?? null,
          };
        });

      setCustomers(customersWithVouchers);
    } catch (err) {
      console.error(err);

      setError(
        "Có lỗi xảy ra khi tải dữ liệu.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers =
    useMemo(() => {
      const value =
        keyword.trim().toLowerCase();

      if (!value) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          customer.name
            ?.toLowerCase()
            .includes(value) ||
          customer.phone
            ?.toLowerCase()
            .includes(value) ||
          customer.email
            ?.toLowerCase()
            .includes(value) ||
          customer.voucher_code
            ?.toLowerCase()
            .includes(value),
      );
    }, [customers, keyword]);

  const totalCustomers =
    customers.length;

  const todayCustomers =
    customers.filter((customer) => {
      const date =
        new Date(customer.created_at);

      const today = new Date();

      return (
        date.getDate() ===
          today.getDate() &&
        date.getMonth() ===
          today.getMonth() &&
        date.getFullYear() ===
          today.getFullYear()
      );
    }).length;

  const emailCount =
    new Set(
      customers.map((customer) =>
        customer.email?.toLowerCase(),
      ),
    ).size;

  function exportCSV() {
    if (!filteredCustomers.length) {
      return;
    }

    const header = [
      "Họ tên",
      "Số điện thoại",
      "Email",
      "Mã voucher",
      "Giá trị voucher",
      "Nguồn",
      "Ngày đăng ký",
    ];

    const rows =
      filteredCustomers.map(
        (customer) => [
          customer.name,
          customer.phone,
          customer.email,
          customer.voucher_code || "Chưa cấp",
          customer.voucher_discount !== null &&
          customer.voucher_discount !== undefined
            ? customer.voucher_discount_type === "percent"
              ? `${Number(customer.voucher_discount).toLocaleString("vi-VN")}%${customer.voucher_max_discount ? ` · tối đa ${Number(customer.voucher_max_discount).toLocaleString("vi-VN")}đ` : ""}`
              : `${Number(customer.voucher_discount).toLocaleString("vi-VN")}đ`
            : "-",
          customer.source,
          formatDate(
            customer.created_at,
          ),
        ],
      );

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const safeValue =
              String(value ?? "");

            return `"${safeValue.replace(
              /"/g,
              '""',
            )}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.download =
      `olive-potential-customers-${date}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* BACK TO DASHBOARD */}
        <a
          href="/account"
          className="
            mb-5
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
        </a>

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-400">
              OLIVE LIVING ADMIN
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Khách tiềm năng
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Danh sách khách hàng đã đăng ký nhận ưu đãi.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadCustomers(true)
              }
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Làm mới
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={
                !filteredCustomers.length
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gray-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Download size={15} />

              Xuất CSV
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Tổng khách tiềm năng
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                  {totalCustomers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Users
                  size={19}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* TODAY */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Đăng ký hôm nay
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                  {todayCustomers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <CalendarDays
                  size={19}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Email có dữ liệu
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                  {emailCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Mail
                  size={19}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={17}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target.value,
                )
              }
              placeholder="Tìm theo họ tên, số điện thoại, email hoặc mã voucher..."
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                py-3
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-400
                focus:bg-white
              "
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Danh sách đăng ký
              </h2>

              <p className="mt-0.5 text-xs text-gray-400">
                {keyword
                  ? `${filteredCustomers.length} kết quả`
                  : `${customers.length} khách`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />

                Đang tải dữ liệu...
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Users
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700">
                Chưa có khách tiềm năng
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Khi khách đăng ký trên popup,
                dữ liệu sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] border-collapse">

                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Khách hàng
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Số điện thoại
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Mã voucher
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Giá trị voucher
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Nguồn
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Ngày đăng ký
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (
                      customer,
                      index,
                    ) => (
                      <tr
                        key={
                          customer.id
                        }
                        className="
                          border-b
                          border-gray-100
                          last:border-b-0
                          transition
                          hover:bg-gray-50
                        "
                      >
                        {/* NUMBER */}

                        <td className="px-5 py-4 text-xs text-gray-400">
                          {index + 1}
                        </td>

                        {/* NAME */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-gray-100
                              text-xs
                              font-semibold
                              text-gray-600
                            ">
                              {customer.name
                                ?.charAt(
                                  0,
                                )
                                ?.toUpperCase() ||
                                "?"}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {
                                  customer.name
                                }
                              </p>

                              <p className="text-[10px] text-gray-400">
                                Lead #
                                {customer.id.slice(
                                  0,
                                  8,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone
                              size={14}
                              className="text-gray-400"
                            />

                            {customer.phone}
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail
                              size={14}
                              className="text-gray-400"
                            />

                            {
                              customer.email
                            }
                          </div>
                        </td>

                        {/* VOUCHER CODE */}

                        <td className="px-5 py-4">
                          {customer.voucher_code ? (
                            <span className="
                              inline-flex
                              rounded-lg
                              border
                              border-emerald-100
                              bg-emerald-50
                              px-2.5
                              py-1.5
                              text-xs
                              font-semibold
                              tracking-wide
                              text-emerald-700
                            ">
                              {customer.voucher_code}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Chưa cấp
                            </span>
                          )}
                        </td>

                        {/* VOUCHER VALUE */}

                        <td className="px-5 py-4">
                          {customer.voucher_discount !== null &&
                          customer.voucher_discount !== undefined ? (
                            <span className="text-sm font-semibold text-gray-900">
                              {customer.voucher_discount_type ===
                              "percent" ? (
                                <>
                                  {Number(
                                    customer.voucher_discount,
                                  ).toLocaleString("vi-VN")}
                                  %
                                  {customer.voucher_max_discount ? (
                                    <span className="ml-1 text-xs font-normal text-gray-500">
                                      · tối đa{" "}
                                      {Number(
                                        customer.voucher_max_discount,
                                      ).toLocaleString("vi-VN")}
                                      đ
                                    </span>
                                  ) : null}
                                </>
                              ) : (
                                <>
                                  {Number(
                                    customer.voucher_discount,
                                  ).toLocaleString("vi-VN")}
                                  đ
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* SOURCE */}

                        <td className="px-5 py-4">
                          <span className="
                            inline-flex
                            rounded-full
                            bg-gray-100
                            px-2.5
                            py-1
                            text-[10px]
                            font-medium
                            text-gray-600
                          ">
                            {customer.source ===
                            "homepage_popup"
                              ? "Popup trang chủ"
                              : customer.source ||
                                "Không xác định"}
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">
                          <div className="text-xs text-gray-500">
                            {formatDate(
                              customer.created_at,
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}