import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Home,
  ShoppingBag,
  Truck,
  ShieldCheck,
  PackageCheck,
  CreditCard,
} from "lucide-react";

import { formatUSDFromVND } from "@/lib/format";

export const Route = createFileRoute(
  "/order-success"
)({
  component: OrderSuccessPage,
});

type OrderItem = {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;

  color_name?: string;
  color_hex?: string;
};

type VoucherInfo = {
  code: string;
  title?: string;
};

type OrderData = {
  id: string;
  created_at: string;

  full_name: string;
  phone: string;
  email?: string;

  address: string;

ward: string;

district: string;

city: string;

  payment_method: string;

  subtotal: number;

  shipping: number;

  discountAmount: number;

  shippingDiscount: number;

  total: number;

  discountVoucher?: VoucherInfo | null;

  shippingVoucher?: VoucherInfo | null;

  items: OrderItem[];
};

function OrderSuccessPage() {

  const [order, setOrder] =
    useState<OrderData | null>(null);

  useEffect(() => {

    const raw =
      localStorage.getItem(
        "olive_last_order"
      );

    if (!raw) return;

    try {

      setOrder(
        JSON.parse(raw)
      );

    } catch {

      localStorage.removeItem(
        "olive_last_order"
      );

    }

  }, []);

  if (!order) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F3] px-6">

        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">

          <PackageCheck
            className="mx-auto mb-5 text-neutral-300"
            size={54}
          />

          <h2 className="text-xl font-semibold">

            Không tìm thấy đơn hàng

          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-500">

            Có thể phiên làm việc đã hết
            hoặc bạn truy cập trực tiếp
            vào trang này.

          </p>

          <Link
            to="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90"
          >
            Về Trang chủ
          </Link>

        </div>

      </div>

    );

  }

  return (

<div className="min-h-screen bg-[#F8F6F3] pb-28">

<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

{/* Success */}

<div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-10">

<div className="flex justify-center">

<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">

<CheckCircle2
size={44}
className="text-green-600"
/>

</div>

</div>

<h1
className="
mt-6
text-center
text-3xl
font-semibold
tracking-tight
sm:text-4xl
"
>

Đặt hàng thành công

</h1>

<p
className="
mx-auto
mt-4
max-w-xl
text-center
text-sm
leading-7
text-neutral-500
sm:text-base
"
>

Cảm ơn bạn đã lựa chọn
<b> Olive Living</b>.

<br />

Đơn hàng của bạn đã được tiếp nhận.

Chúng tôi sẽ liên hệ xác nhận
trong thời gian sớm nhất.

</p>

{/* Status */}

<div
className="
mt-10
grid
gap-4
sm:grid-cols-3
"
>

<div className="rounded-2xl border bg-[#FAFAFA] p-5">

<div className="flex items-center gap-3">

<PackageCheck
size={22}
/>

<h3 className="font-medium">

Đã tiếp nhận

</h3>

</div>

<p className="mt-3 text-sm text-neutral-500">

Đơn hàng đã được ghi nhận.

</p>

</div>

<div className="rounded-2xl border bg-[#FAFAFA] p-5">

<div className="flex items-center gap-3">

<Truck
size={22}
/>

<h3 className="font-medium">

Chuẩn bị giao

</h3>

</div>

<p className="mt-3 text-sm text-neutral-500">

Sản phẩm sẽ được đóng gói cẩn thận.

</p>

</div>

<div className="rounded-2xl border bg-[#FAFAFA] p-5">

<div className="flex items-center gap-3">

<ShieldCheck
size={22}
/>

<h3 className="font-medium">

Bảo hành

</h3>

</div>

<p className="mt-3 text-sm text-neutral-500">

Hỗ trợ đổi mới nếu lỗi nhà sản xuất.

</p>

</div>

</div>

</div>

{/* ================= ORDER SUMMARY ================= */}

<div className="mt-8 grid gap-6 lg:grid-cols-2">

  {/* Thông tin đơn hàng */}

  <div className="rounded-[28px] bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-semibold">
      Thông tin đơn hàng
    </h2>

    <div className="space-y-5">

      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-neutral-500">
          Mã đơn hàng
        </span>

        <span className="font-semibold tracking-wider">
          #{order.id.slice(0,8).toUpperCase()}
        </span>

      </div>

      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-neutral-500">
          Ngày đặt
        </span>

        <span>

          {new Date(order.created_at).toLocaleDateString(
            "vi-VN"
          )}

        </span>

      </div>

      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-neutral-500">
          Thanh toán
        </span>

        

        <span className="flex items-center gap-2">

          <CreditCard size={18} />

          {order.payment_method === "cod"
            ? "Thanh toán khi nhận hàng"
            : "Chuyển khoản"}

        </span>

      </div>

      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-neutral-500">
          Tạm tính
        </span>

        <span>

          {formatUSDFromVND(order.subtotal)}

        </span>

      </div>

      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">

  <span className="text-neutral-500">
    Phí vận chuyển
  </span>

  <span>
    {formatUSDFromVND(order.shipping)}
  </span>

</div>

     {order.discountVoucher && (
    <div className="flex items-center justify-between border-b pb-3">

        <div>
            <p className="text-neutral-500">
                Voucher giảm giá
            </p>

            <p className="font-medium">
                {order.discountVoucher.code}
            </p>
        </div>

        <span className="text-green-600">
            -{formatUSDFromVND(order.discountAmount)}
        </span>

    </div>
)}

{order.shippingVoucher && (
    <div className="flex items-center justify-between border-b pb-3">

        <div>
            <p className="text-neutral-500">
                Voucher Freeship
            </p>

            <p className="font-medium">
                {order.shippingVoucher.code}
            </p>
        </div>

        <span className="text-green-600">
            -{formatUSDFromVND(order.shippingDiscount)}
        </span>

    </div>
)}

      <div className="flex items-center justify-between pt-2">

        <span className="text-lg font-semibold">
          Tổng thanh toán
        </span>

        <span className="text-2xl font-bold">

          {formatUSDFromVND(order.total)}

        </span>

      </div>

    </div>

  </div>



  {/* Thông tin khách hàng */}

  <div className="rounded-[28px] bg-white p-6 shadow-sm">

    <h2 className="mb-6 text-xl font-semibold">
      Thông tin giao hàng
    </h2>

    <div className="space-y-5">

      <div>

        <p className="text-sm text-neutral-500">

          Người nhận

        </p>

        <p className="mt-1 text-lg font-medium">

          {order.full_name}

        </p>

      </div>

      <div>

        <p className="text-sm text-neutral-500">

          Số điện thoại

        </p>

        <p className="mt-1">

          {order.phone}

        </p>

      </div>

      {order.email && (

        <div>

          <p className="text-sm text-neutral-500">

            Email

          </p>

          <p className="mt-1">

            {order.email}

          </p>

        </div>

      )}

      <div>

        <p className="text-sm text-neutral-500">

          Địa chỉ giao hàng

        </p>

        <p className="mt-1 leading-7">

  {order.address}

  <br />

  {[order.ward, order.district, order.city]
    .filter(Boolean)
    .join(", ")}

</p>

      </div>

      <div className="rounded-2xl bg-[#F7F4EF] p-5 sm:p-6">

        <p className="text-sm leading-7 text-neutral-600">

          Nhân viên Olive Living sẽ liên hệ với bạn trước khi
          giao hàng để xác nhận đơn hàng.

        </p>

      </div>

    </div>

  </div>

</div>

{/* ================= DANH SÁCH SẢN PHẨM ================= */}

<div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">

  <h2 className="text-xl font-semibold">
    Sản phẩm đã đặt
  </h2>

    <div className="mt-6 space-y-4">

  {order.items.map((item) => (
  <div
    key={item.id}
    className="rounded-2xl border border-neutral-200 p-4"
  >
    <div className="flex gap-4">

      {/* Ảnh */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {item.product_image && (
          <img
            src={item.product_image}
            alt={item.product_name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Nội dung */}
      <div className="min-w-0 flex-1">

        <h3 className="break-words text-base font-semibold leading-6">
          {item.product_name}
        </h3>

        {item.color_name && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border"
              style={{ background: item.color_hex }}
            />
            <span className="text-sm text-neutral-500">
              {item.color_name}
            </span>
          </div>
        )}

        <p className="mt-2 text-sm text-neutral-500">
          Số lượng: {item.quantity}
        </p>

        <p className="mt-3 text-lg font-semibold">
          {formatUSDFromVND(item.unit_price * item.quantity)}
        </p>

      </div>

    </div>
  </div>
))}

</div>

</div>





{/* ================= TIMELINE ================= */}

<div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">

<h2 className="text-xl font-semibold">

Trạng thái đơn hàng

</h2>

<div className="mt-8 space-y-8">

<div className="flex gap-5">

<div className="flex flex-col items-center">

<div className="h-5 w-5 rounded-full bg-green-600" />

<div className="mt-1 h-16 w-[2px] bg-neutral-200" />

</div>

<div>

<h3 className="font-semibold">

Đơn hàng đã được tiếp nhận

</h3>

<p className="mt-1 text-sm leading-6 text-neutral-500">

Olive Living đã nhận được đơn hàng của bạn.

</p>

</div>

</div>

<div className="flex gap-5 opacity-70">

<div className="flex flex-col items-center">

<div className="h-5 w-5 rounded-full border-2 border-neutral-300 bg-white" />

<div className="mt-1 h-16 w-[2px] bg-neutral-200" />

</div>

<div>

<h3 className="font-semibold">

Đang chuẩn bị hàng

</h3>

<p className="mt-1 text-sm leading-6 text-neutral-500">

Sản phẩm sẽ được kiểm tra và đóng gói.

</p>

</div>

</div>

<div className="flex gap-5 opacity-70">

<div className="flex flex-col items-center">

<div className="h-5 w-5 rounded-full border-2 border-neutral-300 bg-white" />

<div className="mt-1 h-16 w-[2px] bg-neutral-200" />

</div>

<div>

<h3 className="font-semibold">

Bàn giao đơn vị vận chuyển

</h3>

<p className="mt-1 text-sm leading-6 text-neutral-500">

Bạn sẽ nhận được cuộc gọi trước khi giao.

</p>

</div>

</div>

<div className="flex gap-5 opacity-70">

<div className="flex flex-col items-center">

<div className="h-5 w-5 rounded-full border-2 border-neutral-300 bg-white" />

</div>

<div>

<h3 className="font-semibold">

Giao hàng thành công

</h3>

<p className="mt-1 text-sm leading-6 text-neutral-500">

Cảm ơn bạn đã mua sắm tại Olive Living.

</p>

</div>

</div>

</div>

</div>





{/* ================= CAM KẾT ================= */}

<div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">

<h2 className="text-xl font-semibold">

Cam kết của Olive Living

</h2>

<div className="mt-6 grid gap-4 md:grid-cols-2">

<div className="rounded-2xl bg-[#F8F6F3] p-5">

<h3 className="font-medium">

Kiểm tra kỹ trước khi giao

</h3>

<p className="mt-2 text-sm leading-6 text-neutral-500">

Mỗi sản phẩm đều được kiểm tra chất lượng trước khi đóng gói.

</p>

</div>

<div className="rounded-2xl bg-[#F8F6F3] p-5">

<h3 className="font-medium">

Đổi mới 7 ngày

</h3>

<p className="mt-2 text-sm leading-6 text-neutral-500">

Hỗ trợ đổi mới nếu sản phẩm lỗi từ nhà sản xuất.

</p>

</div>

<div className="rounded-2xl bg-[#F8F6F3] p-5">

<h3 className="font-medium">

Đóng gói chống sốc

</h3>

<p className="mt-2 text-sm leading-6 text-neutral-500">

Đảm bảo hạn chế rủi ro trong quá trình vận chuyển.

</p>

</div>

<div className="rounded-2xl bg-[#F8F6F3] p-5">

<h3 className="font-medium">

Hỗ trợ khách hàng

</h3>

<p className="mt-2 text-sm leading-6 text-neutral-500">

Đội ngũ Olive Living luôn sẵn sàng hỗ trợ bạn.

</p>

</div>

</div>

</div>

{/* ================= CÓ THỂ BẠN SẼ THÍCH ================= */}


{/* ================= BUTTON ================= */}

<div className="mt-10 flex flex-col gap-4 sm:flex-row">

  <Link
    to="/shop"
    className="
    flex
    flex-1
    items-center
    justify-center
    rounded-full
    bg-black
    h-14
    text-white
    transition
    hover:opacity-90
    "
  >

    <ShoppingBag
      size={20}
      className="mr-2"
    />

    Tiếp tục mua sắm

  </Link>



  <Link
    to="/"
    className="
    flex
    flex-1
    items-center
    justify-center
    rounded-full
    border
    border-neutral-300
    bg-white
    h-14
    transition
    hover:bg-neutral-100
    "
  >

    <Home
      size={20}
      className="mr-2"
    />

    Về trang chủ

  </Link>

</div>



{/* ================= FOOTER ================= */}

<div className="mt-12 border-t pt-8">

  <div className="text-center">

    <h3 className="text-lg font-semibold">

      Cần hỗ trợ?

    </h3>

    <p className="mt-3 text-sm leading-7 text-neutral-500">

      Nếu bạn có bất kỳ câu hỏi nào về đơn hàng,
      vui lòng liên hệ Olive Living.

    </p>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

      <a
        href="tel:0934643451"
        className="rounded-full border px-6 py-3 transition hover:bg-neutral-100"
      >
        📞 0799379179
      </a>

      <a
        href="https://zalo.me/"
        target="_blank"
        className="rounded-full bg-[#0068FF] px-6 py-3 text-white transition hover:opacity-90"
      >
        Chat Zalo
      </a>

    </div>

  </div>

</div>

</div>

</div>
 );
}