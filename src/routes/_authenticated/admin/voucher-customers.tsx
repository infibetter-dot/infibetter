import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute } from "@tanstack/react-router";
import FlashSalePopup from "@/components/home/FlashSalePopup";

export const Route = createFileRoute(
  "/_authenticated/admin/voucher-customers"
)({
  component: VoucherCustomersPage,
});

function VoucherCustomersPage() {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
const [customerHistory, setCustomerHistory] = useState<any[]>([]);
const [detailOpen, setDetailOpen] = useState(false);
  const totalCustomers = customers.length;

const totalVoucherUsed = customers.reduce(
  (sum: number, item: any) => sum + item.totalVoucher,
  0
);

const totalDiscount = customers.reduce(
  (sum: number, item: any) => sum + item.totalDiscount,
  0
);

const totalOrders = totalVoucherUsed;

  useEffect(() => {
    loadCustomers();
  }, []);

  async function openCustomerDetail(phone: string) {
  const { data, error } = await supabase
    .from("voucher_usage")
    .select("*")
    .eq("phone", phone)
    .order("used_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return;
  }

  setCustomerHistory(data ?? []);
  setSelectedCustomer(data?.[0] ?? null);
  setDetailOpen(true);
}

  async function loadCustomers() {

 const { data } = await supabase
  .from("voucher_usage")
  .select("*")
  .order("used_at", {
    ascending: false,
  });

  

  console.log("VOUCHER_USAGE", data);

  const grouped = new Map();

data?.forEach((item: any) => {
  const key = item.phone;

  if (!grouped.has(key)) {
    grouped.set(key, {
      customer_name: item.customer_name,
      phone: item.phone,

      totalVoucher: 0,
      totalDiscount: 0,

      lastUsed: item.used_at,
    });
  }

  const customer = grouped.get(key);

  customer.totalVoucher += 1;

  customer.totalDiscount +=
    Number(item.discount_amount || 0) +
    Number(item.shipping_discount || 0);

  if (
    new Date(item.used_at) >
    new Date(customer.lastUsed)
  ) {
    customer.lastUsed = item.used_at;
  }
});

setCustomers(
  Array.from(grouped.values())
);

    setLoading(false);

  }

  if (loading) return <div>Loading...</div>;

  return (

<div className="mx-auto max-w-7xl p-8">

<div className="mb-8 flex items-center justify-between">

<div>

<p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
Voucher CRM
</p>

<h1 className="mt-2 text-4xl font-bold">
Khách hàng sử dụng Voucher
</h1>

<p className="mt-2 text-neutral-500">
Theo dõi lịch sử khách hàng đã sử dụng voucher trên website.
</p>

</div>

<div
  className="
  rounded-3xl
  bg-gradient-to-br
  from-emerald-500
  via-emerald-600
  to-emerald-700
  px-8
  py-6
  text-white
  shadow-[0_20px_50px_rgba(16,185,129,.25)]
  ring-1
  ring-white/20
  "
>

<div className="flex items-center gap-3">

  <div
    className="
    flex
    h-12
    w-12
    items-center
    justify-center
    rounded-2xl
    bg-white/15
    text-2xl
    backdrop-blur
    "
  >
    👥
  </div>

  <div>

    <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">
      Tổng khách
    </p>

    <p className="mt-1 text-4xl font-bold leading-none">
      {customers.length}
    </p>

  </div>

</div>

</div>

</div>
<input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Tìm theo tên hoặc số điện thoại..."
  className="
mb-8
w-full
rounded-2xl
border
border-neutral-300
bg-white
px-5
py-4
text-lg
outline-none
transition
focus:border-[#2E3528]
focus:ring-4
focus:ring-[#2E3528]/10
"
/>



<div className="overflow-hidden rounded-xl border">

<table className="min-w-full">

<thead className="bg-[#F8F6F2]">

<tr>

<th className="p-4 text-left">
  Khách hàng
</th>

<th className="p-4 text-left">
  SĐT
</th>

<th className="p-4 text-center">
  Lượt dùng
</th>

<th className="p-4 text-right">
  Tổng giảm
</th>

<th className="p-4 text-left">
  Lần gần nhất
</th>

<th className="p-4 text-center">
  Thao tác
</th>



</tr>

</thead>

<tbody>

{customers
  .filter((item: any) => {
    return (
      item.customer_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.phone?.includes(search)
    );
  })
  .map((item: any) => (
    <tr
      key={item.phone}
      className="
        border-t
        transition
        hover:bg-[#FAF7F3]
      "
    >
      <td className="p-4 font-medium">
        {item.customer_name}
      </td>

      <td className="p-4">
        {item.phone}
      </td>

      <td className="p-4 text-center">
        {item.totalVoucher}
      </td>

      <td className="p-4 text-right font-semibold text-green-600">
        {Number(item.totalDiscount).toLocaleString("vi-VN")}đ
      </td>

      <td className="p-4">
        {new Date(item.lastUsed).toLocaleDateString("vi-VN")}
      </td>

      <td className="p-4 text-center">
       <button
  onClick={() => openCustomerDetail(item.phone)}
  className="
    rounded-full
    bg-[#2E3528]
    px-4
    py-2
    text-sm
    font-medium
    text-white
    transition
    hover:bg-[#C77B55]
  "
>
  Chi tiết
</button>
      </td>
    </tr>
  ))}

</tbody>

</table>

</div>

{detailOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedCustomer?.customer_name}
          </h2>

          <p className="text-neutral-500">
            {selectedCustomer?.phone}
          </p>
        </div>

        <button
          onClick={() => setDetailOpen(false)}
          className="rounded-xl border px-4 py-2 hover:bg-neutral-100"
        >
          Đóng
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">
            Lượt dùng
          </p>

          <p className="mt-2 text-3xl font-bold">
            {customerHistory.length}
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">
            Tổng giảm
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {customerHistory
              .reduce(
                (sum, item) =>
                  sum +
                  Number(item.discount_amount || 0) +
                  Number(item.shipping_discount || 0),
                0
              )
              .toLocaleString("vi-VN")}
            đ
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">
            Voucher
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              new Set(
                customerHistory.map(
                  (x) => x.voucher_code
                )
              ).size
            }
          </p>
        </div>

      </div>

      <div className="overflow-hidden rounded-xl border">

        <table className="min-w-full">

          <thead className="bg-neutral-50">

            <tr>

              <th className="p-4 text-left">
                Voucher
              </th>

              <th className="p-4 text-left">
                Đơn hàng
              </th>

              <th className="p-4 text-right">
                Giảm
              </th>

              <th className="p-4 text-left">
                Ngày
              </th>

            </tr>

          </thead>

          <tbody>

            {customerHistory.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4 font-medium">
                  {item.voucher_code}
                </td>

                <td className="p-4">
                  #{item.order_id}
                </td>

                <td className="p-4 text-right text-green-600 font-semibold">
                  {(
                    Number(item.discount_amount || 0) +
                    Number(item.shipping_discount || 0)
                  ).toLocaleString("vi-VN")}
                  đ
                </td>

                <td className="p-4">
                  {new Date(item.used_at).toLocaleString("vi-VN")}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  </div>
)}

</div>

  );

}